<?php

namespace App\Support;

use Illuminate\Validation\ValidationException;

/**
 * Saves a "data:image/...;base64," value as a file under the frontend's public/uploads (same place the Node bridge used),
 * so the database stores a short path instead of the whole image.
 */
class Base64Image
{
    private const TYPES = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif'];

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
        $dir = base_path('../public/uploads/' . $folder);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $prefix) . '-' . (int) (microtime(true) * 1000) . '.' . $ext;
        file_put_contents($dir . DIRECTORY_SEPARATOR . $name, $bytes);

        return '/uploads/' . $folder . '/' . $name;
    }
}
