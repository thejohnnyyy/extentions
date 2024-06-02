"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initWorkspaceAPI = void 0;
const artifact_management_1 = require("@sap/artifact-management");
const vscode = __importStar(require("vscode"));
const artifact_management_2 = require("@sap/artifact-management");
const lodash_1 = require("lodash");
let workspaceAPI;
/**
 * "Factory" for the `WorkspaceApi` "original" instance.
 */
function initWorkspaceAPI(context) {
    workspaceAPI = new artifact_management_1.WorkspaceImpl(vscode);
    workspaceAPI.startWatch();
    context.subscriptions.push(vscode.commands.registerCommand("project-api.command.run", async (command, ...params) => {
        try {
            let result = await artifact_management_2.CommandExecutor.execute(command, ...params);
            if ((0, lodash_1.isPlainObject)(result)) {
                result = JSON.stringify(result, undefined, 2);
            }
            if ((0, lodash_1.isString)(result)) {
                return result + "\n";
            }
            else if (result === undefined) {
                return "\n";
            }
            else {
                return "Unsupported type of result: " + typeof result;
            }
        }
        catch (error) {
            return (`Failed to execute the command ${command} with the error: ${error.message}` +
                "\n");
        }
    }));
    return workspaceAPI;
}
exports.initWorkspaceAPI = initWorkspaceAPI;
//# sourceMappingURL=workspace-instance.js.map