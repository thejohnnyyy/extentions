"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DevSpaceDataProvider = void 0;
const vscode_1 = require("vscode");
const treeItems_1 = require("./treeItems");
const landscape_1 = require("../landscape/landscape");
const lodash_1 = require("lodash");
const messages_1 = require("../common/messages");
class DevSpaceDataProvider {
    constructor(extensionPath) {
        this.extensionPath = extensionPath;
        // Instance elements
        this.privateOnDidChangeTreeData = new vscode_1.EventEmitter();
        this.onDidChangeTreeData = this.privateOnDidChangeTreeData.event;
        this.loading = false;
    }
    setLoading(loading) {
        this.loading = loading;
    }
    refresh() {
        this.privateOnDidChangeTreeData.fire(undefined);
    }
    getTreeItem(element) {
        return element;
    }
    async getChildren(element) {
        // TODO: Implement loading of tree scenario
        if (this.loading) {
            return Promise.resolve([new treeItems_1.LoadingNode(vscode_1.TreeItemCollapsibleState.None)]);
        }
        return this.getChildrenPromise(element);
    }
    async getChildrenPromise(element) {
        // Get the children of the given element
        if (element) {
            return element.getChildren(element);
        }
        // Get the children of the root
        return this.getTreeTopLevelChildren();
    }
    async getTreeTopLevelChildren() {
        const iconPath = (0, treeItems_1.getSvgIconPath)(this.extensionPath, "landscape");
        const landscapes = await (0, landscape_1.getLandscapes)();
        const rootNodes = (0, lodash_1.map)(landscapes, (landscape) => {
            return new treeItems_1.LandscapeNode(this.extensionPath, landscape.name, vscode_1.TreeItemCollapsibleState.Expanded, iconPath, "", landscape.isLoggedIn
                ? messages_1.messages.lbl_logged_in
                : messages_1.messages.lbl_not_logged_in, landscape.name, landscape.url, messages_1.messages.lbl_landscape_context_status(landscape.isLoggedIn));
        });
        return rootNodes;
    }
}
exports.DevSpaceDataProvider = DevSpaceDataProvider;
//# sourceMappingURL=devSpacesProvider.js.map