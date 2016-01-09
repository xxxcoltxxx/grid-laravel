{!! Form::select($field, $column['options'], '',
    [
        'class' => 'form-control input-sm selectpicker',
        'data-style' => 'btn-white',
        'ng-model' => 'data_provider.search.' . $field,
    ]
) !!}