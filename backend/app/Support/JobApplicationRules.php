<?php

namespace App\Support;

use App\Models\JobApplication;
use Illuminate\Validation\Rule;

class JobApplicationRules
{
    /**
     * Build validation rules for all editable job application fields.
     *
     * @param bool $partial Whether the rules should allow missing fields for updates.
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
     * Build validation rules for requests that only change the status field.
     */
    public static function status(): array
    {
        return [
            'status' => ['required', 'string', Rule::in(JobApplication::STATUSES)],
        ];
    }
}
