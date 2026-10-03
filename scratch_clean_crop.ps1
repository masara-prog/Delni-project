Add-Type -AssemblyName System.Drawing

$img1Path = "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790072243242.jpg"
$img2Path = "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790072250254.jpg"

$outDir = "C:\Users\i7\Desktop\libya-journeys-pro-main (4)\libya-journeys-pro-main\public\assets"
$srcDir = "C:\Users\i7\Desktop\libya-journeys-pro-main (4)\libya-journeys-pro-main\src\assets"

$bmp1 = [System.Drawing.Bitmap]::new($img1Path)
$bmp2 = [System.Drawing.Bitmap]::new($img2Path)

function Clean-Crop($srcBmp, $x, $y, $w, $h, $name, $bottomInset = 18, $rightInset = 12) {
    $cropX = $x + 6
    $cropY = $y + 6
    $cropW = $w - (6 + $rightInset)
    $cropH = $h - (6 + $bottomInset)
    
    $dest = [System.Drawing.Bitmap]::new($cropW, $cropH)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    $srcRect = [System.Drawing.Rectangle]::new($cropX, $cropY, $cropW, $cropH)
    $destRect = [System.Drawing.Rectangle]::new(0, 0, $cropW, $cropH)
    $g.DrawImage($srcBmp, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    # Save to both locations
    $p1 = Join-Path $outDir "$name.jpg"
    $dest.Save($p1, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $p2 = Join-Path $srcDir "$name.jpg"
    $dest.Save($p2, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    
    $dest.Dispose()
    Write-Host "Exported cleanly: $name ($cropW x $cropH)"
}

# Image 1 (large high quality):
# 1. Sabratha Roman Theater
Clean-Crop $bmp1 16 18 493 265 "dest-sabratha" 18 10
# 2. Acacus Rock Arch
Clean-Crop $bmp1 518 18 491 203 "dest-acacus" 18 10
# 3. Tripoli Gurgi street
Clean-Crop $bmp1 518 228 213 177 "dest-tripoli-old-city" 22 10
# 4. Tripoli Marcus Aurelius Arch
Clean-Crop $bmp1 740 228 269 177 "dest-tripoli-marcus-arch" 22 10
# 5. Ghadames Old Town Aerial
Clean-Crop $bmp1 16 288 493 265 "dest-ghadames" 18 10
# 6. Cyrene Temple of Apollo / Zeus & Sea
Clean-Crop $bmp1 518 408 491 145 "dest-cyrene" 20 10

# Image 2 (special sights):
# 7. Gharyan Troglodyte House
Clean-Crop $bmp2 516 152 117 73 "dest-gharyan-cave" 14 8
# 8. Berber Ksar Castle (Nalut / Kabaw)
Clean-Crop $bmp2 518 410 129 73 "dest-ksar-desert" 14 8
# 9. Gharyan Courtyard
Clean-Crop $bmp2 654 408 107 77 "dest-gharyan-courtyard" 14 8
# 10. Seaport / Coast
Clean-Crop $bmp2 518 488 213 65 "dest-harbor-coast" 14 8

$bmp1.Dispose()
$bmp2.Dispose()
