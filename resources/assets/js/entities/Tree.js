import TreeItem from "./TreeItem";

import { LIMIT_VISIBLE } from "./GridDataProvider";

export default class Tree {
    /**
     * @param {GridDataProvider} provider
     * @param {Array} items
     * @param {?{id: number}} parent
     */
    constructor(provider, items, parent = null) {
        this.provider = provider;
        this.q = this.provider.q;
        this.http = this.provider.http;
        this.timeout = provider.timeout;

        this.url = this.provider.url;
        this.last_from_index = 0;
        this.is_loading = false;
        this.loading_promise = null;
        this.search_results = [];
        this.resetCurrentSearch();

        /**
         * Массив всех итемов дерева
         *
         * @type {Array.<TreeItem>}
         */
        this.items = [];

        /**
         * Массив со ссылками на отображаемые элементы
         *
         * @type {Array}
         */
        this.rows = [];

        /**
         * Индексы для быстрого поиска - по id и по parent_id
         *
         * @type {{id: {}, parent_id: {}}}
         */
        this.indexes = {
            id: {},
            parent_id: {},
            visible: []
        };

        /**
         * Кеширующий флаг, который true, если все ветки раскрыты. Для отображения кнопки "Раскрыть/свернуть все"
         * @type {boolean}
         */
        this.all_expanded = false;

        let tree_items = [];
        items.forEach(item => {
            if (parent.id) {
                if (item.id == parent.id) {
                    return;
                }
                if (parent.id == item.parent_id) {
                    item.parent_id = null;
                }
            }
            let tree_item = new TreeItem(item.id, item.parent_id, item.allowed);
            tree_items.push(tree_item);
            this.pushTreeIndexes(tree_item)
        });

        this.buildChildren();
        this.buildVisibleIndex();
    }

    /**
     * Индексирует дерево
     *
     * @param {TreeItem} tree_item
     */
    pushTreeIndexes(tree_item) {

        this.indexes.id[tree_item.id] = tree_item;

        if (! this.indexes.parent_id.hasOwnProperty(tree_item.parent_id)) {
            this.indexes.parent_id[tree_item.parent_id] = [];
        }
        this.indexes.parent_id[tree_item.parent_id].push(tree_item);
    }

    /**
     * Заполняет все дочерние итемы у всех итемов, вычисляет у них некоторые св-ва
     *
     * @param parent
     * @param level
     * @returns {Array.<TreeItem>}
     */
    buildChildren(parent = null, level = 1) {
        let item_parent_id = parent ? parent.id : null;
        let children = this.indexes.parent_id[item_parent_id];

        if (! children) {
            return [];
        }

        children.forEach(item => {
            // Добавляем итем
            item.level = level;
            item.has_allowed_parents = this.hasAllowedParents(item);

            this.items.push(item);

            item.addChildren(this.buildChildren(item, level + 1));
        });

        return children;
    }

    /**
     * Просчитывает индекс по отображаемым итемам
     */
    buildVisibleIndex() {
        this.indexes.visible = [];
        this.items.forEach(item => {
            if (! item.is_hidden) {
                this.indexes.visible.push(item);
            }
        });

        this.updateLoadButtons();
    }

    /**
     * Проверка, доступен ли родительский итем
     *
     * @param item
     * @returns {boolean}
     */
    hasAllowedParents(item) {
        if (! item.parent_id) {
            return item.is_allowed;
        }

        let parent = this.getTreeItem(item.parent_id);

        if (! parent) {
            return false;
        }

        if (parent.is_allowed) {
            return true;
        }

        return this.hasAllowedParents(parent);
    }

    /**
     * Находит id итемов, удовлетворяющих фильтрам грида
     */
    search() {
        if (! this.provider.search.all) {
            this.resetSearch();

            return true;
        }

        if (this.loading_promise) {
            this.loading_promise.resolve();
        }

        let params = {
            type: 'tree_filter',
            search: {all: this.provider.search.all}
        };

        console.debug('Загрузка данных для дерева ', params);

        this.is_loading = true;

        this.loading_promise = this.q.defer();

        this.http.get(this.url, {timeout: this.loading_promise.promise, params: params})
            .then(response => {
                this.timeout(() => this.is_loading = false);

                let index1, index2;

                this.resetCurrentSearch();
                this.search_results = response.data.sort((id1, id2) => {
                    index1 = this.items.findIndex(__item => __item.id == id1);
                    index2 = this.items.findIndex(__item => __item.id == id2);

                    return index1 > index2 ? 1 : -1;
                });

                this.moveResult(1);
                this.loading_promise = null;
                return response;
            })
            .catch(() => this.is_loading = false);

        return this.loading_promise;
    }

    /**
     * Сбрасывает текущий результат поиска на значения по-умолчанию
     */
    resetCurrentSearch() {
        this.current_search_result = {
            index: -1,
            id: null
        };
    }

    /**
     * Очищает результат поиска
     */
    resetSearch() {
        this.timeout(() => {
            this.search_results = [];
            this.resetCurrentSearch();
            this.provider.search.all = '';
        });
    }

