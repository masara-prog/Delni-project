<?php

namespace App\Support;

use App\Models\Notification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * Expiry alerts, a week ahead so there is time to act (moved from the Node bridge's hourly timer):
 *  - hotel, restaurant/cafe and transport company contracts: the admin, and the transport company itself
 *  - drivers' licenses (drivers.license_date_valid): the driver, the driver's company and the admin
 *  - guides' licences (tour_guides.license_expiry_date), 30 days ahead: the guide and the admin
 * Each alert is sent once. Runs from the scheduler and, at most once an hour, when notifications are loaded,
 * so it also works when no scheduler process is running.
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
                $created += self::send("contract-end-{$code}-{$row->id}-{$row->end_date}", 'admin', null,
                    "⏰ عقد شراكة ينتهي خلال أسبوع: {$row->name}",
                    "ينتهي عقد الشراكة مع {$label} ({$row->name}) بتاريخ {$row->end_date}. يرجى التواصل معهم لتجديد العقد قبل انتهائه.",
                    '/dashboard/admin?tab=' . ($code === 't' ? 'companies' : 'entities'));
                if ($code === 't') {
                    $created += self::send("contract-end-company-{$row->id}-{$row->end_date}", 'company', $row->id,
                        '⏰ عقد شركتكم مع المنصة ينتهي قريباً',
                        "ينتهي عقد شركتكم مع منصة دلّني بتاريخ {$row->end_date}. يرجى التواصل مع إدارة المنصة لتجديده قبل انتهائه.",
                        '/dashboard/transport?tab=profile');
                }
            }
        }

        // Drivers' licenses
        $drivers = DB::table('drivers as d')->leftJoin('transportation_companies as c', 'd.contract_number', '=', 'c.contract_number')
            ->whereBetween('d.license_date_valid', [$today, $lastDay])
            ->get(['d.driver_license_number as id', 'd.full_name as name', 'd.contract_number', 'c.company_name',
                DB::raw('CONVERT(VARCHAR(10), d.license_date_valid, 23) as end_date')]);
        foreach ($drivers as $d) {
            $created += self::send("license-end-driver-{$d->id}-{$d->end_date}", 'driver', $d->id,
                '⏰ رخصة القيادة الخاصة بك تنتهي قريباً',
                "تنتهي صلاحية رخصة قيادتك بتاريخ {$d->end_date}. يرجى تجديدها وتسليم نسخة منها لشركة النقل قبل انتهائها.",
                '/dashboard/driver?tab=profile');
            if ($d->contract_number) {
                $created += self::send("license-end-company-{$d->id}-{$d->end_date}", 'company', $d->contract_number,
                    "⏰ رخصة السائق {$d->name} تنتهي قريباً",
                    "تنتهي صلاحية رخصة قيادة السائق ({$d->name}) بتاريخ {$d->end_date}. يرجى متابعة تجديدها وتحديث بياناته.",
                    '/dashboard/transport?tab=drivers');
            }
            $created += self::send("license-end-admin-{$d->id}-{$d->end_date}", 'admin', null,
                "⏰ رخصة السائق {$d->name} تنتهي خلال أسبوع",
                "تنتهي صلاحية رخصة قيادة السائق ({$d->name})" . ($d->company_name ? " التابع لشركة ({$d->company_name})" : '') . " بتاريخ {$d->end_date}.",
                '/dashboard/admin?tab=drivers');
        }
        return $created + self::guideLicences($today);
    }

    // A guide's licence ending within LICENCE_DAYS_BEFORE days: the admin and the guide are told once per expiry date
    private const LICENCE_DAYS_BEFORE = 30;

    private static function guideLicences(string $today): int
    {
        $lastDay = now('Africa/Tripoli')->addDays(self::LICENCE_DAYS_BEFORE)->toDateString();
        $guides = DB::table('tour_guides')->where('verification_status', 'موثق')->whereNotNull('license_expiry_date')
            ->whereBetween('license_expiry_date', [$today, $lastDay])
            ->get(['license_number', 'full_name', DB::raw('CONVERT(VARCHAR(10), license_expiry_date, 23) as end_date')]);
        $created = 0;
        foreach ($guides as $g) {
            $created += self::send("licence-end-admin-{$g->license_number}-{$g->end_date}", 'admin', null,
                "⏰ ترخيص المرشد ({$g->full_name}) ينتهي قريباً",
                "ينتهي ترخيص الإرشاد للمرشد ({$g->full_name}) برقم ({$g->license_number}) بتاريخ {$g->end_date}. لن تُسند إليه رحلات تنتهي بعد هذا التاريخ.",
                '/dashboard/admin?tab=guides');
            $created += self::send("licence-end-guide-{$g->license_number}-{$g->end_date}", 'guide', $g->license_number,
                '⏰ ترخيص الإرشاد الخاص بك ينتهي قريباً',
                "ينتهي ترخيص الإرشاد الخاص بك بتاريخ {$g->end_date}. يرجى تجديده وتحديث تاريخ الانتهاء ووثيقة الترخيص في ملفك الشخصي.",
                '/dashboard/guide?tab=profile');
        }
        return $created;
    }

    // Creates the alert once (dedupe key); returns 1 when created
    private static function send(string $key, string $role, ?string $recipientId, string $title, string $body, string $link): int
    {
        if (Notification::where('dedupe_key', $key)->exists()) {
            return 0;
        }
        Notification::create([
            'id' => 'notif-' . (int) (microtime(true) * 1000) . '-' . random_int(1000, 9999),
            'type' => 'contract',
            'title' => $title,
            'body' => $body,
            'recipient_role' => $role,
            'recipient_id' => $recipientId,
            'link' => $link,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
            'dedupe_key' => $key,
        ]);
        return 1;
    }
}
