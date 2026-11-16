<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

/**
 * A notification goes to one account (one of four foreign key columns, by kind of account) or, with no account,
 * to everyone in recipient_role ('all', 'admin', 'tourist', ...). recipient_id is a computed column holding the
 * filled account column, kept so the queries read one column.
 */
class Notification extends Model
{
    protected $table = 'notifications';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    // role => [column in notifications, the account's table, that table's key]
    public const ACCOUNT_COLUMNS = [
        'tourist' => ['tourist_id', 'tourists', 'tourist_id'],
        'guide' => ['guide_license_number', 'tour_guides', 'license_number'],
        'driver' => ['driver_license_number', 'drivers', 'driver_license_number'],
        'company' => ['company_contract_number', 'transportation_companies', 'contract_number'],
    ];

    protected $fillable = [
        'id',
        'type',
        'title',
        'body',
        'recipient_role',
        'tourist_id',
        'guide_license_number',
        'driver_license_number',
        'company_contract_number',
        'link',
        'is_read',
        'created_at',
        'dedupe_key',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'created_at' => 'datetime',
    ];

    /**
     * The columns that address a notification to (role, id): the role, plus the account column when there is an id.
     * Null when the account does not exist (the notification would point nowhere, so it is not created).
     */
    public static function recipientColumns(?string $role, ?string $id): ?array
    {
        $role = $role === 'transport' ? 'company' : ($role ?: 'all');
        if ($id === null || $id === '') {
            return ['recipient_role' => $role];
        }
        if (!isset(self::ACCOUNT_COLUMNS[$role])) {
            return null;
        }
        [$column, $table, $key] = self::ACCOUNT_COLUMNS[$role];
        if (!DB::table($table)->where($key, $id)->exists()) {
            return null;
        }
        return ['recipient_role' => $role, $column => $id];
    }
}
