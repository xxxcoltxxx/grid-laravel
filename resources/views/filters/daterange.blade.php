<div class="input-group input-group-sm" style="width: 210px">
    <input type="text" class="form-control"
           date-range-picker
           ng-model="data_provider.search.{{ $field }}"
    />
    <span class="input-group-btn">
        <button class="btn btn-default" type="button" ng-click="clearPicker('{{ $field }}')">
            <i class="fa fa-remove"></i>
        </button>
    </span>
</div>
