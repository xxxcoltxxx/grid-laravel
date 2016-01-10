# grid-laravel

[![Join the chat at https://gitter.im/xxxcoltxxx/grid-laravel](https://badges.gitter.im/xxxcoltxxx/grid-laravel.svg)](https://gitter.im/xxxcoltxxx/grid-laravel?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

* [Демо](http://grid-laravel.colt-web.ru/)
* [Исходный код демо](https://github.com/xxxcoltxxx/grid-laravel-example)

[![Gitter](https://badges.gitter.im/xxxcoltxxx/grid-laravel.svg)](https://gitter.im/xxxcoltxxx/grid-laravel?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Зависимости

* jquery (для библиотеки с выбором дат в фильтрации daterangepicker и bootstrap-select, которая используется для стилизации select. Нативных аналогов не нашёл)
* angularjs
* bootstrap
* font-awesome
* angular-cookies
* bootstrap-daterangepicker
* angular-daterangepicker
* bootstrap-select
* angular-bootstrap-select
* moment (ставится автоматически из зависимостей bootstrap-daterangepicker)
* angular-bootstrap

Следующие зависимости не обязательны. Вы можете руками скачать необходимые js-библиотеки и подключить их в шаблоне. В инструкции по установке рассматривается способ установки через эти утилиты и на ОС Ubuntu 14.04

* npm
* bower
* gulp
* laravel-elixir

Установка npm
```
sudo apt-get install npm npdejs-legacy
```
Установка bower
```
npm i -g bower
```
Установка gulp
```
npm i gulp
```
Установка laravel-elixir (из папки с проектом)
```
npm i
```

## Установка пакета

Добавьте пакет в проект:
`composer require xxxcoltxxx/grid-laravel`

Установите js-библиотеки:
```
bower install --save jquery
bower install --save bootstrap
bower install --save font-awesome
bower install --save angular
bower install --save angular-cookies
bower install --save bootstrap-daterangepicker
bower install --save angular-daterangepicker
bower install --save bootstrap-select
bower install --save angular-bootstrap-select
bower install --save angular-bootstrap
```

Добавьте ServiceProvider в файл `config/app.php:`
```php
$providers => [
    ...
    Paramonov\Grid\GridServiceProvider::class,
],
```

Скопируйте views, lang и assets пакета, которые вы в последствии можете изменять и кастомизировать "под себя":
```
php artisan vendor:publish --provider="Paramonov\Grid\GridServiceProvider"
```

Сконфигурируйте gulp, чтобы все js и css объединились в два файла. На production их дополнительно можно минифицировать, добавить ключ `--production` при запуске gulp:

`gulpfile.js:`
```javascript
var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.scripts([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/moment/moment.js',
        'bower_components/bootstrap-select/dist/js/bootstrap-select.js',
        'bower_components/angular-bootstrap-select/build/angular-bootstrap-select.js',
        'bower_components/bootstrap-daterangepicker/daterangepicker.js',
        'bower_components/angular-daterangepicker/js/angular-daterangepicker.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'resources/assets/vendor/grid/js/angular.init.js',
        'resources/assets/vendor/grid/js/GridCtrl.js'
    ], 'public/js/scripts.js', '.');

    mix.styles([
        'bower_components/bootstrap/dist/css/bootstrap.css',
        'bower_components/font-awesome/css/font-awesome.css',
        'bower_components/bootstrap-select/dist/css/bootstrap-select.css',
        'bower_components/bootstrap-daterangepicker/daterangepicker.css',
        'resources/assets/vendor/grid/css/grid.css'
    ], 'public/css/styles.css', '.');

    mix.copy(
        'bower_components/bootstrap/dist/fonts',
        'public/fonts'
    );
    mix.copy(
        'bower_components/font-awesome/fonts',
        'public/fonts'
    );
});
```

Запустите gulp
```
gulp
```

Создайте `DataProvider`, который должен реализовывать интерфейс `GridDataProvider`. Критически важно, чтобы метод query() возвращал всегда один и тот же объект типа Builder '''НЕ новый'''. Например, `app/GridDataProviders/UsersDataProvider.php`
```php

namespace App\GridDataProviders;


use App\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Paramonov\Grid\GridDataProvider;
use Paramonov\Grid\GridPagination;

class UsersDataProvider implements GridDataProvider
{
    public $query;
    public $pagination;
    public $filters;
    public $default_sorting;

    /**
     * @return Builder
     */
    public function query()
    {
        if (is_null($this->query)) {
            $this->query = User::leftJoin('user_companies', 'user_companies.id', '=', 'users.company_id');
        }
        return $this->query;
    }

    /**
     * @return GridPagination
     */
    public function pagination()
    {
        if (is_null($this->pagination)) {
            $this->pagination = new GridPagination([5, 10, 15, 25, 50]);
        }
        return $this->pagination;
    }

    /**
     * @return \Closure[]
     */
    public function filters()
    {
        if (is_null($this->filters)) {
            $this->filters = [
                'id' => function(Builder $query, $search) {
                    if (is_numeric($search)) {
                        $query->where('users.id', $search);
                    }
                },
                'name' => function(Builder $query, $search) {
                    if (is_string($search)) {
                        $query->where('users.name', 'ilike', '%' . $search . '%');
                    }
                },
                'email' => function(Builder $query, $search) {
                    if (is_string($search)) {
                        $query->where('users.email', 'ilike', '%' . $search . '%');
                    }
                },
                'created_at' => function(Builder $query, $search) {
                    if (
                        is_array($search)
                        && array_key_exists('startDate', $search)
                        && array_key_exists('endDate', $search)
                        && !is_null($search['startDate'])
                        && !is_null($search['endDate'])
                    ) {
                        $start_date = Carbon::parse($search['startDate']);
                        $end_date = Carbon::parse($search['endDate']);
                        $query->where('created_at', '>=', $start_date);
                        $query->where('created_at', '<=', $end_date);
                    }
                },
                'updated_at' => function(Builder $query, $search) {
                    if (
                        is_array($search)
                        && array_key_exists('startDate', $search)
                        && array_key_exists('endDate', $search)
                        && !is_null($search['startDate'])
                        && !is_null($search['endDate'])
                    ) {
                        $start_date = Carbon::parse($search['startDate']);
                        $end_date = Carbon::parse($search['endDate']);
                        $query->where('updated_at', '>=', $start_date);
                        $query->where('updated_at', '<=', $end_date);
                    }
                },
                'user_companies.title' => function(Builder $query, $search) {
                    if (is_array($search)) {
                        $query->whereIn('users.company_id', $search);
                    }
                },
                'all' => function(Builder $query, $search) {
                    if (is_string($search)) {
                        $query->where(function(Builder $query) use ($search) {
                            if (is_numeric($search)) {
                                $query->where('users.id', '=', $search, 'or');
                            }
                            $query->where('users.name', 'ilike', '%' . $search . '%', 'or');
                            $query->where('users.email', 'ilike', '%' . $search . '%', 'or');
                            $query->where('user_companies.title', 'ilike', '%' . $search . '%', 'or');
                            $query->whereRaw('CAST(users.created_at AS TEXT) ilike ?', ['%' . $search . '%'], 'or');
                            $query->whereRaw('CAST(users.updated_at AS TEXT) ilike ?', ['%' . $search . '%'], 'or');
                        });

                    }
                }
            ];
        }
        return $this->filters;
    }

    /**
     * @return array
     */
    public function getDefaultSorting()
    {
        if (is_null($this->default_sorting)) {
            $this->default_sorting = ['field' => 'id', 'dir' => 'asc'];
        }
        return $this->default_sorting;
    }
}
```

`app/Http/Controllers/UsersController.php:`
```php

namespace App\Http\Controllers;


use App\GridDataProviders\UsersDataProvider;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Paramonov\Grid\GridTable;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        $grid = new GridTable(new UsersDataProvider());
        if ($request->get('getData')) {
            return $grid->getData();
        }
        return view('users.index', compact('grid'));
    }
}
```

`resources/views/users/index.blade.php`
```php
<!doctype html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Пользователи</title>
    <link href="/css/styles.css" rel="stylesheet" />
</head>
<body ng-app="app">
{!!
    $grid->render([
        'id' => [
            'title' => 'ИД',
            'type' => 'string',
            'class' => 'col-lg-1'
        ],
        'name' => [
            'title' => 'Имя',
            'type' => 'string',
        ],
        'email' => [
            'title' => 'E-Mail',
            'type' => 'string',
            'cell' => "<a href='mailto:@{{ item.email }}'>@{{ item.email }}</a>"
        ],
        'user_companies.title' => [
            'title' => 'Компания',
            'type' => 'multiselect',
            'options' => \App\UserCompany::query()->lists('title', 'id')
        ],
        'created_at' => [
            'title' => 'Создан',
            'type' => 'daterange',
            'cell' => "@{{ item.created_at | date:'dd.MM.yyyy HH:mm' }}",
            'data-class' => 'text-center',
            'class' => 'col-lg-2'
        ],
        'updated_at' => [
            'title' => 'Обновлен',
            'type' => 'daterange',
            'cell' => "@{{ item.created_at | date:'dd.MM.yyyy HH:mm' }}",
            'data-class' => 'text-center',
            'class' => 'col-lg-2'
        ]
    ])
 !!}

    <script src="/js/scripts.js" type="application/javascript"></script>
</body>
</html>
```

`app/Http/routes.php:`
```php
...

Route::get('/', ['uses' => 'UsersController@index']);

...
```



[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/xxxcoltxxx/grid-laravel/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

