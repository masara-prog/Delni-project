<?php

namespace Tests\Unit;

use App\Http\Controllers\Api\Concerns\JsonApiResponses;
use App\Http\Controllers\Api\TripCatalogController;
use App\Models\Driver;
use App\Support\Passwords;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

/**
 * Unit tests for the rules behind chapters 7–9 (transport company, driver, admin). Each test checks one unit of code
 * on its own, with values chosen from the code itself (equivalence classes and boundaries). The test database is an
 * in-memory SQLite (phpunit.xml), so no real data is touched. Every test prints "RESULT|id|observed" for the report.
 */
class TransportRulesTest extends TestCase
{
    private function report(string $id, string $observed): void
    {
        fwrite(STDOUT, "RESULT|{$id}|{$observed}\n");
    }

    // ---- Driver trip stages (chapter 8): Driver::STAGE_TRANSITIONS

    public function test_u_stages_follow_a_real_trip(): void
    {
        $t = Driver::STAGE_TRANSITIONS;
        $chain = ['في الانتظار', 'تم الانطلاق', 'في الطريق - استراحة', 'تم الانطلاق', 'وصلنا الوجهة', 'مكتملة', 'في الانتظار'];
        $ok = true;
        for ($i = 0; $i < count($chain) - 1; $i++) {
            $ok = $ok && in_array($chain[$i + 1], $t[$chain[$i]], true);
        }
        $skip = in_array('مكتملة', $t['في الانتظار'], true);
        $back = in_array('في الانتظار', $t['تم الانطلاق'], true);
        $every = count(array_diff(Driver::TRIP_STAGES, array_keys($t))) === 0;
        $this->report('U-STAGES', 'المسار الكامل مسموح: ' . ($ok ? 'نعم' : 'لا') . '، القفز من «في الانتظار» إلى «مكتملة»: ' . ($skip ? 'مسموح' : 'ممنوع')
            . '، الرجوع من «تم الانطلاق» إلى «في الانتظار»: ' . ($back ? 'مسموح' : 'ممنوع') . '، لكل مرحلة انتقالات معرفة: ' . ($every ? 'نعم' : 'لا'));
        $this->assertTrue($ok);
        $this->assertFalse($skip);
        $this->assertFalse($back);
        $this->assertTrue($every);
    }

    public function test_u_on_trip_stages(): void
    {
        $onTrip = Driver::ON_TRIP_STAGES;
        $d = new Driver();
        $states = [];
        foreach (Driver::TRIP_STAGES as $s) {
            $d->current_trip_stage = $s;
            $states[] = $s . '=' . ($d->isOnTrip() ? 'في رحلة' : 'ليس في رحلة');
        }
        $this->report('U-ONTRIP', implode('، ', $states));
        $this->assertSame(['تم الانطلاق', 'في الطريق - استراحة', 'وصلنا الوجهة'], $onTrip);
        $d->current_trip_stage = 'مكتملة';
        $this->assertFalse($d->isOnTrip());
        $d->current_trip_stage = 'وصلنا الوجهة';
        $this->assertTrue($d->isOnTrip());
    }

    // ---- "A coming date" rule used for contract end dates and driving licences (chapters 7 and 8)

    public function test_u_future_date_boundaries(): void
    {
        Carbon::setTestNow(Carbon::parse('2026-11-23 10:00:00', 'Africa/Tripoli'));
        $rule = new class {
            use JsonApiResponses;

            public function check(?string $new, ?string $old): ?string
            {
                return $this->pastDateError($new, $old, 'التاريخ');
            }
        };
        $cases = [
            'أمس 2026-11-22' => ['2026-11-22', null, false],
            'اليوم 2026-11-23' => ['2026-11-23', null, false],
            'غداً 2026-11-24' => ['2026-11-24', null, true],
            'تاريخ قديم محفوظ لم يتغير' => ['2026-01-01', '2026-01-01', true],
            'بدون تاريخ' => [null, null, true],
        ];
        $seen = [];
        foreach ($cases as $label => [$new, $old, $accepted]) {
            $got = $rule->check($new, $old) === null;
            $seen[] = "{$label}: " . ($got ? 'مقبول' : 'مرفوض');
            $this->assertSame($accepted, $got, $label);
        }
        $this->report('U-DATE', implode('، ', $seen));
        Carbon::setTestNow();
    }

    // ---- Sign-in password check (all accounts, chapter 7 login)

    public function test_u_password_check(): void
    {
        $bcrypt = Hash::make('Screens@2026');
        $salt = 'abc123';
        $pbkdf2 = $salt . ':' . hash_pbkdf2('sha256', 'Old@2025', $salt, 1000, 128);
        $cases = [
            'كلمة صحيحة مشفرة bcrypt' => [Passwords::matches('Screens@2026', $bcrypt), true],
            'كلمة خاطئة' => [Passwords::matches('screens@2026', $bcrypt), false],
            'صيغة النظام القديم PBKDF2 صحيحة' => [Passwords::matches('Old@2025', $pbkdf2), true],
            'كلمة مخزنة نصاً غير مشفر' => [Passwords::matches('Screens@2026', 'Screens@2026'), false],
            'كلمة فارغة' => [Passwords::matches('', $bcrypt), false],
        ];
        $seen = [];
        foreach ($cases as $label => [$got, $want]) {
            $seen[] = "{$label}: " . ($got ? 'تُقبل' : 'تُرفض');
            $this->assertSame($want, $got, $label);
        }
        $this->report('U-PASS', implode('، ', $seen));
    }

    // ---- Trip days used by the admin's assignment checks (chapter 9)

    public function test_u_trip_weekdays(): void
    {
        $c = new TripCatalogController();
        $between = (new \ReflectionMethod($c, 'weekdaysBetween'));
        $between->setAccessible(true);
        $three = $between->invoke($c, '2026-11-23', '2026-11-25');   // Monday .. Wednesday
        $ten = $between->invoke($c, '2026-11-23', '2026-12-02');
        $reversed = $between->invoke($c, '2026-11-25', '2026-11-23');
        $norm = $c->normalizeDayName(' الإثنين ');
        $this->report('U-DAYS', 'من 23 إلى 25 نوفمبر: ' . implode('، ', $three) . '؛ عشرة أيام: ' . count(array_unique($ten))
            . ' أيام مختلفة؛ تاريخ نهاية قبل البداية: ' . count($reversed) . ' يوم؛ «الإثنين» بعد التوحيد: ' . $norm);
        $this->assertSame(['الاثنين', 'الثلاثاء', 'الأربعاء'], array_values(array_map([$c, 'normalizeDayName'], $three)));
        $this->assertCount(7, array_unique($ten));
        $this->assertSame([], $reversed);
        $this->assertSame('الاثنين', $norm);
    }
}
