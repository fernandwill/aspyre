<?php

namespace App\Http\Requests;

use App\Support\JobApplicationRules;
use Illuminate\Foundation\Http\FormRequest;

class UpdateJobApplicationStatusRequest extends FormRequest
{
    /**
     * Authorize status updates so long as the caller can reach the endpoint.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Restrict the status update payload to one of the allowed workflow states.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return JobApplicationRules::status();
    }
}
