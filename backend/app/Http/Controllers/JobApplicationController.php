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
     * Return all job applications sorted by newest first for the kanban board.
     */
    public function index(): JsonResponse
    {
        $jobApplications = JobApplication::orderByDesc('created_at')->get();

        return response()->json($jobApplications);
    }

    /**
     * Persist a newly submitted job application and return it to the client.
     */
    public function store(StoreJobApplicationRequest $request): JsonResponse
    {
        $jobApplication = JobApplication::create($request->validated());

        return response()->json($jobApplication, 201);
    }

    /**
     * Apply edits to a job application and return the refreshed record.
     */
    public function update(UpdateJobApplicationRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $jobApplication->fill($request->validated());
        $jobApplication->save();

        return response()->json($jobApplication);
    }

    /**
     * Change only the status column for a specific job application.
     */
    public function updateStatus(UpdateJobApplicationStatusRequest $request, JobApplication $jobApplication): JsonResponse
    {
        $jobApplication->update($request->validated());

        return response()->json($jobApplication);
    }

    /**
     * Delete a job application record when the user removes it from the board.
     */
    public function destroy(JobApplication $jobApplication): Response
    {
        $jobApplication->delete();

        return response()->noContent();
    }
}
