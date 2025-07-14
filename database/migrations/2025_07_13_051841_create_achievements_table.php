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
        Schema::create('achievements', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description');
            $table->string('icon')->nullable(); // Icon name or path
            $table->string('type'); // streak, count, milestone, special
            $table->string('category'); // habits, logs, consistency, social
            $table->integer('requirement'); // Number required to unlock
            $table->integer('points')->default(0); // Points awarded
            $table->string('badge_color')->default('#3B82F6'); // Badge color
            $table->boolean('is_active')->default(true);
            $table->json('conditions')->nullable(); // Additional conditions
            $table->timestamps();
        });

        Schema::create('user_achievements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('achievement_id')->constrained()->onDelete('cascade');
            $table->timestamp('unlocked_at');
            $table->json('progress')->nullable(); // Current progress data
            $table->timestamps();

            $table->unique(['user_id', 'achievement_id']);
        });

        Schema::create('user_points', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('points');
            $table->string('source'); // achievement, streak, bonus, etc.
            $table->string('description');
            $table->json('metadata')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_points');
        Schema::dropIfExists('user_achievements');
        Schema::dropIfExists('achievements');
    }
};
