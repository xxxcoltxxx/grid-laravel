<tr ng-show="data == undefined || data.length == 0">
    <td colspan="{{ count($columns)  }}" class="text-center">
        <span ng-show="data == undefined">Загрузка...</span>
        <span ng-show="data.length == 0">Не найдено ни одного проекта</span>
    </td>
</tr>