    /**
     * Сдвигает результат поиска на delta
     * @param {number} delta
     */
    moveResult(delta) {
        let index = this.current_search_result.index === -1 ? 0 : this.current_search_result.index + delta;
        if (index < 0) {
            index = this.search_results.length - 1;
        }
        if (index > this.search_results.length - 1) {
            index = 0;
        }

        let item_id = this.search_results[index];

        if (! this.search_results.length || ! item_id) {
            console.error('Нет результатов поиска');
            return false;
        }

        // Ищем этот итем
        this.current_search_result = {
            index: index,
            id: item_id
        };

        if (! this.current_search_result) {
            return false;
        }

        return this.loadItemById(item_id);
    }

    /**
     * Возвращает итем по его id
     *
     * @param id
     * @returns {TreeItem,undefined}
     */
    getTreeItem(id) {
        return this.indexes.id[id];
    }

    loadItemById(item_id) {
        let search_item = this.items.find(item => item.id == item_id);

        if (! search_item) {
            console.error('Не найден id ' + item_id);
            return false;
        }

        // Раскрываем все родительские итемы
        this.expandItemWithParents(search_item);

        // Пересчитываем индекс видимых элементов
        this.buildVisibleIndex();

        // Вычисляем from_index
        let visible_index = this.indexes.visible.findIndex(item => item.id == item_id);
        let from_index = visible_index - Math.floor(LIMIT_VISIBLE / 2);

        // Получаем массив идентификаторов для загрузки
        let identifiers = this.identifiersRange(from_index);

        // Получаем item_id, которые нужно запросить с сервера
        let identifiers_to_load = this.filterByNotLoaded(identifiers);

        // Загружаем часто дерева с результатами
        return this.loadItems(identifiers_to_load)
            .then(response => {
                let item, tree_item;

                this.rows = [];
                identifiers.forEach(id => {
                    tree_item = this.getTreeItem(id);

                    if (! tree_item.item) {
                        item = response.data.items.find(loaded_item => loaded_item.id == id);

                        if (!item || !tree_item) {
                            return true;
                        }

                        tree_item.item = item;
                    }

                    this.rows.push(tree_item);
                });


                // Подсвечиваем найденные результаты

                // Прокручиваем так, чтобы результат был посередине
                this.timeout(() => {
                    let container = this.provider.container;
                    let row = container.find('tr[data-id=' + item_id + ']');
                    if (container.length && row.length) {
                        container[0].scrollTop = row.position().top - (container.height() / 2 - row.height() / 2);
                    }
                });
            });
    }

    /**
     * Загружает результат поиска по его id
     *
     * @param item_id
     * @returns {*}
     */
    loadSearchResult(item_id) {

        this.loadItemById(item_id);
    }

    /**
     * Раскрывает итем вместе со всеми родителями рекурсивно
     *
     * @param {TreeItem} item
     */
    expandItemWithParents(item) {
        let parent = this.getTreeItem(item.parent_id);
        let saver = 0;

        while (parent && saver < 100) {
            parent.toggleExpanded(true);
            parent = this.getTreeItem(parent.parent_id);
            saver++;
        }
    }

    /**
     * Смещает дерево на delta итемов
     *
     * @returns {Promise}
     */
    moveTree(delta = 0, use_cache = true) {
        if (this.is_loading) {
            return null;
        }

        let moved_identifiers = this.movedIdentifiers(delta);
        let identifiers_to_load = moved_identifiers;

        if (use_cache) {
            identifiers_to_load = this.filterByNotLoaded(identifiers_to_load);
        }

        return this.loadItems(identifiers_to_load)
            .then(response => {
                let item, tree_item;

                let merged_id = this.mergedIdentifier(moved_identifiers);

                this.saveScrollVisibility(merged_id, () => {
                    this.rows = [];
                    moved_identifiers.forEach(id => {
                        tree_item = this.getTreeItem(id);

                        if (! tree_item.item) {
                            item = response.data.items.find(loaded_item => loaded_item.id == id);

                            if (!item || !tree_item) {
                                return true;
                            }

                            tree_item.item = item;
                        }

                        this.rows.push(tree_item);
                    });
                });
            });
    }

    /**
     * Фильтрует переданные идентификаторы по тем, которые не были загружены ранее, чтобы не запрашивать данные, которые уже есть
     *
     * @param identifiers
     */
    filterByNotLoaded(identifiers) {
        return identifiers.filter(id => {
            let item = this.getTreeItem(id);
            if (! item) {
                return true;
            }

            if (! item.is_allowed) {
                return false;
            }

            return ! item.item;
        });
    }

    /**
     * Возвращает первый итем, который отображается сейчас и будет отображаться после загрузки
     *
     * @param identifiers
     */
    mergedIdentifier(identifiers) {
        return identifiers.find(id => !! this.rows.find(item => item.id == id));
    }

