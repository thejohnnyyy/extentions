"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdDevSpaceDelete = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("../../logger/logger");
const messages_1 = require("../common/messages");
const auth_utils_1 = require("../../authentication/auth-utils");
const bas_sdk_1 = require("@sap/bas-sdk");
async function cmdDevSpaceDelete(devSpace) {
    const selection = await vscode_1.window.showInformationMessage(messages_1.messages.lbl_delete_devspace(devSpace.label, devSpace.id), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no]);
    if (selection == messages_1.messages.lbl_yes) {
        try {
            await deleteDevSpace(devSpace.landscapeUrl, devSpace.id);
            await cleanDevspaceConfig(devSpace);
            const message = messages_1.messages.info_devspace_deleted(devSpace.id);
            (0, logger_1.getLogger)().info(message);
            void vscode_1.window.showInformationMessage(message);
        }
        catch (e) {
            const message = messages_1.messages.err_devspace_delete(devSpace.id, e.toString());
            (0, logger_1.getLogger)().error(message);
            void vscode_1.window.showErrorMessage(message);
        }
        finally {
            void vscode_1.commands.executeCommand("local-extension.tree.refresh");
        }
    }
}
exports.cmdDevSpaceDelete = cmdDevSpaceDelete;
async function deleteDevSpace(landscapeUrl, wsId) {
    return bas_sdk_1.devspace.deleteDevSpace(landscapeUrl, await (0, auth_utils_1.getJwt)(landscapeUrl), wsId);
}
async function cleanDevspaceConfig(devSpace) {
    return vscode_1.commands
        .executeCommand("remote-access.dev-space.clean-devspace-config", devSpace)
        .then(() => {
        (0, logger_1.getLogger)().info(`Devspace ssh config info cleaned`);
    });
}
//# sourceMappingURL=delete.js.map