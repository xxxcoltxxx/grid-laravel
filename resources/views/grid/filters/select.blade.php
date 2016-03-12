<select
        class="form-control input-sm"
        data-style="btn-default btn-sm"
        @if(isset($column['live_search']) && $column['live_search'])
            data-live-search='true'
        @endif
        data-none-results-text=""
        data-size="7"
        selectpicker
        ng-model="data_provider.search.{{ $field }}">
    <option value="">--//--</option>
    @foreach($column['options'] as $value => $option)
        <option value="{{ $value }}">{{ $option }}</option>
    @endforeach
</select>