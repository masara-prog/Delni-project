Add-Type -AssemblyName System.Drawing

function Enhance-Image {
    param(
        [string]$inputPath,
        [string]$outputPath,
        [float]$contrast = 1.15,
        [float]$saturation = 1.20,
        [float]$brightness = 1.02,
        [int]$targetWidth = 0,
        [int]$targetHeight = 0,
        [bool]$sharpen = $true
    )

    $src = [System.Drawing.Bitmap]::FromFile($inputPath)
    $w = if ($targetWidth -gt 0) { $targetWidth } else { [Math]::Max($src.Width, 1280) }
    $h = if ($targetHeight -gt 0) { $targetHeight } else { [int]($src.Height * ($w / $src.Width)) }

    # Step 1: High Quality Bicubic Resize + Color Matrix
    $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    # Color adjustment matrix (Contrast + Brightness + Saturation)
    # Saturation weights for luminance: 0.3086, 0.6094, 0.0820
    $s = $saturation
    $rw = (1.0 - $s) * 0.3086
    $gw = (1.0 - $s) * 0.6094
    $bw = (1.0 - $s) * 0.0820

    $c = $contrast
    $b = ($brightness - 1.0) + (1.0 - $c) * 0.5

    $matrixValues = @(
        @( ($rw + $s) * $c,  $gw * $c,         $bw * $c,         0.0, 0.0 ),
        @( $rw * $c,         ($gw + $s) * $c,  $bw * $c,         0.0, 0.0 ),
        @( $rw * $c,         $gw * $c,         ($bw + $s) * $c,  0.0, 0.0 ),
        @( 0.0,              0.0,              0.0,              1.0, 0.0 ),
        @( $b,               $b,               $b,               0.0, 1.0 )
    )

    $colorMatrix = New-Object System.Drawing.Imaging.ColorMatrix( ,$matrixValues )
    $attr = New-Object System.Drawing.Imaging.ImageAttributes
    $attr.SetColorMatrix($colorMatrix, [System.Drawing.Imaging.ColorMatrixFlag]::Default, [System.Drawing.Imaging.ColorAdjustType]::Bitmap)

    $rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
    $g.DrawImage($src, $rect, 0, 0, $src.Width, $src.Height, [System.Drawing.GraphicsUnit]::Pixel, $attr)
    $g.Dispose()
    $src.Dispose()

    # Step 2: Unsharp Mask / Sharpening filter using LockBits
    if ($sharpen) {
        $finalBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $gFinal = [System.Drawing.Graphics]::FromImage($finalBmp)
        $gFinal.DrawImage($bmp, 0, 0, $w, $h)
        $gFinal.Dispose()
        $bmp.Dispose()

        # Fast 3x3 unsharp convolution kernel:
        # [ 0,  -0.3,   0 ]
        # [-0.3, 2.2, -0.3]
        # [ 0,  -0.3,   0 ]
        $rectLock = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
        $srcData = $finalBmp.LockBits($rectLock, [System.Drawing.Imaging.ImageLockMode]::ReadOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $stride = $srcData.Stride
        $bytes = [Math]::Abs($stride) * $h
        $srcBytes = New-Object byte[] $bytes
        [System.Runtime.InteropServices.Marshal]::Copy($srcData.Scan0, $srcBytes, 0, $bytes)
        $finalBmp.UnlockBits($srcData)

        $dstBytes = New-Object byte[] $bytes
        [Array]::Copy($srcBytes, $dstBytes, $bytes)

        $sharpenStrength = 0.35
        $centerWeight = 1.0 + (4.0 * $sharpenStrength)

        for ($y = 1; $y -lt ($h - 1); $y++) {
            $rowAbove = ($y - 1) * $stride
            $rowCurrent = $y * $stride
            $rowBelow = ($y + 1) * $stride

            for ($x = 1; $x -lt ($w - 1); $x++) {
                $idx = $rowCurrent + ($x * 3)

                for ($cIdx = 0; $cIdx -lt 3; $cIdx++) {
                    $center = [double]$srcBytes[$idx + $cIdx]
                    $top    = [double]$srcBytes[$rowAbove + ($x * 3) + $cIdx]
                    $bottom = [double]$srcBytes[$rowBelow + ($x * 3) + $cIdx]
                    $left   = [double]$srcBytes[$rowCurrent + (($x - 1) * 3) + $cIdx]
                    $right  = [double]$srcBytes[$rowCurrent + (($x + 1) * 3) + $cIdx]

                    $val = ($center * $centerWeight) - (($top + $bottom + $left + $right) * $sharpenStrength)
                    if ($val -lt 0) { $val = 0 }
                    if ($val -gt 255) { $val = 255 }
                    $dstBytes[$idx + $cIdx] = [byte]$val
                }
            }
        }

        $resBmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        $dstData = $resBmp.LockBits($rectLock, [System.Drawing.Imaging.ImageLockMode]::WriteOnly, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
        [System.Runtime.InteropServices.Marshal]::Copy($dstBytes, 0, $dstData.Scan0, $bytes)
        $resBmp.UnlockBits($dstData)
        $finalBmp.Dispose()
        $bmp = $resBmp
    }

    # Save with JPEG Quality 96
    $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq "image/jpeg" }
    $encParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
    $encParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, [long]96)

    $bmp.Save($outputPath, $codec, $encParams)
    $bmp.Dispose()
    Write-Output "Enhanced -> $outputPath ($w x $h)"
}

$testIn = "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790073269403.png"
$testOut = "C:\Users\i7\Desktop\libya-journeys-pro-main (4)\libya-journeys-pro-main\public\assets\test-enhanced.jpg"
Enhance-Image -inputPath $testIn -outputPath $testOut -contrast 1.20 -saturation 1.25 -sharpen $true
