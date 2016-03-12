<select class="form-control input-sm"
        data-style="btn-primary btn-sm"
        multiple
        data-selected-text-format="static"
        title="<i class='fa fa-cog'></i>"
        data-width="50px"
        data-dropdown-align-right="true"
        selectpicker
        ng-model="columns_hider"
        ng-init="loadHider({{ json_encode(collect($columns)->where('default_column', true)->keys()->toArray() ?: $columns) }})"
>

    @foreach($columns as $field => $column)
        <option @if(in_array($field, $system_fields)) class="hidden"
                @endif value="{{ $field }}">{{ $column['title'] }}</option>
    @endforeach
</select>