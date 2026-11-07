<?php
/*
 * Moves images stored as "data:image/...;base64," text into files under public/uploads (compressed with GD)
 * and writes the short path back into the same column. Approved 2026-11-03, backup v15 taken first.
 * Usage (from delni-backend):  php database/scripts/move_images_to_files.php <expected database name> [--dry-run]
 * Guides' licence documents (tour_guides.digital_certificate_file) are private and are NOT moved to the public folder.
 */
require __DIR__ . '/../../vendor/autoload.php';
$app = require __DIR__ . '/../../bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Support\Base64Image;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

$expected = $argv[1] ?? '';
$dry = in_array('--dry-run', $argv, true);
$db = config('database.connections.sqlsrv.database');
if ($expected === '' || $expected !== $db) {
    fwrite(STDERR, "STOP: connected to '$db' but expected '$expected'\n");
    exit(1);
}
if (!function_exists('imagecreatefromstring')) {
    fwrite(STDERR, "STOP: GD is not enabled\n");
    exit(1);
}

// table => [primary key, folder, image columns, file name prefix]
$plan = [
    'hotels' => ['hotel_id', 'hotels', ['hotel_photo_1', 'hotel_photo_2', 'hotel_photo_3', 'hotel_photo_4', 'hotel_photo_5'], 'hotel'],
    'restaurants_cafes' => ['facility_id', 'restaurants', ['facility_image_1', 'facility_image_2', 'facility_image_3', 'facility_image_4', 'facility_image_5'], 'restaurant'],
    'vehicles' => ['plate_number', 'vehicles', ['vehicle_image', 'insurance_image'], null],
    'places_tourist' => ['place_id', 'places', ['place_image'], 'place'],
    'daily_trips' => ['daily_trip_id', 'trips', ['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5'], null],
    'weekly_trips' => ['weekly_trip_id', 'trips', ['photo_1', 'photo_2', 'photo_3', 'photo_4', 'photo_5'], null],
    'tour_guides' => ['license_number', 'guides', ['avatar'], 'guide'],
];

$types = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp', 'image/gif' => 'gif', 'image/avif' => 'avif'];
$finfo = new finfo(FILEINFO_MIME_TYPE);
$before = 0; $after = 0; $moved = 0; $skipped = [];

echo "database: $db" . ($dry ? " (dry run)" : "") . "\n";
foreach ($plan as $table => [$key, $folder, $columns, $prefix]) {
    if (!Schema::hasTable($table)) continue;
    $columns = array_values(array_filter($columns, fn ($c) => Schema::hasColumn($table, $c)));
    foreach ($columns as $col) {
        $rows = DB::table($table)->where($col, 'like', 'data:%')->get([$key, $col]);
        foreach ($rows as $row) {
            $value = $row->$col;
            $bytes = preg_match('/^data:[^;,]*;base64,(.+)$/s', $value, $m) ? base64_decode($m[1], true) : false;
            $ext = $bytes === false ? null : ($types[$finfo->buffer($bytes)] ?? null);
            if ($ext === null) { $skipped[] = "$table.$col [{$row->$key}] not a supported image"; continue; }
            [$small, $smallExt] = Base64Image::shrink($bytes, $ext);
            $name = ($prefix ? "$prefix-{$row->$key}" : "$col-{$row->$key}") . '-' . $col;
            $before += strlen($value); $after += strlen($small);
            if (!$dry) {
                $path = Base64Image::save($small, $smallExt, $name, $folder);
                DB::table($table)->where($key, $row->$key)->update([$col => $path]);
            } else {
                $path = "(dry) /uploads/$folder/...";
            }
            $moved++;
            printf("  %-18s %-17s %-28s %7.0f KB -> %6.0f KB  %s\n", $table, $col, $row->$key, strlen($value) / 1024, strlen($small) / 1024, $path);
        }
    }
}
$left = DB::selectOne("SELECT
  (SELECT COUNT(*) FROM hotels WHERE hotel_photo_1 LIKE 'data:%' OR hotel_photo_2 LIKE 'data:%' OR hotel_photo_3 LIKE 'data:%' OR hotel_photo_4 LIKE 'data:%' OR hotel_photo_5 LIKE 'data:%') AS hotels,
  (SELECT COUNT(*) FROM vehicles WHERE vehicle_image LIKE 'data:%' OR insurance_image LIKE 'data:%') AS vehicles");
printf("moved %d images: %.1f MB of text -> %.1f MB of files; still base64: hotels=%d vehicles=%d\n",
    $moved, $before / 1048576, $after / 1048576, $left->hotels, $left->vehicles);
foreach ($skipped as $s) echo "  skipped: $s\n";
