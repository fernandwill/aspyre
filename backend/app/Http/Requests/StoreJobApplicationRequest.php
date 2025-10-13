<?php

namespace App\Http\Requests;

use App\Models\JobApplication;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreJobApplicationRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'title' => ['required', 'string', 'max:255'],
            'company' => ['required', 'string', 'max:255'],
            'location' => ['required', 'string', 'max:255'],
            'link' => ['required', 'url', 'max:255'],
            'notes' => ['nullable', 'string'],
            'status' => ['nullable', 'string', Rule::in(JobApplication::STATUSES)],
        ];
    }
}
