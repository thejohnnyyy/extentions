"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSpacesExplorer = void 0;
const vscode_1 = require("vscode");
const devSpacesProvider_1 = require("./devSpacesProvider");
class DevSpacesExplorer {
    constructor(extensionPath) {
        this.devSpacesExplorerProvider = new devSpacesProvider_1.DevSpaceDataProvider(extensionPath);
        this.devSpacesExplorerView = vscode_1.window.createTreeView("dev-spaces", {
            treeDataProvider: this.devSpacesExplorerProvider,
            showCollapseAll: true,
        });
    }
    refreshTree() {
        this.devSpacesExplorerProvider.refresh();
    }
    changeTreeToLoading() {
        this.devSpacesExplorerProvider.setLoading(true);
        this.refreshTree();
    }
    changeTreeToLoaded() {
        this.devSpacesExplorerProvider.setLoading(false);
        this.refreshTree();
    }
    getDevSpacesExplorerProvider() {
        return this.devSpacesExplorerProvider;
    }
    getDevSpacesExplorerView() {
        return this.devSpacesExplorerView;
    }
}
exports.DevSpacesExplorer = DevSpacesExplorer;
//# sourceMappingURL=devSpacesExplorer.js.map