<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Create the main table used to store tracked job applications.
     */
    public function up(): void
    {
        Schema::create('job_applications', function (Blueprint $table) {
            // Persist each job opportunity the user is tracking.
            $table->id();
            $table->string('title');
            $table->string('company');
            $table->string('location');
            $table->string('link')->nullable();
            $table->text('notes')->nullable();
            $table->enum('status', [
                'Applied',
                'Online Assessment',
                'Interview',
                'Accepted',
                'Rejected',
            ])->default('Applied');
            $table->timestamps();
        });
    }

    /**
     * Drop the job applications table during a rollback.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_applications');
    }
};
