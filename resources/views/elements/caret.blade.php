<?php
use Paramonov\Grid\GridHelper;
?>
<a href="{!! GridHelper::getQueryString([
    'sort' => $field->name,
    'direction' => (request('sort') === $field->name
        ? (request('direction', 'asc') === 'asc' ? 'desc' : 'asc')
        : (request('direction'))
    )
]) !!}"class="pull-right">
    <span @if (request('sort') != $field->name) class="text-muted" @endif>
        <i class="glyphicon glyphicon-triangle-{{ request('direction', 'asc') == 'asc' ? 'top' : 'bottom' }}"></i>
    </span>
</a>
