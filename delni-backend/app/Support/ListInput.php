<?php

namespace App\Support;

/**
 * Parses list values sent by the frontend the same way the Node bridge does:
 * an array, a JSON array string, or text separated by commas (Latin or Arabic).
 */
class ListInput
{
    // Guide working-day codes -> the Arabic names stored in guide_working_days (same map as the bridge)
    private const DAY_NAMES = [
        'sat' => 'السبت', 'sun' => 'الأحد', 'mon' => 'الاثنين', 'tue' => 'الثلاثاء',
        'wed' => 'الأربعاء', 'thu' => 'الخميس', 'fri' => 'الجمعة',
        'Sa' => 'السبت', 'Su' => 'الأحد', 'Mo' => 'الاثنين', 'Tu' => 'الثلاثاء',
        'We' => 'الأربعاء', 'Th' => 'الخميس', 'Fr' => 'الجمعة',
    ];

    public static function parse($value): array
    {
        if (is_array($value)) {
            $items = $value;
        } elseif (is_string($value) && trim($value) !== '') {
            $decoded = json_decode($value, true);
            $items = is_array($decoded) ? $decoded : preg_split('/[,،]/u', $value);
        } else {
            return [];
        }

        $clean = [];
        foreach ($items as $item) {
            $item = trim((string) $item);
            if ($item !== '' && !in_array($item, $clean, true)) {
                $clean[] = $item;
            }
        }
        return $clean;
    }

    public static function dayNames($value): array
    {
        return array_values(array_unique(array_map(
            fn ($day) => self::DAY_NAMES[$day] ?? $day,
            self::parse($value)
        )));
    }
}
