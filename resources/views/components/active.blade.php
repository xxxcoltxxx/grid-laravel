<select class="form-control selectpicker input-sm"
        multiple
        ng-model="search.active"
        ng-init="search.active = ['1']"
        data-selected-text-format="count"
        data-count-selected-text="@lang('system.form.labels.all')"
        title="---"
        data-width="60px">
    <option value="1" data-icon="fa fa-eye" ></option>
    <option value="0" data-icon="fa fa-eye-slash" ></option>
</select>
