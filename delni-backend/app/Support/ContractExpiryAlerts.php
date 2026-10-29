<?php

namespace App\Support;

use App\Models\Notification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Warns the admin once per contract when a hotel, restaurant/cafe or transport company contract ends within
 * the next week (so there is time to contact the partner) (moved from the Node bridge's hourly timer). Runs from the scheduler and, at most once an hour,
 * when the admin's notifications are loaded, so it also works when no scheduler process is running.
 */
class ContractExpiryAlerts
{
    private const DAYS_BEFORE = 7;

    // code => [label, table, id column, name column]
    private const SOURCES = [
        'h' => ['فندق', 'hotels', 'hotel_id', 'hotel_name'],
        'r' => ['مطعم/مقهى', 'restaurants_cafes', 'facility_id', 'facility_name'],
        't' => ['شركة نقل', 'transportation_companies', 'contract_number', 'company_name'],
    ];

    public static function runHourly(): void
    {
        if (Cache::add('contract-expiry-check', true, now()->addHour())) {
            self::run();
        }
    }

    // Returns how many new alerts were created
    public static function run(): int
    {
        $today = now('Africa/Tripoli')->toDateString();
        $lastDay = now('Africa/Tripoli')->addDays(self::DAYS_BEFORE)->toDateString();
        $created = 0;
        foreach (self::SOURCES as $code => [$label, $table, $idColumn, $nameColumn]) {
            // contract_end_date is the last day of the contract: alert from a week before it until it ends
            $rows = DB::table($table)->whereNotNull('contract_end_date')
                ->whereBetween('contract_end_date', [$today, $lastDay])
                ->get([$idColumn . ' as id', $nameColumn . ' as name', DB::raw('CONVERT(VARCHAR(10), contract_end_date, 23) as end_date')]);
            foreach ($rows as $row) {
                $key = "contract-end-{$code}-{$row->id}-{$row->end_date}";
                if (Notification::where('dedupe_key', $key)->exists()) {
                    continue;
                }
                Notification::create([
                    'id' => 'notif-' . (int) (microtime(true) * 1000) . '-' . random_int(100, 999),
                    'type' => 'contract',
                    'title' => "⏰ عقد شراكة ينتهي خلال أسبوع: {$row->name}",
                    'body' => "ينتهي عقد الشراكة مع {$label} ({$row->name}) بتاريخ {$row->end_date}. يرجى التواصل معهم لتجديد العقد قبل انتهائه.",
                    'recipient_role' => 'admin',
                    'recipient_id' => null,
                    'link' => '/dashboard/admin',
                    'is_read' => false,
                    'created_at' => now('Africa/Tripoli'),
                    'dedupe_key' => $key,
                ]);
                $created++;
            }
        }
        return $created;
    }
}
