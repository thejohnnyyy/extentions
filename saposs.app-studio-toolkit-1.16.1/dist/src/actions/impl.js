"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileAction = exports.SnippetAction = exports.CommandAction = exports.ExecuteAction = void 0;
const vscode_1 = require("vscode");
const constants_1 = require("../constants");
/** Specific action classes */
class ExecuteAction {
    constructor() {
        this.actionType = constants_1.EXECUTE;
        /* istanbul ignore next - ignoring "legacy" missing coverage to enforce all new code to be 100% */
        this.executeAction = () => Promise.resolve();
        this.params = [];
    }
}
exports.ExecuteAction = ExecuteAction;
class CommandAction {
    constructor() {
        this.actionType = constants_1.COMMAND;
        this.name = "";
        this.params = [];
    }
}
exports.CommandAction = CommandAction;
class SnippetAction {
    constructor() {
        this.actionType = constants_1.SNIPPET;
        this.contributorId = "";
        this.snippetName = "";
        this.context = {};
    }
}
exports.SnippetAction = SnippetAction;
class FileAction {
    constructor() {
        this.actionType = constants_1.FILE;
        this.uri = vscode_1.Uri.parse("");
    }
}
exports.FileAction = FileAction;
//# sourceMappingURL=impl.js.map