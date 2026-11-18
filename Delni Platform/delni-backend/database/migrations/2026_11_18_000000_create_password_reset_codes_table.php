<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Forgotten password by email: a 6-digit code sent to the account's email, kept hashed, valid 10 minutes,
 * five attempts at most. One row per request; used or replaced rows are deleted.
 *
 * Run on its own: php artisan migrate --path=database/migrations/2026_11_18_000000_create_password_reset_codes_table.php
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_codes', function (Blueprint $table) {
            $table->id();
            $table->string('role', 20);              // tourist, guide, transport, driver
            $table->string('email', 100);
            $table->string('code_hash', 255);
            $table->unsignedTinyInteger('attempts')->default(0);
            $table->dateTime('expires_at');
            $table->dateTime('created_at');
            $table->index(['role', 'email']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_codes');
    }
};
