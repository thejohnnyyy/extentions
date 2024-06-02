"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._performAction = void 0;
const vscode_1 = require("vscode");
const lodash_1 = require("lodash");
const logger_1 = require("../logger/logger");
const constants_1 = require("../constants");
async function _performAction(action) {
    var _a;
    const logger = (0, logger_1.getLogger)();
    if (action) {
        logger.trace(`performing action ${action.id} of type ${action.actionType}`, { action });
        switch (action.actionType) {
            case constants_1.COMMAND: {
                const params = (0, lodash_1.get)(action, "params", []);
                return vscode_1.commands.executeCommand(action.name, ...params);
            }
            case constants_1.EXECUTE: {
                return action.executeAction((0, lodash_1.get)(action, "params", []));
            }
            case constants_1.SNIPPET: {
                return vscode_1.commands.executeCommand("loadCodeSnippet", {
                    viewColumn: vscode_1.ViewColumn.Two,
                    contributorId: action.contributorId,
                    snippetName: action.snippetName,
                    context: action.context,
                    isNonInteractive: (_a = action.isNonInteractive) !== null && _a !== void 0 ? _a : false,
                });
            }
            case constants_1.FILE: {
                return action.uri.scheme === "file"
                    ? vscode_1.commands.executeCommand("vscode.open", action.uri, vscode_1.window.activeTextEditor ? { viewColumn: vscode_1.ViewColumn.Beside } : {})
                    : vscode_1.commands.executeCommand("vscode.open", action.uri);
            }
            default:
                throw new Error(`actionType is not supported`);
        }
    }
    throw new Error(`Action is not provided`);
}
exports._performAction = _performAction;
//# sourceMappingURL=performer.js.map