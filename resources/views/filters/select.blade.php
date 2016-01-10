<select
        class="form-control input-sm selectpicker"
        data-style="btn-default btn-sm"
        ng-model="data_provider.search.{{ $field }}">

    @foreach($column['options'] as $value => $option)
        <option value="{{ $value }}">{{ $option }}</option>
    @endforeach
</select>