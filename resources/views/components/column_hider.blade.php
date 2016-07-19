<select class="form-control input-sm"
        data-style="btn-primary btn-sm"
        multiple
        data-selected-text-format="static"
        title="<i class='fa fa-cog'></i>"
        data-width="50px"
        data-dropdown-align-right="true"
        selectpicker
        ng-model="columns_hider"
        ng-change="columns_hider = clearSelect(columns_hider, default_colums)"
>

    @foreach($columns as $field => $column)
        <option @if(in_array($field, $system_fields)) class="hidden"
                @endif value="{{ $field }}">{{ $column['title'] }}</option>
    @endforeach
        <option data-divider="true"></option>
        <option value="" data-icon="fa fa-repeat">@lang('grid::main.reset-columns')</option>
</select>