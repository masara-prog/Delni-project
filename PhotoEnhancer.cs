using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class PhotoEnhancer {
    public static void ProcessImage(string srcPath, string dstPath, float contrast, float saturation, float brightness, int targetWidth, float sharpenStrength) {
        if (!File.Exists(srcPath)) {
            Console.WriteLine("File not found: " + srcPath);
            return;
        }

        using (Bitmap original = new Bitmap(srcPath)) {
            int w = targetWidth > 0 ? targetWidth : Math.Max(original.Width, 1400);
            int h = (int)(original.Height * ((double)w / original.Width));

            using (Bitmap rescaled = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(rescaled)) {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;

                    float s = saturation;
                    float rw = (1.0f - s) * 0.3086f;
                    float gw = (1.0f - s) * 0.6094f;
                    float bw = (1.0f - s) * 0.0820f;
                    float c = contrast;
                    float b = (brightness - 1.0f) + (1.0f - c) * 0.5f;

                    ColorMatrix cm = new ColorMatrix(new float[][] {
                        new float[] { (rw + s) * c,  gw * c,         bw * c,         0.0f, 0.0f },
                        new float[] { rw * c,         (gw + s) * c,  bw * c,         0.0f, 0.0f },
                        new float[] { rw * c,         gw * c,         (bw + s) * c,  0.0f, 0.0f },
                        new float[] { 0.0f,          0.0f,          0.0f,          1.0f, 0.0f },
                        new float[] { b,             b,             b,             0.0f, 1.0f }
                    });

                    using (ImageAttributes ia = new ImageAttributes()) {
                        ia.SetColorMatrix(cm, ColorMatrixFlag.Default, ColorAdjustType.Bitmap);
                        g.DrawImage(original, new Rectangle(0, 0, w, h), 0, 0, original.Width, original.Height, GraphicsUnit.Pixel, ia);
                    }
                }

                Bitmap finalBmp = rescaled;
                Bitmap sharpened = null;
                if (sharpenStrength > 0.05f) {
                    sharpened = new Bitmap(w, h, PixelFormat.Format24bppRgb);
                    using (Graphics gs = Graphics.FromImage(sharpened)) {
                        gs.DrawImage(rescaled, 0, 0, w, h);
                    }

                    BitmapData data = sharpened.LockBits(new Rectangle(0, 0, w, h), ImageLockMode.ReadWrite, PixelFormat.Format24bppRgb);
                    int stride = data.Stride;
                    int bytesCount = Math.Abs(stride) * h;
                    byte[] srcBytes = new byte[bytesCount];
                    byte[] dstBytes = new byte[bytesCount];
                    Marshal.Copy(data.Scan0, srcBytes, 0, bytesCount);
                    Array.Copy(srcBytes, dstBytes, bytesCount);

                    float str = sharpenStrength;
                    float centerW = 1.0f + (4.0f * str);

                    for (int y = 1; y < h - 1; y++) {
                        int rAbove = (y - 1) * stride;
                        int rCurr = y * stride;
                        int rBelow = (y + 1) * stride;

                        for (int x = 1; x < w - 1; x++) {
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
        Console.WriteLine("Enhanced and saved: " + dstPath);
    }
}
