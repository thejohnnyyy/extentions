"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clear = exports.get = void 0;
const vscode_1 = require("vscode");
const lodash_1 = require("lodash");
const key = "actions";
const addActions = (actions, config) => {
    const configActions = config.get(key, []);
    actions.splice(actions.length, 0, ...configActions);
};
const get = () => {
    var _a;
    const actions = [];
    (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.forEach((wsFolder) => {
        addActions(actions, vscode_1.workspace.getConfiguration(undefined, wsFolder.uri));
    });
    addActions(actions, vscode_1.workspace.getConfiguration());
    return (0, lodash_1.uniqWith)(actions, lodash_1.isEqual);
};
exports.get = get;
const clear = () => {
    var _a;
    (_a = vscode_1.workspace.workspaceFolders) === null || _a === void 0 ? void 0 : _a.forEach((wsFolder) => {
        const configurations = vscode_1.workspace.getConfiguration(undefined, wsFolder.uri);
        if ((0, lodash_1.size)(configurations["actions"]) > 0) {
            void configurations.update(key, undefined); // removes actions key if they exist
        }
    });
    const configurations = vscode_1.workspace.getConfiguration();
    if ((0, lodash_1.size)(configurations["actions"]) > 0) {
        void configurations.update(key, undefined);
    }
};
exports.clear = clear;
//# sourceMappingURL=actionsConfig.js.map