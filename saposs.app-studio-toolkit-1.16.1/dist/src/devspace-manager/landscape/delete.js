"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdLandscapeDelete = void 0;
const vscode_1 = require("vscode");
const messages_1 = require("../common/messages");
const landscape_1 = require("./landscape");
async function cmdLandscapeDelete(landscape) {
    const answer = await vscode_1.window.showInformationMessage(messages_1.messages.lbl_delete_landscape(landscape.label), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no]);
    if (answer == messages_1.messages.lbl_yes) {
        return (0, landscape_1.removeLandscape)(landscape.url).finally(() => void vscode_1.commands.executeCommand("local-extension.tree.refresh"));
    }
}
exports.cmdLandscapeDelete = cmdLandscapeDelete;
//# sourceMappingURL=delete.js.map