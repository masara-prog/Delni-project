Add-Type -AssemblyName System.Drawing

function Find-Boxes($imgPath, $name) {
    $bmp = [System.Drawing.Bitmap]::new($imgPath)
    $w = $bmp.Width
    $h = $bmp.Height

    # A pixel is considered "part of a photo" if it's NOT near the gray background (221, 221, 221)
    # AND not pure white (255, 255, 255) margin
    # Let's create a boolean mask for pixels that are photo content.
    # Gray background has R ~ 210..230, G ~ 210..230, B ~ 210..230 and |R-G| < 10 and |G-B| < 10
    # White border has R > 240, G > 240, B > 240
    
    Write-Host "Analyzing $name ($w x $h)..."
    
    # We can detect rectangles by scanning horizontal & vertical projections or flood fill
    # Let's create an 2D array of isContent
    $isContent = New-Object 'bool[,]' $w, $h
    for ($y = 0; $y -lt $h; $y++) {
        for ($x = 0; $x -lt $w; $x++) {
            $c = $bmp.GetPixel($x, $y)
            $isGray = ($c.R -gt 210 -and $c.R -lt 230 -and [Math]::Abs($c.R - $c.G) -lt 8 -and [Math]::Abs($c.G - $c.B) -lt 8)
            $isWhite = ($c.R -gt 248 -and $c.G -gt 248 -and $c.B -gt 248)
            if (-not $isGray -and -not $isWhite) {
                $isContent[$x, $y] = $true
            }
        }
    }
    
    # Simple connected components / bounding box clustering
    # Since the photos are neat rectangles separated by margins, let's find connected components
    $visited = New-Object 'bool[,]' $w, $h
    $boxes = [System.Collections.Generic.List[psobject]]::new()
    
    for ($y = 0; $y -lt $h; $y += 2) {
        for ($x = 0; $x -lt $w; $x += 2) {
            if ($isContent[$x, $y] -and -not $visited[$x, $y]) {
                # BFS to find bounds
                $minX = $x; $maxX = $x; $minY = $y; $maxY = $y
                $queue = [System.Collections.Generic.Queue[System.Drawing.Point]]::new()
                $queue.Enqueue([System.Drawing.Point]::new($x, $y))
                $visited[$x, $y] = $true
                $count = 0
                
                while ($queue.Count -gt 0) {
                    $pt = $queue.Dequeue()
                    $count++
                    if ($pt.X -lt $minX) { $minX = $pt.X }
                    if ($pt.X -gt $maxX) { $maxX = $pt.X }
                    if ($pt.Y -lt $minY) { $minY = $pt.Y }
                    if ($pt.Y -gt $maxY) { $maxY = $pt.Y }
                    
                    # Check 4 neighbors with step 2
                    $neighbors = @(
                        [System.Drawing.Point]::new($pt.X + 2, $pt.Y),
                        [System.Drawing.Point]::new($pt.X - 2, $pt.Y),
                        [System.Drawing.Point]::new($pt.X, $pt.Y + 2),
                        [System.Drawing.Point]::new($pt.X, $pt.Y - 2)
                    )
                    foreach ($n in $neighbors) {
                        if ($n.X -ge 0 -and $n.X -lt $w -and $n.Y -ge 0 -and $n.Y -lt $h) {
                            if ($isContent[$n.X, $n.Y] -and -not $visited[$n.X, $n.Y]) {
                                $visited[$n.X, $n.Y] = $true
                                $queue.Enqueue($n)
                            }
                        }
                    }
                }
                
                # Only keep significant components (width > 40 and height > 40)
                $bw = $maxX - $minX + 1
                $bh = $maxY - $minY + 1
                if ($bw -gt 40 -and $bh -gt 40 -and $count -gt 200) {
                    $boxes.Add([pscustomobject]@{
                        X = $minX
                        Y = $minY
                        Width = $bw
                        Height = $bh
                        PixelCount = $count
                    })
                }
            }
        }
    }
    
    $bmp.Dispose()
    Write-Host "Found $($boxes.Count) boxes in $name"
    $boxes | Format-Table -AutoSize
}

Find-Boxes "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790072243242.jpg" "Image 1"
Find-Boxes "C:\Users\i7\.gemini\antigravity-ide\brain\3b0ca89e-2e53-45f2-b417-e89cbce77495\.user_uploaded\media_1790072250254.jpg" "Image 2"
