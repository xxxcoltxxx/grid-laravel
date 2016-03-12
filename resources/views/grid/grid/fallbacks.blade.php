<tr ng-show="data == undefined || data.length == 0">
    <td colspan="{{ count($columns)  }}" class="text-center">
        <span ng-show="data == undefined">@lang('grid::main.loading')</span>
        <span ng-show="data.length == 0">@lang('grid::main.rows-not-found')</span>
    </td>
</tr>
