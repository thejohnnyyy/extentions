"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanDevspaceConfig = exports.cmdDevSpaceConnectNewWindow = exports.closeTunnel = void 0;
const vscode_1 = require("vscode");
const node_url_1 = require("node:url");
const ssh_utils_1 = require("./tunnel/ssh-utils");
const logger_1 = require("./logger/logger");
const messages_1 = require("./messages");
let tunnel;
async function getTunnelConfigurations(devSpace, progress) {
    progress.report({ message: messages_1.messages.info_obtaining_key });
    const pk = await (0, ssh_utils_1.getPK)(devSpace.landscapeUrl, devSpace.id);
    progress.report({ message: messages_1.messages.info_save_pk_to_file });
    const pkFilePath = (0, ssh_utils_1.savePK)(pk, devSpace.wsUrl);
    progress.report({
        message: messages_1.messages.info_update_config_file_with_ssh_connection,
    });
    return (0, ssh_utils_1.updateSSHConfig)(pkFilePath, devSpace);
}
function closeTunnel() {
    return /* istanbul ignore next */ (tunnel === null || tunnel === void 0 ? void 0 : tunnel.kill()) || false;
}
exports.closeTunnel = closeTunnel;
async function createTunnel(devSpace, config, progress) {
    progress.report({ message: messages_1.messages.info_closing_old_tunnel });
    closeTunnel();
    progress.report({ message: messages_1.messages.info_staring_new_tunnel });
    tunnel = await (0, ssh_utils_1.runChannelClient)({
        host: `port${ssh_utils_1.SSHD_SOCKET_PORT}-${new node_url_1.URL(devSpace.wsUrl).hostname}`,
        landscape: devSpace.landscapeUrl,
        localPort: config.port,
    });
}
async function createTunnelAndGetHostName(devSpace) {
    return vscode_1.window.withProgress({
        location: vscode_1.ProgressLocation.Notification,
        title: `Connecting to ${devSpace.label}`,
        cancellable: true,
    }, async (progress, cancel) => {
        // Set tunnel configurations
        const config = await getTunnelConfigurations(devSpace, progress);
        // Create tunnel
        await createTunnel(devSpace, config, progress);
        // Add linux to host records in settings json
        await (0, ssh_utils_1.updateRemotePlatformSetting)(config);
        return config.name;
    });
}
async function cmdDevSpaceConnectNewWindow(devSpace, folderPath) {
    try {
        const hostName = await createTunnelAndGetHostName(devSpace);
        // Open the folder in a new window
        if (folderPath) {
            const uri = vscode_1.Uri.parse(`vscode-remote://ssh-remote+${hostName}${folderPath}`);
            void vscode_1.commands.executeCommand("vscode.openFolder", uri, {
                forceNewWindow: true,
            });
        }
        // Open an empty window
        else {
            await vscode_1.commands.executeCommand("opensshremotes.openEmptyWindow", {
                host: hostName,
            });
        }
    }
    catch (err) {
        const message = messages_1.messages.err_devspace_connect_new_window(devSpace.wsUrl, err.toString());
        (0, logger_1.getLogger)().error(message);
        void vscode_1.window.showErrorMessage(message);
    }
}
exports.cmdDevSpaceConnectNewWindow = cmdDevSpaceConnectNewWindow;
async function cleanDevspaceConfig(devSpace) {
    try {
        (0, ssh_utils_1.deletePK)(devSpace.wsUrl);
        (0, ssh_utils_1.removeSSHConfig)(devSpace);
        await (0, ssh_utils_1.cleanRemotePlatformSetting)(devSpace);
        (0, logger_1.getLogger)().info(`Devspace ssh config info cleaned`);
    }
    catch (e) {
        (0, logger_1.getLogger)().error(`Can't complete the devspace ssh config cleaning: ${e.toString()}`);
    }
}
exports.cleanDevspaceConfig = cleanDevspaceConfig;
//# sourceMappingURL=commands.js.map