<div class="table-grid" ng-grid ng-cloak
     ng-init="loadHider({{ json_encode(collect($columns)->where('default_column', true)->keys()->toArray() ?: array_keys($columns)) }})"
>
    <input type="hidden" ng-init="data_url = '{{ $data_url ? $data_url : Route::current()->getUri() }}'" />
    <input type="hidden" ng-init="data_provider.sorting.field = '{{ $sorting['field'] }}'" />
    <input type="hidden" ng-init="data_provider.sorting.dir = '{{ $sorting['dir'] }}'" />
    <input type="hidden" ng-init="default_filters = {{ json_encode($default_filters) }}" />

    <div class="grid-loader" ng-style="{opacity: loading_opacity, visibility: loading ? 'visible' : 'hidden'}">
    </div>

    {{-- Grid --}}
    <div class="grid-top">
        <div class="form-group row">
            {{-- Компоненты --}}

            <div class="col-lg-6">
                {{-- Поиск по всем полям --}}
                @if (in_array('search_all', $components))
                    @include('grid::components.search_all')
                @endif
            </div>

            <div class="col-lg-6 right-column text-right">
                {{-- Скачать в CSV --}}
                @if (in_array('download_csv',$components))
                    @include('grid::components.download_csv')
                @endif


                {{-- Настройка отображаемых колонок --}}
                @if (in_array('column_hider', $components))
                    @include('grid::components.column_hider')
                @endif
            </div>
        </div>
    </div>

    <div ng-init="headers = {{ json_encode($headers) }}" class="grid-table-container">
        <table class="table table-bordered table-condensed table-hover">
            <thead>

            {{-- Заголовки колонок --}}
            <tr>
                @foreach($columns as $field => $column)
                    @include('grid::grid.column_header_cell')
                @endforeach
            </tr>

            {{-- Фильтры колонок --}}
            <tr>
                @foreach($columns as $field => $column)
                    <th ng-show="showColumn('{{ $field }}') && show_filters"
                        @if(isset($column['filter-class'])) class="{{ $column['filter-class'] }}" @endif>
                        @if(isset($column['type']))
                            @include('grid::filters.' . $column['type'])
                        @endif
                    </th>
                @endforeach
            </tr>
            </thead>
            <tbody>
            @include('grid::grid.fallbacks')

            {{-- Данные --}}
            <tr ng-show="data != undefined" ng-repeat="item in data" {!! array_get($components, 'row-attrs') !!}>
                @foreach($columns as $field => $column)
                    <td ng-show="showColumn('{{ $field }}')"
                        @if(isset($column['data-class'])) class="{{ $column['data-class'] }}" @endif>
                        @if (isset($column['cell']))
                            {!! $column['cell'] !!}
                        @else
                            <span ng-bind-html="item.{!! $field !!}"></span>
                        @endif
                    </td>
                @endforeach
            </tr>
            </tbody>
        </table>
    </div>

    {{-- Пагинация - селектор кол-ва итемов --}}
    <div class="col-lg-2 pagination">
        @include('grid::grid.pagination.item_per_page')
    </div>

    {{-- Пагинация - кнопки страниц --}}
    <div class="col-lg-8 text-center">
        @include('grid::grid.pagination.page_links')
    </div>

    {{-- Пагинация - информация --}}
    <div class="col-lg-2 pagination text-right">
        @include('grid::grid.pagination.info')
    </div>

    <div class="clearfix"></div>
</div>
