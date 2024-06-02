"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("./logger/logger");
const commands_1 = require("./commands");
function activate(context) {
    (0, logger_1.initLogger)(context);
    context.subscriptions.push(vscode_1.commands.registerCommand("remote-access.dev-space.connect-new-window", commands_1.cmdDevSpaceConnectNewWindow));
    context.subscriptions.push(vscode_1.commands.registerCommand("remote-access.dev-space.clean-devspace-config", commands_1.cleanDevspaceConfig));
    context.subscriptions.push(vscode_1.commands.registerCommand("remote-access.close-tunnel", commands_1.closeTunnel));
    const logger = (0, logger_1.getLogger)().getChildLogger({ label: "activate" });
    logger.info("The Remote-Acceess Extension is active.");
}
exports.activate = activate;
function deactivate() {
    // kill opened ssh channel if exists
    (0, commands_1.closeTunnel)();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map