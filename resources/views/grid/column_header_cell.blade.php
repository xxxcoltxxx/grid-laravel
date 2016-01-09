<th ng-show="showColumn('{{ $field }}')" @if(isset($column['class'])) class="{{ $column['class'] }}" @endif>
    <a href="#" ng-click="sort($event, '{{ $field }}')" ng-class="{
            'text-muted': data_provider.sorting.field != '{{ $field }}'
        }">

        {{ $column['title'] }}

        <i class="fa" ng-class="{
                'fa-sort-amount-asc': data_provider.sorting.dir == 'asc',
                'fa-sort-amount-desc': data_provider.sorting.dir == 'desc'
            }"></i>
    </a>
</th>
