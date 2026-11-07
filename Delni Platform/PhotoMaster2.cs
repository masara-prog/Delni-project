using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class PhotoMaster2 {
    public static void CropAndEnhance(
        string srcPath, 
        string dstPath, 
        double rx, double ry, double rw, double rh, 
        double contrast, double saturation, double brightness, 
        int targetWidth, double sharpenStrength) 
    {
        if (!File.Exists(srcPath)) {
            Console.WriteLine("Source missing: " + srcPath);
            return;
        }

        using (Bitmap srcImg = new Bitmap(srcPath)) {
            int cropX = (int)(rx * srcImg.Width);
            int cropY = (int)(ry * srcImg.Height);
            int cropW = (int)(rw * srcImg.Width);
            int cropH = (int)(rh * srcImg.Height);

            if (cropX < 0) cropX = 0;
            if (cropY < 0) cropY = 0;
            if (cropX + cropW > srcImg.Width) cropW = srcImg.Width - cropX;
            if (cropY + cropH > srcImg.Height) cropH = srcImg.Height - cropY;

            int outW = targetWidth > 0 ? targetWidth : Math.Max(cropW, 1200);
            int outH = (int)(cropH * ((double)outW / cropW));

            using (Bitmap rescaled = new Bitmap(outW, outH, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(rescaled)) {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;

                    float s = (float)saturation;
                    float rw_val = (1.0f - s) * 0.3086f;
                    float gw_val = (1.0f - s) * 0.6094f;
                    float bw_val = (1.0f - s) * 0.0820f;
                    float c = (float)contrast;
                    float b = ((float)brightness - 1.0f) + (1.0f - c) * 0.5f;

                    ColorMatrix cm = new ColorMatrix(new float[][] {
                        new float[] { (rw_val + s) * c,  gw_val * c,         bw_val * c,         0.0f, 0.0f },
                        new float[] { rw_val * c,         (gw_val + s) * c,  bw_val * c,         0.0f, 0.0f },
                        new float[] { rw_val * c,         gw_val * c,         (bw_val + s) * c,  0.0f, 0.0f },
                        new float[] { 0.0f,               0.0f,               0.0f,               1.0f, 0.0f },
                        new float[] { b,                  b,                  b,                  0.0f, 1.0f }
                    });

                    using (ImageAttributes ia = new ImageAttributes()) {
                        ia.SetColorMatrix(cm, ColorMatrixFlag.Default, ColorAdjustType.Bitmap);
                        Rectangle destRect = new Rectangle(0, 0, outW, outH);
                        g.DrawImage(srcImg, destRect, cropX, cropY, cropW, cropH, GraphicsUnit.Pixel, ia);
                    }
                }

                Bitmap finalBmp = rescaled;
                Bitmap sharpened = null;
                if (sharpenStrength > 0.05) {
                    sharpened = new Bitmap(outW, outH, PixelFormat.Format24bppRgb);
                    using (Graphics gs = Graphics.FromImage(sharpened)) {
                        gs.DrawImage(rescaled, 0, 0, outW, outH);
                    }

                    BitmapData data = sharpened.LockBits(new Rectangle(0, 0, outW, outH), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
                    int stride = data.Stride;
                    int bytesCount = Math.Abs(stride) * outH;
                    byte[] srcBytes = new byte[bytesCount];
                    byte[] dstBytes = new byte[bytesCount];
                    Marshal.Copy(data.Scan0, srcBytes, 0, bytesCount);
                    Array.Copy(srcBytes, dstBytes, bytesCount);

                    float str = (float)sharpenStrength;
                    float centerW = 1.0f + (4.0f * str);

                    for (int y = 1; y < outH - 1; y++) {
                        int rAbove = (y - 1) * stride;
                        int rCurr = y * stride;
                        int rBelow = (y + 1) * stride;

                        for (int x = 1; x < outW - 1; x++) {
                            int idx = rCurr + (x * 3);
                            for (int cIdx = 0; cIdx < 3; cIdx++) {
                                float center = srcBytes[idx + cIdx];
                                float top = srcBytes[rAbove + (x * 3) + cIdx];
                                float bottom = srcBytes[rBelow + (x * 3) + cIdx];
                                float left = srcBytes[rCurr + ((x - 1) * 3) + cIdx];
                                float right = srcBytes[rCurr + ((x + 1) * 3) + cIdx];

                                float val = (center * centerW) - ((top + bottom + left + right) * str);
                                if (val < 0) val = 0;
                                if (val > 255) val = 255;
                                dstBytes[idx + cIdx] = (byte)val;
                            }
                        }
                    }

                    Marshal.Copy(dstBytes, 0, data.Scan0, bytesCount);
                    sharpened.UnlockBits(data);
                    finalBmp = sharpened;
                }

                ImageCodecInfo jpegCodec = null;
                foreach (ImageCodecInfo codec in ImageCodecInfo.GetImageEncoders()) {
                    if (codec.MimeType == "image/jpeg") { jpegCodec = codec; break; }
                }

                EncoderParameters ep = new EncoderParameters(1);
                ep.Param[0] = new EncoderParameter(Encoder.Quality, 96L);

                string parent = Path.GetDirectoryName(dstPath);
                if (!Directory.Exists(parent)) Directory.CreateDirectory(parent);

                finalBmp.Save(dstPath, jpegCodec, ep);
                if (sharpened != null) sharpened.Dispose();
            }
        }
        Console.WriteLine("Mastered: " + dstPath);
    }
}
