<?php

$defaultOrigins = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
];

$frontendOrigins = array_filter([
    env('FRONTEND_URL'),
    env('FRONTEND_URL_ALT'),
]);

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_unique(array_merge($defaultOrigins, $frontendOrigins))),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,
];
