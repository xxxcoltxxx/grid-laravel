<select class="form-control selectpicker input-sm"
        multiple
        ng-model="columns_hider"
        data-selected-text-format="static"
        ng-init="loadHider(['{!! implode("','", array_keys($columns)) !!}'])"
        title="<i class='fa fa-cog'></i>"
        data-width="50px">
    @foreach($columns as $field => $column)
        <option value="{{ $field }}">{{ $column['title'] }}</option>
    @endforeach
</select>
