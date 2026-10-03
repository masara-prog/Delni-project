Add-Type -AssemblyName System.Drawing

$img1Path = "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790072243242.jpg"
$img2Path = "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790072250254.jpg"

$outDir = "C:\Users\i7\Desktop\libya-journeys-pro-main (4)\libya-journeys-pro-main\public\assets\cropped"
if (-not (Test-Path $outDir)) { New-Item -ItemType Directory -Path $outDir -Force | Out-Null }

$bmp1 = [System.Drawing.Bitmap]::new($img1Path)
$bmp2 = [System.Drawing.Bitmap]::new($img2Path)

function Crop-And-Save($srcBmp, $rect, $outName) {
    # Inset slightly (2 px) to avoid any outer border
    $cropRect = [System.Drawing.Rectangle]::new($rect.X + 2, $rect.Y + 2, $rect.Width - 4, $rect.Height - 4)
    $dest = [System.Drawing.Bitmap]::new($cropRect.Width, $cropRect.Height)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($srcBmp, [System.Drawing.Rectangle]::new(0, 0, $cropRect.Width, $cropRect.Height), $cropRect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    
    $fullPath = Join-Path $outDir $outName
    $dest.Save($fullPath, [System.Drawing.Imaging.ImageFormat]::Jpeg)
    $dest.Dispose()
    Write-Host "Saved: $fullPath ($($cropRect.Width)x$($cropRect.Height))"
}

# Image 1 crops (highest resolution for the main 6 landmarks):
# 1. Sabratha theater
Crop-And-Save $bmp1 ([System.Drawing.Rectangle]::new(16, 18, 493, 265)) "sabratha_theater.jpg"
# 2. Acacus rock arch
Crop-And-Save $bmp1 ([System.Drawing.Rectangle]::new(518, 18, 491, 203)) "acacus_arch.jpg"
# 3. Tripoli Gurgi street
Crop-And-Save $bmp1 ([System.Drawing.Rectangle]::new(518, 228, 213, 177)) "tripoli_gurgi_street.jpg"
# 4. Tripoli Marcus Aurelius Arch
Crop-And-Save $bmp1 ([System.Drawing.Rectangle]::new(740, 228, 269, 177)) "tripoli_marcus_arch.jpg"
# 5. Ghadames old town aerial
Crop-And-Save $bmp1 ([System.Drawing.Rectangle]::new(16, 288, 493, 265)) "ghadames_old_town.jpg"
# 6. Cyrene Shahhat temple green mountain & sea
Crop-And-Save $bmp1 ([System.Drawing.Rectangle]::new(518, 408, 491, 145)) "cyrene_temple_coast.jpg"

# Image 2 additional crops:
# 7. Gharyan troglodyte cave house 1
Crop-And-Save $bmp2 ([System.Drawing.Rectangle]::new(516, 152, 117, 73)) "gharyan_cave_house.jpg"
# 8. Desert Ksar / Nalut / Kabaw
Crop-And-Save $bmp2 ([System.Drawing.Rectangle]::new(518, 410, 129, 73)) "desert_ksar_castle.jpg"
# 9. Gharyan cave house interior courtyard
Crop-And-Save $bmp2 ([System.Drawing.Rectangle]::new(654, 408, 107, 77)) "gharyan_cave_courtyard.jpg"
# 10. Coast port / Benghazi harbor
Crop-And-Save $bmp2 ([System.Drawing.Rectangle]::new(518, 488, 213, 65)) "libya_harbor_coast.jpg"
# 11. Roman theater front view
Crop-And-Save $bmp2 ([System.Drawing.Rectangle]::new(772, 410, 237, 143)) "roman_theater_front.jpg"

$bmp1.Dispose()
$bmp2.Dispose()
