<?php

namespace App\Http\Requests;

use App\Support\JobApplicationRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationRequest extends FormRequest
{
    /**
     * Permit updates to job applications while access control is handled elsewhere.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Provide validation rules for partially updating job application fields.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return JobApplicationRules::fields(true);
    }
}
