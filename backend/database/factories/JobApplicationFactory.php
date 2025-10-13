<?php

namespace Database\Factories;

use App\Models\JobApplication;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<JobApplication>
 */
class JobApplicationFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var class-string<JobApplication>
     */
    protected $model = JobApplication::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'title' => $this->faker->jobTitle(),
            'company' => $this->faker->company(),
            'location' => $this->faker->city(),
            'link' => $this->faker->url(),
            'notes' => $this->faker->sentence(),
            'status' => $this->faker->randomElement(JobApplication::STATUSES),
        ];
    }
}