    /**
     * Выполняет handler, сохраняя видимыми итемы, которые видны сейчас
     *
     * @param {number} id
     * @param {function} handler
     */
    saveScrollVisibility(id, handler) {
        let container, first_row, first_row_offset_before;

        if (id) {
            container = $(this.provider.selector);
            first_row = container.find('tr[data-id=' + id + ']');

            if (first_row.length) {
                first_row_offset_before = first_row.position().top;
            }
        }

        handler();

        if (id) {
            first_row = container.find('tr[data-id=' + id + ']');
            if (first_row.length) {
                this.timeout(() => {
                    // Определяем, какое смещение у этого элемента после изменения строк
                    let scroll_top_after = container.scrollTop();
                    let first_row_offset_after = first_row.position().top;

                    // Смещаем грид на эту разницу
                    container[0].scrollTop = scroll_top_after + (first_row_offset_after - first_row_offset_before);
                });
            }
        }

    }

    /**
     * Вычисляет массив id, который будет отображаться после подгрузки
     *
     * @param delta Кол-во записей на которое нужно сдвинуть грид
     * @returns {Array}
     */
    movedIdentifiers(delta) {
        this.buildVisibleIndex();

        let from_index = 0;

        if (this.rows.length) {
            from_index = this.indexes.visible.findIndex(item => item.id == this.rows[0].id);
        }

        if (! from_index) {
            from_index = delta;
        } else {
            from_index = from_index + delta;
        }

        return this.identifiersRange(from_index);
    }

    /**
     * Возвращает массив id, который должен отображаться, если первый отображаемый итем = from_index
     * @param from_index
     * @returns {Array.<number>}
     */
    identifiersRange(from_index) {
        let identifiers = [];

        from_index = Math.min(from_index, this.indexes.visible.length - LIMIT_VISIBLE);
        from_index = Math.max(0, from_index);

        this.last_from_index = from_index;


        this.indexes.visible.forEach((item, i) => {
            if (i < from_index) {
                return;
            }

            if (identifiers.length < LIMIT_VISIBLE) {
                identifiers.push(item.id);
            }
        });

        return identifiers;
    }

    /**
     * Загружает данные для грида
     *
     * @param identifiers
     * @returns {Promise}
     */
    loadItems(identifiers) {
        if (! identifiers.length) {
            let q = this.q.defer();
            q.resolve({data: {items: []}});

            return q.promise;
        }

        let params = {
            type: 'json',
            search: {tree: identifiers},
            pagination: {
                current_page: 1,
                items_per_page: identifiers.length
            }
        };
        console.debug('Загрузка данных для дерева ', params);

        this.is_loading = true;

        return this.http.get(this.url, {params: params})
            .then(response => {
                this.timeout(() => this.is_loading = false);

                return response;
            })
            .catch(() => this.is_loading = false);
    }

    /**
     * Проверяет, все ли ветки дерева раскрыты
     *
     * @returns {boolean}
     */
    calcAllExpanded() {
        let all_expanded = true;

        for (let item of this.items) {
            if (item.is_allowed && ! item.expanded && item.children.length) {
                all_expanded = false;
                break;
            }
        }

        this.all_expanded = all_expanded;

        return all_expanded;
    }

    /**
     * Раскрывает/скрывает ветку итема
     *
     * @param item
     * @param state
     * @returns {boolean}
     */
    toggleExpanded(item, state = null) {
        if (this.is_loading) {
            return false;
        }

        item.toggleExpanded(state);
        this.calcAllExpanded();
        this.moveTree(0);
    }

    /**
     * Раскрывает все ветки дерева
     */
    expandAll() {
        this.items.forEach(item => {
            if (item.is_allowed) {
                item.expanded = true;
                item.is_hidden = false;
            }
        });

        this.calcAllExpanded();
        this.moveTree(0);
    }

    /**
     * Сворачивает все ветки дерева
     */
    collapseAll() {
        this.items.forEach(item => {
            if (item.is_allowed) {
                item.expanded = false;
                item.is_hidden = item.level != 1;
            }
        });

        this.calcAllExpanded();
        this.moveTree(0);
    }

    /**
     * Обновляет состояние кнопок подгрузки (отображение, доступность кнопки)
     */
    updateLoadButtons() {
        if (! this.indexes) {
            return;
        }

        this.load_buttons = {
            up: {
                disabled: this.is_loading || ! this.last_from_index,
                visible: this.last_from_index < this.indexes.visible.length - LIMIT_VISIBLE - 1
            },
            down: {
                disabled: this.is_loading,
                visible: this.last_from_index < this.indexes.visible.length - LIMIT_VISIBLE - 1
            }
        };
    }

    set is_loading(is_loading) {
        this._is_loading = is_loading;

        this.updateLoadButtons();
    }

    get is_loading() {
        return this._is_loading;
    }

    set last_from_index(last_from_index) {
        this._last_from_index = last_from_index;

        this.updateLoadButtons();
    }

    get last_from_index() {
        return this._last_from_index;
    }
}