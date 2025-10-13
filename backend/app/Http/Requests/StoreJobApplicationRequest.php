<?php

namespace App\Http\Requests;

use App\Support\JobApplicationRules;
use Illuminate\Foundation\Http\FormRequest;

class StoreJobApplicationRequest extends FormRequest
{
    /**
     * Allow all users to create job applications because there is no auth layer yet.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Define the validation rules for storing a brand new job application.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return JobApplicationRules::fields();
    }
}
