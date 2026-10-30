<?php

namespace App\Support;

use App\Models\Driver;
use App\Models\Tourist;
use App\Models\TourGuide;
use App\Models\TransportationCompany;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;

/**
 * The signed-in account behind the request's Sanctum token: its role and its id.
 * Works on public routes too (no account = guest), so a public list can still show more to the admin.
 */
class Actor
{
    // model => [role, id column]
    private const ROLES = [
        User::class => ['admin', null],
        Tourist::class => ['tourist', 'tourist_id'],
        TourGuide::class => ['guide', 'license_number'],
        TransportationCompany::class => ['transport', 'contract_number'],
        Driver::class => ['driver', 'driver_license_number'],
    ];

    // The request field that carries each role's own id
    public const ID_FIELDS = [
        'tourist' => 'tourist_id',
        'guide' => 'license_number',
        'transport' => 'contract_number',
        'driver' => 'driver_license_number',
    ];

    public static function user(): ?Model
    {
        $user = auth('sanctum')->user();
        return $user instanceof Model ? $user : null;
    }

    public static function role(): ?string
    {
        $user = self::user();
        return $user ? (self::ROLES[get_class($user)][0] ?? null) : null;
    }

    public static function id(): ?string
    {
        $user = self::user();
        $column = $user ? (self::ROLES[get_class($user)][1] ?? null) : null;
        return $column ? (string) $user->{$column} : null;
    }

    public static function isAdmin(): bool
    {
        return self::role() === 'admin';
    }
}
