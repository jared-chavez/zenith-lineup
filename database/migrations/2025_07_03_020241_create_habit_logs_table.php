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
        Schema::create('habit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('habit_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('log_date');
            $table->json('data'); // Store habit-specific data (e.g., water amount, exercise duration)
            $table->enum('status', ['completed', 'partial', 'missed'])->default('completed');
            $table->text('notes')->nullable();
            $table->json('metadata')->nullable(); // Additional data like location, weather, etc.
            $table->timestamps();
            
            // Indexes for performance and data integrity
            $table->unique(['habit_id', 'user_id', 'log_date']);
            $table->index(['user_id', 'log_date']);
            $table->index(['habit_id', 'log_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('habit_logs');
    }
};
