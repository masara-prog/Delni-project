<?php

namespace App\Support;

use App\Models\Notification;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

/**
 * A guide has 24 hours to accept or decline a daily, weekly or private trip sent to them.
 * After that the trip is taken back from the guide: it is marked as declined with guide_reply_expired = 1,
 * so it leaves the guide's lists (platform and app), the guide can no longer answer it, and the admin
 * is told to choose another guide (the usual "declined" reassignment flow).
 * Runs from the scheduler, before a guide sees or answers trips, and when notifications are loaded.
 */
class GuideReplyTimeout
{
    public const HOURS = 24;
    private const PENDING = 'بانتظار رد المرشد';
    private const DECLINED = 'اعتذر المرشد';

    // table => [id column, status column, label, admin tab]
    private const TRIPS = [
        'daily_trips' => ['daily_trip_id', 'guide_approval_status', 'الرحلة اليومية', 'trips'],
        'weekly_trips' => ['weekly_trip_id', 'guide_approval_status', 'الرحلة الأسبوعية', 'trips'],
        'private_trips' => ['private_trip_id', 'status_order', 'الرحلة الخاصة', 'private_trips'],
    ];

    // Time stamp written whenever a trip is sent to a guide
    public static function stamp(): array
    {
        return ['guide_requested_at' => now('Africa/Tripoli')->format('Y-m-d H:i:s'), 'guide_reply_expired' => false];
    }

    // At most once a minute from busy endpoints (notifications)
    public static function runOften(): void
    {
        if (Cache::add('guide-reply-timeout-check', true, now()->addMinute())) {
            self::run();
        }
    }

    // Returns how many trips were taken back from their guides
    public static function run(): int
    {
        $deadline = now('Africa/Tripoli')->subHours(self::HOURS)->format('Y-m-d H:i:s');
        $count = 0;
        foreach (self::TRIPS as $table => [$key, $status, $label, $tab]) {
            $title = $table === 'private_trips' ? DB::raw("CONCAT(N'#', t.private_trip_id) as title") : 't.trip_title as title';
            $rows = DB::table("{$table} as t")->leftJoin('tour_guides as g', 't.guide_license_number', '=', 'g.license_number')
                ->where("t.{$status}", self::PENDING)
                ->whereNotNull('t.guide_requested_at')
                ->where('t.guide_requested_at', '<=', $deadline)
                ->get(["t.{$key} as id", 't.guide_license_number as guide', 'g.full_name as guide_name', $title,
                    DB::raw("CONVERT(VARCHAR(19), t.guide_requested_at, 126) as sent_at")]);
            foreach ($rows as $row) {
                // Only the row still pending is changed, so an answer given at the same moment wins
                $changed = DB::table($table)->where($key, $row->id)->where($status, self::PENDING)
                    ->update([$status => self::DECLINED, 'guide_reply_expired' => true]);
                if (!$changed) {
                    continue;
                }
                $count++;
                $guideName = $row->guide_name ?: $row->guide;
                self::send("guide-timeout-admin-{$table}-{$row->id}-{$row->guide}-{$row->sent_at}", 'admin', null,
                    "⏰ لم يرد المرشد على {$label} ({$row->title})",
                    "لم يرد المرشد ({$guideName}) على {$label} ({$row->title}) خلال " . self::HOURS . " ساعة، فسُحبت منه. يرجى اختيار مرشد آخر لها.",
                    "/dashboard/admin?tab={$tab}");
                if ($row->guide) {
                    self::send("guide-timeout-guide-{$table}-{$row->id}-{$row->guide}-{$row->sent_at}", 'guide', $row->guide,
                        "ℹ️ انتهت مهلة الرد على {$label} ({$row->title})",
                        "مرت " . self::HOURS . " ساعة دون رد على {$label} ({$row->title})، فأعيدت الرحلة إلى الإدارة لتسندها إلى مرشد آخر.",
                        '/dashboard/guide');
                }
            }
        }
        return $count;
    }

    private static function send(string $key, string $role, ?string $recipientId, string $title, string $body, string $link): void
    {
        if (Notification::where('dedupe_key', $key)->exists()) {
            return;
        }
        $recipient = Notification::recipientColumns($role, $recipientId);
        if ($recipient === null) {
            return;
        }
        Notification::create($recipient + [
            'id' => 'notif-' . (int) (microtime(true) * 1000) . '-' . random_int(1000, 9999),
            'type' => 'trip',
            'title' => $title,
            'body' => $body,
            'link' => $link,
            'is_read' => false,
            'created_at' => now('Africa/Tripoli'),
            'dedupe_key' => $key,
        ]);
    }
}
