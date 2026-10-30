<?php

namespace App\Support;

use Illuminate\Support\Facades\Hash;

/**
 * Password check shared by sign-in and password changes. Accounts hold either a bcrypt hash (Laravel)
 * or a PBKDF2 "salt:hash" written by the old Node bridge and the seeder. Plain-text passwords are never accepted.
 */
class Passwords
{
    public static function matches(string $password, ?string $hash): bool
    {
        if ($password === '' || empty($hash)) {
            return false;
        }

        if (str_starts_with($hash, '$2y$') || str_starts_with($hash, '$2a$') || str_starts_with($hash, '$2b$')) {
            try {
                return Hash::check($password, $hash);
            } catch (\Throwable) {
                return false;
            }
        }

        $parts = explode(':', $hash, 2);
        if (count($parts) === 2) {
            [$salt, $originalHash] = $parts;
            // The bridge stored 64 bytes as hex (128 chars); PHP's length is in hex chars, so match the stored length
            $computed = hash_pbkdf2('sha256', $password, $salt, 1000, strlen($originalHash));
            return hash_equals($originalHash, $computed);
        }

        return false;
    }
}
