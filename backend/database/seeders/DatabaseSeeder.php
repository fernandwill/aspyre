<?php

namespace Database\Seeders;

use App\Models\JobApplication;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the database with a demo user and sample job applications.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);

        $jobApplications = [
            [
                'title' => 'Frontend Engineer',
                'company' => 'Aspyre',
                'location' => 'Remote · North America',
                'link' => 'https://jobs.lever.co/example/frontend-engineer',
                'status' => 'Applied',
                'notes' => 'Reached out to recruiter on LinkedIn. Waiting for response.',
            ],
            [
                'title' => 'Product Designer',
                'company' => 'Bright Labs',
                'location' => 'Amsterdam, NL',
                'link' => 'https://boards.greenhouse.io/example/product-designer',
                'status' => 'Interview',
                'notes' => 'Second round scheduled next Tuesday.',
            ],
            [
                'title' => 'Data Scientist',
                'company' => 'Vector Analytics',
                'location' => 'Berlin, DE',
                'link' => 'https://jobs.example.com/vector-analytics/data-scientist',
                'status' => 'Online Assessment',
                'notes' => 'Assessment submitted, awaiting feedback.',
            ],
            [
                'title' => 'Backend Engineer',
                'company' => 'Nimbus Systems',
                'location' => 'Austin, TX',
                'link' => 'https://jobs.example.com/nimbus/backend-engineer',
                'status' => 'Accepted',
                'notes' => 'Offer accepted and start date confirmed for next month.',
            ],
            [
                'title' => 'DevOps Engineer',
                'company' => 'CloudScale',
                'location' => 'Toronto, CA',
                'link' => 'https://jobs.example.com/cloudscale/devops-engineer',
                'status' => 'Rejected',
                'notes' => 'Received rejection email after final interview.',
            ],
        ];

        foreach ($jobApplications as $application) {
            JobApplication::query()->create($application);
        }
    }
}
