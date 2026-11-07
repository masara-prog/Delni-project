using System;
using System.IO;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public class DesertEnhancer {
    public static void CleanAndEnhance(string srcPath, string dstPath, bool hasWatermark, double contrast, double saturation, double brightness, int targetWidth, double sharpenStrength) {
        if (!File.Exists(srcPath)) return;

        using (Bitmap original = new Bitmap(srcPath)) {
            // Step 1: If has watermark at bottom-right, seamlessly blend from adjacent patch
            if (hasWatermark) {
                // Watermark bounding box in 1024x683 is approx: x: 910..1024, y: 590..683
                int boxW = (int)(original.Width * 0.12);
                int boxH = (int)(original.Height * 0.14);
                int boxX = original.Width - boxW - 2;
                int boxY = original.Height - boxH - 2;

                int srcSampleX = boxX - boxW - 5;
                int srcSampleY = boxY;

                using (Graphics gClean = Graphics.FromImage(original)) {
                    // Clone texture from adjacent area
                    Rectangle srcRect = new Rectangle(srcSampleX, srcSampleY, boxW, boxH);
                    Rectangle destRect = new Rectangle(boxX, boxY, boxW, boxH);
                    gClean.DrawImage(original, destRect, srcRect, GraphicsUnit.Pixel);
                }
            }

            // Step 2: High Quality Rescale + Color Grading
            int w = targetWidth > 0 ? targetWidth : 1600;
            int h = (int)(original.Height * ((double)w / original.Width));

            using (Bitmap rescaled = new Bitmap(w, h, PixelFormat.Format32bppArgb)) {
                using (Graphics g = Graphics.FromImage(rescaled)) {
                    g.InterpolationMode = InterpolationMode.HighQualityBicubic;
                    g.SmoothingMode = SmoothingMode.HighQuality;
                    g.PixelOffsetMode = PixelOffsetMode.HighQuality;
                    g.CompositingQuality = CompositingQuality.HighQuality;

                    float s = (float)saturation;
                    float rw = (1.0f - s) * 0.3086f;
                    float gw = (1.0f - s) * 0.6094f;
                    float bw = (1.0f - s) * 0.0820f;
                    float c = (float)contrast;
                    float b = ((float)brightness - 1.0f) + (1.0f - c) * 0.5f;

                    ColorMatrix cm = new ColorMatrix(new float[][] {
                        new float[] { (rw + s) * c,  gw * c,         bw * c,         0.0f, 0.0f },
                        new float[] { rw * c,         (gw + s) * c,  bw * c,         0.0f, 0.0f },
                        new float[] { rw * c,         gw * c,         (bw + s) * c,  0.0f, 0.0f },
                        new float[] { 0.0f,           0.0f,           0.0f,           1.0f, 0.0f },
                        new float[] { b,              b,              b,              0.0f, 1.0f }
                    });

                    using (ImageAttributes ia = new ImageAttributes()) {
                        ia.SetColorMatrix(cm, ColorMatrixFlag.Default, ColorAdjustType.Bitmap);
                        g.DrawImage(original, new Rectangle(0, 0, w, h), 0, 0, original.Width, original.Height, GraphicsUnit.Pixel, ia);
                    }
                }

                Bitmap finalBmp = rescaled;
                Bitmap sharpened = null;
                if (sharpenStrength > 0.05) {
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

                    float str = (float)sharpenStrength;
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
        Console.WriteLine("Enhanced desert photo: " + dstPath);
    }
}
