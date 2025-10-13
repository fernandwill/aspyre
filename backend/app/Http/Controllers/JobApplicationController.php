<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationRequest;
use App\Http\Requests\UpdateJobApplicationStatusRequest;
use App\Models\JobApplication;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Response;

class JobApplicationController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $jobApplications = JobApplication::orderByDesc('created_at')->get();

        return response()->json($jobApplications);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $jobApplication = JobApplication::create($request->validated());

        return response()->json($jobApplication, 201);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $jobApplication->fill($request->validated());
        $jobApplication->save();

        return response()->json($jobApplication);
    }

    /**
     * Update the status of the specified resource in storage.
     */
    public function updateStatus(UpdateJobApplicationStatusRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $jobApplication->update($request->validated());

        return response()->json($jobApplication);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(JobApplication $jobApplication): Response
    {
        $jobApplication->delete();

        return response()->noContent();
    }
}
