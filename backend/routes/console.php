<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    // Output a random inspirational quote when the command is executed.
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');
