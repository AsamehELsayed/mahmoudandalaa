<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('wedding_settings', function (Blueprint $table) {
            $table->id();
            $table->string('bride_name');
            $table->string('groom_name');
            $table->dateTime('wedding_date');
            $table->string('venue_name');
            $table->string('venue_city');
            $table->string('venue_address');
            $table->text('venue_maps_url');
            $table->string('ceremony_time');
            $table->string('reception_time');
            $table->string('music_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('wedding_settings');
    }
};
