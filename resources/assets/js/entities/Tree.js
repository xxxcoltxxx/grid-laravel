import TreeItem from "./TreeItem";

const CHUNK_SIZE = 1000;

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
        this.url = this.provider.url;
        this.items = [];
        this.rows = [];

        this.key_map = {
            id: {},
            parent_id: {}
        };
        this.all_expanded = false;
        this.fully_loaded = false;

        let time = new Date();
        items.forEach(item => {
            let tree_item = new TreeItem(item.id, item.parent_id);
            tree_item.is_hidden = true;

            this.key_map.id[item.id] = tree_item;

            if (! this.key_map.parent_id.hasOwnProperty(item.parent_id)) {
                this.key_map.parent_id[item.parent_id] = [];
            }
            this.key_map.parent_id[item.parent_id].push(tree_item);
        });

        this.findChildren(items, parent);
        console.log(`build time: ${(new Date()).getTime() - time.getTime()} ms`);
    }

    findChildren(items, parent = null, level = 1) {
        let item_parent_id = parent ? parent.id : null;

        let children = this.key_map.parent_id[item_parent_id];

        if (! children) {
            return [];
        }

        children.forEach(item => {
            // Добавляем итем
            item.level = level;
            item.expanded = false;
            item.is_hidden = !! item_parent_id;
            this.items.push(item);

            item.addChildren(this.findChildren(items, item, level + 1));
        });

        return children;
    }

    loadTreeData() {
        let chunks = [];
        let i = 0;

        this.items.forEach((item, index) => {
            i = Math.floor(index / CHUNK_SIZE);
            if (! chunks.hasOwnProperty(i)) {
                chunks[i] = [];
            }
            chunks[i].push(item.id);
        });

        return this.fetchTree(chunks)
            .then(() => {
                console.debug(`Данные для дерева загружены (${this.items.length} строк)`);
                this.calculateParents();
                this.fully_loaded = true;
            })
    }

    calculateParents() {
        console.debug('Переформирую дерево с учетом доступных строк...');
        this.items.forEach((tree_item, index) => {
            if (! tree_item.item) {
                this.items.splice(index, 1);
                tree_item.expanded = true;
            }
        });

        this.items.forEach(tree_item => {
            if (! tree_item.parent_id) {
                tree_item.parent_allowed = true;
                return true;
            }

            let parent = this.getTreeItem(tree_item.parent_id);
            tree_item.parent_allowed = tree_item.level == 1 || parent && parent.item;
            if (! this.hasAllowedParent(tree_item)) {
                tree_item.is_hidden = false;
            }
        });

        console.debug('Готово');
    }

    hasAllowedParent(item) {
        if (! item.parent_id) {
            return !! item.item;
        } else {
            let parent = this.getTreeItem(item.parent_id);
            if (! parent) {
                return !! item.item;
            }
            if (!! parent.item) {
                return true;
            }
            return this.hasAllowedParent(parent);
        }
    }

    getTreeItem(id) {
        return this.key_map.id[id];
    }

    fetchTree(chunks) {
        let resolver = this.q.defer();
        let promise = resolver.promise;

        chunks.forEach(chunk => {
            promise = promise.then(() => {
                return this.runChunk(chunk);
            });
        });

        resolver.resolve();

        return promise;
    }

    runChunk(chunk) {
        let params = {
            type: 'json',
            search: {tree: chunk},
            pagination: {
                current_page: 1,
                items_per_page: chunk.length
            }
        };
        console.debug('Загрузка данных для дерева ', params);

        return this.http
            .get(this.url, {params: params})
            .then(response => {
                response.data.items.forEach(item => {
                    this.rows.push(item);

                    let tree_item = this.getTreeItem(item.id);
                    if (tree_item) {
                        tree_item.item = item;
                    }
                });

                return true;
            });
    }

    calcAllExpanded() {
        let all_expanded = true;

        this.items.forEach(item => {
            if (!! item.item) {
                if (! item.expanded && item.children.length) {
                    all_expanded = false;
                    return false;
                }
            }
        });

        this.all_expanded = all_expanded;

        return all_expanded;
    }

    expandAll() {
        this.items.forEach(item => {
            if (!! item.item) {
                item.expanded = true;
                item.is_hidden = false;
            }
        });

        this.calcAllExpanded();
    }

    toggleExpanded(item, state = null) {
        item.toggleExpanded(state);
        this.calcAllExpanded();
    }

    collapseAll() {
        this.items.forEach(item => {
            if (!! item.item) {
                item.expanded = false;
                item.is_hidden = item.level != 1;
            }
        });

        this.calcAllExpanded();
    }
}