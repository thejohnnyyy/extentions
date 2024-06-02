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
exports.cmdDevSpaceStop = exports.cmdDevSpaceStart = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("../../logger/logger");
const messages_1 = require("../common/messages");
const auth_utils_1 = require("../../authentication/auth-utils");
const sdk = __importStar(require("@sap/bas-sdk"));
const landscape_1 = require("../landscape/landscape");
const devspace_1 = require("./devspace");
const START = false;
const STOP = true;
async function cmdDevSpaceStart(devSpace) {
    const canRun = await isItPossibleToStart(devSpace.landscapeUrl);
    if (typeof canRun === `boolean` && canRun === true) {
        return updateDevSpace(devSpace.landscapeUrl, devSpace.id, devSpace.label, START);
    }
    else if (typeof canRun === `string`) {
        void vscode_1.window.showInformationMessage(canRun);
    }
}
exports.cmdDevSpaceStart = cmdDevSpaceStart;
async function isItPossibleToStart(landscapeUrl) {
    const devSpaces = await (0, devspace_1.getDevSpaces)(landscapeUrl);
    if (!devSpaces) {
        // failure to obtain devspace info
        return false;
    }
    if (devSpaces.filter((devspace) => devspace.status === sdk.devspace.DevSpaceStatus.RUNNING ||
        devspace.status === sdk.devspace.DevSpaceStatus.STARTING).length < 2) {
        return true;
    }
    else {
        (0, logger_1.getLogger)().info(`There are 2 dev spaces running for ${landscapeUrl}`);
        return messages_1.messages.info_can_run_only_2_devspaces;
    }
}
async function cmdDevSpaceStop(devSpace) {
    return updateDevSpace(devSpace.landscapeUrl, devSpace.id, devSpace.label, STOP);
}
exports.cmdDevSpaceStop = cmdDevSpaceStop;
async function updateDevSpace(landscapeUrl, wsId, wsName, suspend) {
    return (0, auth_utils_1.getJwt)(landscapeUrl)
        .then((jwt) => {
        return sdk.devspace
            .updateDevSpace(landscapeUrl, jwt, wsId, {
            Suspended: suspend,
            WorkspaceDisplayName: wsName,
        })
            .then(() => {
            (0, logger_1.getLogger)().info(messages_1.messages.info_devspace_state_updated(wsName, wsId, suspend));
            void vscode_1.window.showInformationMessage(messages_1.messages.info_devspace_state_updated(wsName, wsId, suspend));
            (0, landscape_1.autoRefresh)();
        });
    })
        .catch((e) => {
        const message = messages_1.messages.err_ws_update(wsId, e.toString());
        (0, logger_1.getLogger)().error(message);
        void vscode_1.window.showErrorMessage(message);
    })
        .finally(() => {
        void vscode_1.commands.executeCommand("local-extension.tree.refresh");
    });
}
//# sourceMappingURL=update.js.map