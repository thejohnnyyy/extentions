"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateBasRemoteExplorer = exports.initBasRemoteExplorer = void 0;
const vscode_1 = require("vscode");
const devSpacesExplorer_1 = require("./tree/devSpacesExplorer");
const delete_1 = require("./landscape/delete");
const set_1 = require("./landscape/set");
const open_1 = require("./landscape/open");
const delete_2 = require("./devspace/delete");
const update_1 = require("./devspace/update");
const add_1 = require("./devspace/add");
const edit_1 = require("./devspace/edit");
const copy_1 = require("./devspace/copy");
const connect_1 = require("./devspace/connect");
const authProvider_1 = require("../authentication/authProvider");
const landscape_1 = require("./landscape/landscape");
const basHandler_1 = require("./handler/basHandler");
const open_2 = require("./devspace/open");
function initBasRemoteExplorer(context) {
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.tree.settings", () => vscode_1.commands.executeCommand("workbench.action.openSettings", "Desktop Client")));
    const devSpaceExplorer = new devSpacesExplorer_1.DevSpacesExplorer(context.extensionPath);
    /* istanbul ignore next */
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.tree.refresh", () => devSpaceExplorer.refreshTree()));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.connect-new-window", connect_1.cmdDevSpaceConnectNewWindow));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.open-in-bas", connect_1.cmdDevSpaceOpenInBAS));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.start", update_1.cmdDevSpaceStart));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.stop", update_1.cmdDevSpaceStop));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.delete", delete_2.cmdDevSpaceDelete));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.add", add_1.cmdDevSpaceAdd));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.edit", edit_1.cmdDevSpaceEdit));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.copy-ws-id", copy_1.cmdCopyWsId));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.landscape.open-dev-space-manager", open_1.cmdLandscapeOpenDevSpaceManager));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.landscape.add", set_1.cmdLandscapeSet));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.landscape.delete", delete_1.cmdLandscapeDelete));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.landscape.set", set_1.cmdLandscapeSet));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.login", landscape_1.cmdLoginToLandscape));
    context.subscriptions.push(vscode_1.commands.registerCommand("local-extension.dev-space.open-in-code", open_2.cmdOpenInVSCode));
    context.subscriptions.push(vscode_1.authentication.registerAuthenticationProvider(authProvider_1.BasRemoteAuthenticationProvider.id, "SAP Business Application Studio", new authProvider_1.BasRemoteAuthenticationProvider(context.secrets)));
    context.subscriptions.push(vscode_1.window.registerUriHandler((0, basHandler_1.getBasUriHandler)(devSpaceExplorer.getDevSpacesExplorerProvider())));
}
exports.initBasRemoteExplorer = initBasRemoteExplorer;
async function deactivateBasRemoteExplorer() {
    // kill opened ssh channel if exists
    return (0, connect_1.closeTunnel)();
}
exports.deactivateBasRemoteExplorer = deactivateBasRemoteExplorer;
//# sourceMappingURL=instance.js.map