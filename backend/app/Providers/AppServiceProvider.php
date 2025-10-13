<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register container bindings and other application services used by the app.
     *
     * This is currently a placeholder but documents where framework bindings would
     * be registered if the project grows.
     */
    public function register(): void
    {
        //
    }

    /**
     * Perform application bootstrapping such as configuring observers or macros.
     *
     * Left empty for now so future maintainers know where to add startup logic.
     */
    public function boot(): void
    {
        //
    }
}
