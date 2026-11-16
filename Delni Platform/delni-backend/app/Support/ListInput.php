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

    // One spelling for each day name (الإثنين / الاثنين, الأحد / الاحد, الأربعاء / الاربعاء)
    public static function normalizeDay(string $day): string
    {
        $day = trim(str_replace(['إ', 'آ'], 'ا', $day));
        return match ($day) {
            'الاحد' => 'الأحد',
            'الاربعاء' => 'الأربعاء',
            default => $day,
        };
    }

    // Day names in the order of the week, Saturday first (the database returns them in no fixed order)
    public static function weekOrder(array $names): array
    {
        $week = array_values(array_slice(self::DAY_NAMES, 0, 7, true));
        $days = array_values(array_unique(array_map(fn ($d) => self::normalizeDay((string) $d), $names)));
        usort($days, fn ($a, $b) => (array_search($a, $week, true) === false ? 99 : array_search($a, $week, true))
            <=> (array_search($b, $week, true) === false ? 99 : array_search($b, $week, true)));
        return $days;
    }

    // Stored Arabic day names -> the codes the guide forms use (sat, sun, ...), in week order
    public static function dayCodes(array $names): array
    {
        $codes = array_flip(array_slice(self::DAY_NAMES, 0, 7, true));
        return array_values(array_map(fn ($name) => $codes[$name] ?? $name, self::weekOrder($names)));
    }

    public static function dayNames($value): array
    {
        return self::weekOrder(array_map(fn ($day) => self::DAY_NAMES[$day] ?? $day, self::parse($value)));
    }
}
