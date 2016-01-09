# grid-laravel

`composer require xxxcoltxxx/grid-laravel`

```
bower install --save jquery
bower install --save bootstrap
bower install --save angular
bower install --save angular-cookies
bower install --save bootstrap-daterangepicker
bower install --save angular-daterangepicker
bower install --save bootstrap-select
bower install --save angular-bootstrap-select
```

`config/app.php:`
```php
$providers => [
    ...
    Paramonov\Grid\GridServiceProvider::class,
],
```

```
php artisan vendor:publish --provider="Paramonov\Grid\GridServiceProvider"
```

`gulpfile.js:`
```javascript
var elixir = require('laravel-elixir');

elixir(function(mix) {
    mix.scripts([
        'jquery/dist/jquery.js',
        'angular/angular.js',
        'angular-cookies/angular-cookies.js',
        'bootstrap-select/dist/js/bootstrap-select.js',
        'bootstrap-daterangepicker/daterangepicker.js',
        'angular-daterangepicker/js/angular-daterangepicker.js',
        'angular-bootstrap-select/build/angular-bootstrap-select.js',
        'resources/vendor/assets/js/GridCtrl.js'
    ], 'public/js/scripts.js');

    mix.styles([
        'bootstrap/dist/css/bootstrap.css',
        'bootstrap-daterangepicker/daterangepicker.css',
        'bootstrap-select/dist/css/bootstrap-select.css',
        'select2/dist/css/select2.css',
        'bootstrap-select/dist/css/bootstrap-select.css'
        'resources/vendor/assets/css/grid.css'
    ], 'public/css/styles.css');

});
```

```
gulp
```

`GridDataProviders/ProjectsDataProvider.php`
```php

namespace App\GridDataProviders;


use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use App\Project;
use Paramonov\Grid\GridDataProvider;
use Paramonov\Grid\GridPagination;


class ProjectsDataProvider implements GridDataProvider
{
    private $query;
    private $pagination;
    private $filters;

    public function __construct()
    {
        $this->query = $this->query();
        $this->pagination = $this->pagination();
        $this->filters = $this->filters();
    }

    /**
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function query()
    {
        if (is_null($this->query)) {
            $this->query = Project::leftJoin('project_statuses', 'projects.project_status_id', '=', 'project_statuses.id')
            ->leftJoin('project_types', 'projects.project_type_id', '=', 'project_types.id');
        }
        return $this->query;
    }

    /**
     * @return \Paramonov\Grid\GridPagination
     */
    public function pagination()
    {
        if (is_null($this->pagination)) {
            $this->pagination = new GridPagination();
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
                'all' => function (Builder $query, $search) {
                    $query->where(function (Builder $query) use ($search) {
                        $query->likeField($search, 'projects.id', false, 'or');
                        $query->likeField($search, 'projects.title', true, 'or');
                        $query->likeField($search, 'project_types.title', true, 'or');
                        $query->likeField($search, 'project_statuses.title', true, 'or');
                        $query->likeDateTimeField($search, 'projects.created_at', trans('datetimes.formats.datetime.sql'), 'or');
                        $query->likeDateTimeField($search, 'projects.updated_at', trans('datetimes.formats.datetime.sql'), 'or');
                    });
                },
                'active' => function (Builder $query, $search) {
                    if (in_array(0, $search)) {
                        if (in_array(1, $search)) {
                            $query->withTrashed();
                        } else {
                            $query->onlyTrashed();
                        }
                    }
                },
                'id' => function (Builder $query, $search) {
                    $query->likeField($search, 'projects.id', false, 'and');
                },
                'title' => function (Builder $query, $search) {
                    $query->likeField($search, 'projects.title', true, 'and');
                },
                'project_statuses.title' => function (Builder $query, $search) {
                    $query->whereIn('project_status_id', $search);
                },
                'project_types.title' => function (Builder $query, $search) {
                    $query->where('project_type_id', $search);
                },
                'created_at' => function (Builder $query, $search) {
                    if ($search['startDate'] && $search['endDate']) {
                        $start_date = Carbon::parse($search['startDate']);
                        $end_date = Carbon::parse($search['endDate']);
                        $query->whereRaw('TO_CHAR(projects.created_at, \'YYYY-MM-DD\') >= ?', [$start_date], 'and');
                        $query->whereRaw('TO_CHAR(projects.created_at, \'YYYY-MM-DD\') <= ?', [$end_date], 'and');
                    }
                },
                'updated_at' => function (Builder $query, $search) {
                    if ($search['startDate'] && $search['endDate']) {
                        $start_date = Carbon::parse($search['startDate']);
                        $end_date = Carbon::parse($search['endDate']);
                        $query->whereRaw('TO_CHAR(projects.updated_at, \'YYYY-MM-DD\') >= ?', [$start_date], 'and');
                        $query->whereRaw('TO_CHAR(projects.updated_at, \'YYYY-MM-DD\') <= ?', [$end_date], 'and');
                    }
                },
            ];
        }
        return $this->filters;
    }

    /**
     * @return array
     */
    public function getDefaultSorting()
    {
        return ['field' => 'id', 'dir' => 'asc'];
    }
}
```

`app/Http/Controllers/ProjectsController.php:`
```php

class ProjectsController extends Controller
{
    public function index(Request $request)
    {
        $grid = new GridTable(new ProjectsDataProvider());
        if ($request->get('getData')) {
            return $grid->getData();
        }
        return view('projects.index', compact('grid'));
    }
    ...

}
```

`resources/views/projects/index.blade.php`
```php
    ...

    <link href="/public/css/styles.css" rel="stylesheet" />
    <script src="/public/js/scripts.js" type="application/javascript"></script>
    {!! $grid->render(
        [
            'id' => [
                'title' => 'ID',
                'type' => 'string',
                'class' => 'col-lg-1'
            ],
            'title' => [
                'title' => 'Проект',
                'type' => 'string',
                'cell' => "<a href='/projects/@{{ item.id }}/edit'>@{{ item.title }}</a>"
            ],
            'project_statuses.title' => [
                'title' => 'Статус',
                'type' => 'multiselect',
                'options' => \Modules\Projects\Entities\ProjectStatus::lists('title', 'id')
            ],
            'project_types.title' => [
                'title' => 'Тип',
                'type' => 'select',
                'options' => \Modules\Projects\Entities\ProjectType::lists('title', 'id')->prepend('---', '')
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
        ]
    ) !!}

    ...
```
