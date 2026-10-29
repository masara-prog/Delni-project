<?php

namespace App\Support;

/**
 * Saves a "data:image/...;base64," value as a file under the frontend's public/uploads (same place the Node bridge used),
 * so the database stores a short path instead of the whole image.
 */
class Base64Image
{
    public static function store(?string $value, string $prefix, string $folder = 'trips'): ?string
    {
        if ($value === null) {
            return null;
        }
        $value = trim($value);
        if (!preg_match('/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/s', $value, $m)) {
            return $value;
        }
        $bytes = base64_decode($m[2], true);
        if ($bytes === false) {
            return $value;
        }

        $ext = strtolower($m[1]) === 'jpeg' ? 'jpg' : strtolower($m[1]);
        $dir = base_path('../public/uploads/' . $folder);
        if (!is_dir($dir)) {
            mkdir($dir, 0775, true);
        }
        $name = preg_replace('/[^a-zA-Z0-9_-]/', '_', $prefix) . '-' . (int) (microtime(true) * 1000) . '.' . $ext;
        file_put_contents($dir . DIRECTORY_SEPARATOR . $name, $bytes);

        return '/uploads/' . $folder . '/' . $name;
    }
}
