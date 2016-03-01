<select
        class="form-control input-sm"
        data-style="btn-default btn-sm"
        multiple
        title="--//--"
        data-selected-text-format="count"
        data-live-search='true'
        data-none-results-text=""
        data-container="body"
        data-count-selected-text="@lang('grid::main.select.data_count')"
        selectpicker
        ng-model="data_provider.search.{{ $field }}"
>
    <option>--//--</option>
    @foreach($column['options'] as $value => $option)
        <option value="{{ $value }}">{{ $option }}</option>
    @endforeach
</select>