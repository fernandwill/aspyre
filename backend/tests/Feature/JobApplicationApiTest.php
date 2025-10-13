<?php

namespace Tests\Feature;

use App\Models\JobApplication;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class JobApplicationApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Verify the index endpoint returns all stored job applications.
     */
    public function test_can_list_job_applications(): void
    {
        JobApplication::factory()->count(2)->create();

        $response = $this->getJson('/api/job-applications');

        $response->assertOk();
        $response->assertJsonCount(2);
    }

    /**
     * Confirm a job application can be created through the API.
     */
    public function test_can_create_job_application(): void
    {
        $payload = [
            'title' => 'Software Engineer',
            'company' => 'Acme Inc.',
            'location' => 'Remote',
            'link' => 'https://example.com/jobs/1',
            'notes' => 'Exciting opportunity',
            'status' => 'Applied',
        ];

        $response = $this->postJson('/api/job-applications', $payload);

        $response->assertCreated();
        $this->assertDatabaseHas('job_applications', [
            'title' => 'Software Engineer',
            'company' => 'Acme Inc.',
        ]);
    }

    /**
     * Ensure validation errors are returned when required fields are missing.
     */
    public function test_create_job_application_requires_mandatory_fields(): void
    {
        $response = $this->postJson('/api/job-applications', [
            'title' => 'Missing Fields',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['company', 'location', 'link']);
    }

    /**
     * Check that full job details can be updated via the PUT endpoint.
     */
    public function test_can_update_job_application_details(): void
    {
        $jobApplication = JobApplication::factory()->create();

        $response = $this->putJson("/api/job-applications/{$jobApplication->id}", [
            'title' => 'Updated Title',
            'company' => 'New Company',
            'location' => 'Hybrid',
            'link' => 'https://example.com/jobs/updated',
            'notes' => 'Updated notes',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('job_applications', [
            'id' => $jobApplication->id,
            'title' => 'Updated Title',
            'company' => 'New Company',
            'location' => 'Hybrid',
        ]);
    }

    /**
     * Confirm the dedicated status endpoint stores the new workflow state.
     */
    public function test_can_update_job_application_status(): void
    {
        $jobApplication = JobApplication::factory()->create();

        $response = $this->patchJson("/api/job-applications/{$jobApplication->id}/status", [
            'status' => 'Interview',
        ]);

        $response->assertOk();
        $this->assertDatabaseHas('job_applications', [
            'id' => $jobApplication->id,
            'status' => 'Interview',
        ]);
    }

    /**
     * Make sure invalid statuses are rejected when updating job status.
     */
    public function test_updating_job_application_status_requires_valid_status(): void
    {
        $jobApplication = JobApplication::factory()->create();

        $response = $this->patchJson("/api/job-applications/{$jobApplication->id}/status", [
            'status' => 'Pending',
        ]);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['status']);
    }

    /**
     * Verify a job application can be deleted and removed from the database.
     */
    public function test_can_delete_job_application(): void
    {
        $jobApplication = JobApplication::factory()->create();

        $response = $this->deleteJson("/api/job-applications/{$jobApplication->id}");

        $response->assertNoContent();
        $this->assertDatabaseMissing('job_applications', [
            'id' => $jobApplication->id,
        ]);
    }
}
