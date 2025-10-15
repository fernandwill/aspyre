<?php

use App\Http\Controllers\JobApplicationController;
use App\Http\Controllers\SignOutController;
use Illuminate\Support\Facades\Route;

Route::get('/job-applications', [JobApplicationController::class, 'index']);
Route::post('/job-applications', [JobApplicationController::class, 'store']);
Route::put('/job-applications/{jobApplication}', [JobApplicationController::class, 'update']);
Route::patch('/job-applications/{jobApplication}/status', [JobApplicationController::class, 'updateStatus']);
Route::delete('/job-applications/{jobApplication}', [JobApplicationController::class, 'destroy']);
Route::post('/sign-out', SignOutController::class);
