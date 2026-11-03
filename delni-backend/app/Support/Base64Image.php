<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

/**
 * Saves a "data:image/...;base64," value as a file under the frontend's public/uploads (same place the Node bridge used),
 * so the database stores a short path instead of the whole image.
 */
class Base64Image
{
    private const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/avif' => 'avif'];
    private const MAX_SIDE = 1600;
    private const QUALITY = 82;

    public static function store(?string $value, string $prefix, string $folder = 'trips'): ?string
    {
        if ($value === null) {
            return null;
        }
        $value = trim($value);
        // A path or URL is kept as it is; any embedded data must be a supported image (an SVG or other data would
        // otherwise be stored as text and served back as the "image")
        if (!str_starts_with($value, 'data:')) {
            return $value;
        }
        $bytes = preg_match('/^data:[^;,]*;base64,(.+)$/s', $value, $m) ? base64_decode($m[1], true) : false;
        // Only real raster images become files: the declared type is ignored and the bytes decide
        // (an "image/svg" or "image/html" upload would otherwise be served as a page from the site's own origin)
        $ext = $bytes === false ? null : (self::TYPES[(new \finfo(FILEINFO_MIME_TYPE))->buffer($bytes)] ?? null);
        if ($ext === null) {
            throw ValidationException::withMessages(['image' => 'صيغة الصورة غير مدعومة؛ يرجى رفع صورة JPG أو PNG أو WEBP']);
        }
        [$bytes, $ext] = self::shrink($bytes, $ext);

        return self::save($bytes, $ext, $prefix, $folder);
    }

    /** Writes image bytes under public/uploads/<folder> and returns the site path. */
    public static function save(string $bytes, string $ext, string $prefix, string $folder): string
    {
        $dir = base_path('../public/uploads/' . $folder);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $prefix) . '-' . (int) (microtime(true) * 1000) . '.' . $ext;
        file_put_contents($dir . DIRECTORY_SEPARATOR . $name, $bytes);

        return '/uploads/' . $folder . '/' . $name;
    }

    /**
     * Scales a large photo down (longest side MAX_SIDE px) and re-encodes it as JPEG, when PHP has GD.
     * GIFs, images GD cannot read, and results that would not be smaller are kept as they are.
     */
    public static function shrink(string $bytes, string $ext): array
    {
        if ($ext === 'gif' || !function_exists('imagecreatefromstring')) {
            return [$bytes, $ext];
        }
        $src = @imagecreatefromstring($bytes);
        if ($src === false) {
            return [$bytes, $ext];
        }
        $w = imagesx($src);
        $h = imagesy($src);
        $scale = min(1, self::MAX_SIDE / max($w, $h));
        $nw = max(1, (int) round($w * $scale));
        $nh = max(1, (int) round($h * $scale));
        $dst = imagecreatetruecolor($nw, $nh);
        // Transparent PNG areas become white in the JPEG
        imagefill($dst, 0, 0, imagecolorallocate($dst, 255, 255, 255));
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $nw, $nh, $w, $h);
        ob_start();
        imagejpeg($dst, null, self::QUALITY);
        $jpeg = (string) ob_get_clean();
        imagedestroy($src);
        imagedestroy($dst);

        return $jpeg !== '' && strlen($jpeg) < strlen($bytes) ? [$jpeg, 'jpg'] : [$bytes, $ext];
    }
}
