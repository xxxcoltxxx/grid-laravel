# grid-laravel

`composer require xxxcoltxxx/grid-laravel`

`config/app.php:`
```php
$providers => [
    ...
    Paramonov\Grid\GridServiceProvider::class,
],
```

`FooController:`
```php
$cfg = [
    'columns' => [
        new TextField(new ILike(), 'tasks::id', trans('objects.default.id')),
        new TextField(new ILike(), 'tasks::title', trans('fields.tasks.title'),
        new TextField(new ILike(), 'projects::title', trans('objects.tasks.title')),
    ],
    'limits' => [
        5, 10, 25, 50
    ],
    'filter_all' => new SearchAllField(new ILike('CAST({field} AS TEXT)'), trans('form.search-all-fields'))
];

$source = Task::leftJoin('projects', 'tasks.project_id', '=', 'projects.id');

$grid = new GridTable($source, $cfg);

return view('foo.index', compact('grid'));
```
`foo/index.blade.php:`
```php
{!! $grid !!}
```
