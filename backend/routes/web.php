<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    // Render the default welcome page when visiting the browser root.
    return view('welcome');
});
