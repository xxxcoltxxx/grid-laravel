<div class="table-grid" ng-grid>
    <input type="hidden" value="{{ Route::current()->getUri() }}" ng-model="dataUrl" />
    <input type="hidden" ng-init="data_provider.sorting.field = '{{ $sorting['field'] }}'" />
    <input type="hidden" ng-init="data_provider.sorting.dir = '{{ $sorting['dir'] }}'" />

    <div class="grid-loader" ng-show="loading"></div>

    {{-- Grid --}}
    <table class="table table-bordered table-condensed table-hover">
        <thead>
            <tr>
                <td colspan="{{ count($columns) }}">

                    <div class="form-group row">
                        {{-- Компоненты --}}

                        <div class="col-lg-6">
                            {{-- Поиск по всем полям --}}
                            @if (in_array('search_all', $components))
                                @include('grid::components.search_all')
                            @endif
                        </div>

                        <div class="col-lg-6 text-right">

                            {{-- Настройка отображаемых колонок --}}
                            @if (in_array('column_hider', $components))
                                @include('grid::components.column_hider')
                            @endif
                        </div>
                    </div>
                </td>
            </tr>

            {{-- Заголовки колонок --}}
            <tr>
            @foreach($columns as $field => $column)
                @include('grid::grid.column_header_cell')
            @endforeach
            </tr>

            {{-- Фильтры колонок --}}
            <tr>
                @foreach($columns as $field => $column)
                    <th ng-show="showColumn('{{ $field }}')" @if(isset($column['filter-class'])) class="{{ $column['filter-class'] }}" @endif>
                        @include('grid::filters.' . $column['type'])
                    </th>
                @endforeach
            </tr>
        </thead>
        <tbody>
        @include('grid::grid.fallbacks')

        {{-- Данные --}}
        <tr ng-show="data != undefined" ng-repeat="item in data">
            @foreach($columns as $field => $column)
                <td ng-show="showColumn('{{ $field }}')" @if(isset($column['data-class'])) class="{{ $column['data-class'] }}" @endif>
                    @if (isset($column['cell']))
                        {!! $column['cell'] !!}
                    @else
                        @{{ item.{!! $field !!} }}
                    @endif
                </td>
            @endforeach
        </tr>
        </tbody>
    </table>

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