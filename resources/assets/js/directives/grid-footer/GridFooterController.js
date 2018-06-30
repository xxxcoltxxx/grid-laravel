/**
 * @property {GridDataProvider} provider
 */
export default class GridFooterController {
    get is_loading() {
        return ! this.provider.loaded ||
            this.provider.show_mode == this.provider.modes.tree && this.provider.tree.is_loading;
    }
}
