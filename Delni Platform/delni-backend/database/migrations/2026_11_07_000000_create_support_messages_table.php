<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Support chat messages between an account (or a visitor) and the platform's administration.
 * Additive only: creates the table when it does not exist and touches no other table.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('support_messages')) {
            return;
        }
        Schema::create('support_messages', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->string('session_id', 100);              // the conversation the message belongs to
            $table->string('sender_id', 100)->nullable();   // who sent it (null for a visitor without an account)
            $table->string('sender_role', 20);              // tourist | guide | transport | driver | admin | visitor
            $table->string('recipient_id', 100)->nullable(); // who it is for (null = the administration as a team)
            $table->string('recipient_role', 20);           // admin, or the account's role for an admin reply
            $table->text('body');                           // the message text
            $table->boolean('is_read')->default(false);     // read by its recipient
            $table->dateTime('created_at');                 // when it was sent (Africa/Tripoli)

            $table->index(['session_id', 'created_at']);
            $table->index(['recipient_role', 'is_read']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('support_messages');
    }
};
