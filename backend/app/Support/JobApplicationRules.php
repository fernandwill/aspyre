<?php

namespace App\Support;

use App\Models\JobApplication;
use Illuminate\Validation\Rule;

class JobApplicationRules
{
    /**
     * Shared validation rules for job application fields.
     */
    public static function fields(bool $partial = false): array
    {
        $required = $partial ? ['sometimes', 'required'] : ['required'];
        $optional = $partial ? ['sometimes'] : [];

        return [
            'title' => [...$required, 'string', 'max:255'],
            'company' => [...$required, 'string', 'max:255'],
            'location' => [...$required, 'string', 'max:255'],
            'link' => [...$optional, 'nullable', 'url', 'max:255'],
            'notes' => [...$optional, 'nullable', 'string'],
            'status' => $partial
                ? ['sometimes', 'required', 'string', Rule::in(JobApplication::STATUSES)]
                : ['nullable', 'string', Rule::in(JobApplication::STATUSES)],
        ];
    }

    /**
     * Validation rule for updating the status field alone.
     */
    public static function status(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(JobApplication::STATUSES)],
        ];
    }
}
