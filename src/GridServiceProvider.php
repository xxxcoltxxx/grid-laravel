<?php

namespace Paramonov\Grid;

use Illuminate\Support\ServiceProvider;

class GridServiceProvider extends ServiceProvider
{
    /**
     * Register the service provider.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('grid', function($app) {
            return new Grid();
        });
    }

    public function boot()
    {
        $this->loadViewsFrom(__DIR__ . '/../resources/views', 'grid');
        $this->loadTranslationsFrom(__DIR__ . '/../resources/lang', 'grid');

        $this->publishes([
            __DIR__ . '/../resources/assets' => base_path('resources/assets/vendor/grid'),
            __DIR__ . '/../resources/views'  => base_path('resources/views/vendor/grid'),
            __DIR__ . '/../resources/lang'   => base_path('resources/lang/vendor/grid'),
        ]);
    }
}
