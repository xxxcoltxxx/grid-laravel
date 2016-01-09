<div class="input-group" style="width: 210px">
    <input type="text" class="input-sm form-control"
           date-range-picker
           ng-model="data_provider.search.{{ $field }}"
           ng-init="clearPicker('{{ $field }}')"
    />
    <span class="input-group-btn">
        <button class="btn clear-btn btn-white input-sm" type="button" ng-click="clearPicker('{{ $field }}')">
            <i class="fa fa-remove"></i>
        </button>
    </span>
</div>