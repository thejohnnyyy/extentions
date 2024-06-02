"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldRunCtlServer = exports.ExtensionRunMode = void 0;
const vscode_1 = require("vscode");
const lodash_1 = require("lodash");
const bas_sdk_1 = require("@sap/bas-sdk");
const node_url_1 = require("node:url");
var ExtensionRunMode;
(function (ExtensionRunMode) {
    ExtensionRunMode["desktop"] = "desktop";
    ExtensionRunMode["basRemote"] = "bas-remote";
    ExtensionRunMode["basWorkspace"] = "bas-workspace";
    ExtensionRunMode["basUi"] = "bas-ui";
    ExtensionRunMode["wsl"] = "wsl";
    ExtensionRunMode["unexpected"] = "unexpected";
})(ExtensionRunMode = exports.ExtensionRunMode || (exports.ExtensionRunMode = {}));
function shouldRunCtlServer() {
    const platform = getExtensionRunPlatform();
    return (platform === ExtensionRunMode.basWorkspace || // BAS
        platform === ExtensionRunMode.basRemote || // hybrid (through ssh-remote)
        bas_sdk_1.devspace.getBasMode() === "personal-edition" // personal edition
    );
}
exports.shouldRunCtlServer = shouldRunCtlServer;
function getExtensionRunPlatform() {
    let runPlatform = ExtensionRunMode.unexpected;
    const serverUri = process.env.WS_BASE_URL;
    // see example: https://github.com/microsoft/vscode/issues/74188
    // expected values of env.remoteName: `undefined` (locally), `ssh-remote` (bas-remote) or `landscape.url` (BAS)
    if (serverUri && typeof vscode_1.env.remoteName === "string") {
        const remote = (0, lodash_1.join)((0, lodash_1.tail)((0, lodash_1.split)(vscode_1.env.remoteName, ".")), ".");
        const host = (0, lodash_1.join)((0, lodash_1.tail)((0, lodash_1.split)(new node_url_1.URL(serverUri).hostname, ".")), ".");
        if (host === remote) {
            // see for reference: https://code.visualstudio.com/api/references/vscode-api#Extension
            const ext = vscode_1.extensions.getExtension("SAPOSS.app-studio-toolkit");
            if (ext) {
                switch (ext.extensionKind) {
                    case vscode_1.ExtensionKind.Workspace:
                        runPlatform = ExtensionRunMode.basWorkspace;
                        break;
                    case vscode_1.ExtensionKind.UI:
                        runPlatform = ExtensionRunMode.basUi;
                        break;
                }
            }
        }
        else {
            runPlatform = ExtensionRunMode.basRemote;
        }
    }
    else if (typeof vscode_1.env.remoteName === "string") {
        if (vscode_1.env.remoteName.toLowerCase().includes("wsl")) {
            runPlatform = ExtensionRunMode.wsl;
        }
    }
    else {
        runPlatform = ExtensionRunMode.desktop;
    }
    // view panel visibility expects that value is available
    void vscode_1.commands.executeCommand("setContext", `ext.runPlatform`, runPlatform);
    return runPlatform;
}
//# sourceMappingURL=bas-utils.js.map