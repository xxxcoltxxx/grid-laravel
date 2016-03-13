# grid-laravel v2.0

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
* angular-sanitize

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

### Добавьте пакет в проект:
`composer require xxxcoltxxx/grid-laravel`

### Добавьте ServiceProvider в файл `config/app.php:`
```php
$providers => [
    ...
    Paramonov\Grid\GridServiceProvider::class,
],
```

### Установите js-библиотеки:
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
bower install --save angular-sanitize
```

### Скопируйте views, lang и assets пакета, которые вы в последствии можете изменять и кастомизировать "под себя":
```
php artisan vendor:publish --provider="Paramonov\Grid\GridServiceProvider"
```
### Если у вас angular-приложение
Добавьте зависимость `ngGrid` в ваш модуль:
```javascript
angular.module('app', ['ngGrid'])

...
```
### Если у вас не angular-приложение
Просто добавьте в конфигурацию `gulp` файл `angular.init.example.js`, как в примере ниже.

### Сконфигурируйте gulp
Это нужно для того, чтобы все js и css объединились в два файла:
`gulpfile.js:`
```javascript
var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.scripts([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/angular/angular.js',
        'bower_components/angular-sanitize/angular-sanitize.js',
        'bower_components/bootstrap/dist/js/bootstrap.js',
        'bower_components/angular-cookies/angular-cookies.js',
        'bower_components/moment/moment.js',
        'bower_components/bootstrap-select/dist/js/bootstrap-select.js',
        'bower_components/angular-bootstrap-select/build/angular-bootstrap-select.js',
        'bower_components/bootstrap-daterangepicker/daterangepicker.js',
        'bower_components/angular-daterangepicker/js/angular-daterangepicker.js',
        'bower_components/angular-bootstrap/ui-bootstrap-tpls.js',
        'resources/assets/vendor/grid/js/angular.init.example.js', // Этот файл нужно подключить, если у вас не angular-приложение
        'resources/assets/vendor/grid/js/ngGrid.js'
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

### Запустите gulp
На production их дополнительно можно минифицировать, добавить ключ `--production` при запуске gulp:
```
gulp
```

## Добавление табличного представления

### Добавьте роут
`app/Http/routes.php:`
```php
...

Route::get('/', ['uses' => 'UsersController@index']);
# Опционально: отдельные роуты для загрузки табличных данных - json и csv
Route::get('/users.json', ['uses' => 'UsersController@gridData', 'as' => 'users.json']);
Route::get('/users.csv', ['uses' => 'UsersController@gridCsv', 'as' => 'users.csv']);
...
```

### Создайте провайдер данных
Провайдер данных должен расширять класс `GridDataProvider`. Например, `app/GridDataProviders/UsersDataProvider.php`
```php

namespace App\GridDataProviders;


use App\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Facades\Config;
use Paramonov\Grid\GridDataProvider;
use Paramonov\Grid\GridPagination;

class UsersDataProvider extends GridDataProvider
{

    /**
     * Запрос для выборки данных для таблицы
     *
     * @return Builder
     */
    public function query()
    {
        return User::leftJoin('user_companies', 'user_companies.id', '=', 'users.company_id');
    }


    /**
     * Пагинация
     *
     * @return GridPagination
     */
    public function pagination()
    {
        return new GridPagination([5, 10, 15, 25, 50]);
    }

    /**
     * Фильтрация выборки. Аналог scope в модели
     * Ключи массива должны совпадать с ключами массива из view
     *
     * @return \Closure[]
     */
    public function filters()
    {
        return [
            'id' => function(Builder $query, $search) {
                if (is_numeric($search)) {
                    $query->where('users.id', $search);
                }
            },
            'name' => function(Builder $query, $search) {
                if (is_string($search)) {
                    $query->whereRaw('LOWER(users.name) like LOWER(?)', ['%' . $search . '%']);
                }
            },
            'email' => function(Builder $query, $search) {
                if (is_string($search)) {
                    $query->whereRaw('LOWER(users.email) like LOWER(?)', ['%' . $search . '%']);
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
                        $query->whereRaw('LOWER(users.name) like LOWER(?)', ['%' . $search . '%'], 'or');
                        $query->whereRaw('LOWER(users.email) like LOWER(?)', ['%' . $search . '%'], 'or');
                        $query->whereRaw('LOWER(user_companies.title) like LOWER(?)', ['%' . $search . '%'], 'or');

                        $database_driver = Config::get('database.default');
                        $cast = 'TEXT';
                        if ($database_driver == 'mysql') {
                            $cast = 'CHAR';
                        }

                        $query->whereRaw('CAST(users.created_at AS ' . $cast . ') like ?', ['%' . $search . '%'], 'or');
                        $query->whereRaw('CAST(users.updated_at AS ' . $cast . ') like ?', ['%' . $search . '%'], 'or');
                    });

                }
            }
        ];
    }


    /**
     * Необязательный метод
     * url для подгрузки данных
     *
     * @return string
     */
    protected function dataUrl()
    {
        return route('users.json');
    }

    /**
     * Необязательный метод
     * url для загрузки CSV-файла
     *
     * @return string
     */
    protected function csvUrl()
    {
        return route('users.csv');
    }


    /**
     * Необязательный метод
     * Поля типа "Дата"
     *
     * @return array
     */
    protected function dates()
    {
        return ['created_at', 'updated_at'];
    }

    /**
     * Необязательный метод
     * Фильтры по-умолчанию
     * Они применяются, если фильтры отсутствуют или пользователь сбросил все фильтры
     *
     * @return array
     */
    protected function dateFormat()
    {
        return 'd.m.Y в H:i:s';
    }

    /**
     * Необязательный метод
     * Сортировка по умолчанию
     *
     * @return array
     */
    protected function defaultSorting()
    {
        return ['field' => 'id', 'dir' => 'asc'];
    }
}

```

### Создайте метод контроллера
`app/Http/Controllers/UsersController.php:`
```php

namespace App\Http\Controllers;


use App\GridDataProviders\UsersDataProvider;
use Illuminate\Routing\Controller;
use Paramonov\Grid\GridTable;

class UsersController extends Controller
{
    protected $grid;

    public function __construct(UsersDataProvider $users_data_provider)
    {
        $this->grid = new GridTable($users_data_provider);
    }

    public function index()
    {
        return view('users.index', ['grid' => $this->grid]);
    }

    public function gridData()
    {
        // Если вы создавали отдельный шаблон для рендеринга ячеек, то этот шаблон передается параметром
        return $this->grid->getData('users.grid.cells');
    }

    public function gridCsv()
    {
        return $this->grid->getCSV('Users');
    }
}

```

### Создайте шаблон

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
<div class="container">
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
            // Можно ячейку описать как Angular-выражение
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
            'data-class' => 'text-center',
            'class' => 'col-lg-2'
        ],
        'updated_at' => [
            'title' => 'Обновлен',
            'type' => 'daterange',
            'data-class' => 'text-center',
            'class' => 'col-lg-2'
        ]
    ],
    // Опционально. По умолчанию подключаются эти компоненты. Это обычные views, можно создавать свои компоненты
    [
        'search_all',
        'column_hider',
        'download_csv'
    ])
 !!}
</div>

<script src="/js/scripts.js" type="application/javascript"></script>
</body>
</html>

```

### Опционально: создайте шаблон для рендеринга ячеек

Вы можете создать шаблон для рендеринга любых ячеек таблицы. Они будут генерироваться на сервере с помощью view.
Каждую ячейку в шаблоне blade можно описать в секциях. В секцию передаются название поля `$field_name` и запись таблицы `$item`
`resources/views/users/grid/cell.blade.php`
```
@section('name')
    <img src="https://robohash.org/{{ $item->name }}.png?size=16x16" />
    {{ $item->name }}
@stop
```

### Опционально: создайте шаблон для рендеринга csv-ячеек

Вы можете создать шаблон для рендеринга любых ячеек в csv. Удобно, когда нужно в одну ячейку вывести не простое поле, а, например, ФИО или список контактов пользователя (телефоны, email, skype и т.д.). При отсутствии шаблона будет выведено поле записи.
