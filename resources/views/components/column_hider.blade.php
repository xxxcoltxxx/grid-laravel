<select class="form-control selectpicker input-sm"
        data-style="btn-primary btn-sm"
        multiple
        ng-model="columns_hider"
        data-selected-text-format="static"
        ng-init="loadHider({{ json_encode(array_keys(collect($columns)->where('default_column', true)->toArray() ?: $columns)) }})"
        title="<i class='fa fa-cog'></i>"
        data-width="50px">
    @foreach($columns as $field => $column)
        <option value="{{ $field }}">{{ $column['title'] }}</option>
    @endforeach
</select>
