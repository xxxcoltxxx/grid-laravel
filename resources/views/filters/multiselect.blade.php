{!! Form::select($field, $column['options'], null,
    [
        'class' => 'form-control input-sm selectpicker',
        'data-style' => 'btn-white',
        'ng-model' => 'data_provider.search.' . $field,
        'multiple',
        'title' => '---',
        'data-selected-text-format' => 'count',
        'data-count-selected-text' => '{0} выбрано'
    ]
) !!}