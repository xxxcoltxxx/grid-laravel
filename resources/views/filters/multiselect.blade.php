<select
        class="form-control input-sm selectpicker"
        data-style="btn-white"
        ng-model="data_provider.search.{{ $field }}"
        multiple
        title="---"
        data-selected-text-format="count"
        data-count-selected-text="@lang('grid::main.select.data_count')">

    @foreach($column['options'] as $value => $option)
        <option value="{{ $value }}">{{ $option }}</option>
    @endforeach
</select>