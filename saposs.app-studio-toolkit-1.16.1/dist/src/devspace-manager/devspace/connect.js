"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdDevSpaceOpenInBAS = exports.cmdDevSpaceConnectNewWindow = exports.closeTunnel = void 0;
const vscode_1 = require("vscode");
const url_join_1 = __importDefault(require("url-join"));
const logger_1 = require("../../../src/logger/logger");
const messages_1 = require("../common/messages");
async function closeTunnel() {
    return vscode_1.commands.executeCommand("remote-access.close-tunnel");
}
exports.closeTunnel = closeTunnel;
async function cmdDevSpaceConnectNewWindow(devSpace, folderPath) {
    return vscode_1.commands.executeCommand("remote-access.dev-space.connect-new-window", devSpace, folderPath);
}
exports.cmdDevSpaceConnectNewWindow = cmdDevSpaceConnectNewWindow;
async function cmdDevSpaceOpenInBAS(devSpace) {
    try {
        return vscode_1.env.openExternal(vscode_1.Uri.parse((0, url_join_1.default)(devSpace.landscapeUrl, `index.html`, `#${devSpace.id}`)));
    }
    catch (err) {
        (0, logger_1.getLogger)().error(messages_1.messages.err_open_devspace_in_bas(devSpace.landscapeUrl, err.message));
        void vscode_1.window.showErrorMessage(messages_1.messages.err_open_devspace_in_bas(devSpace.landscapeUrl, err.message));
        return false;
    }
}
exports.cmdDevSpaceOpenInBAS = cmdDevSpaceOpenInBAS;
//# sourceMappingURL=connect.js.map