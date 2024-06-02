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
exports.getBasUriHandler = exports.eventEmitter = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("../../logger/logger");
const sdk = __importStar(require("@sap/bas-sdk"));
const landscape_1 = require("../landscape/landscape");
const lodash_1 = require("lodash");
const set_1 = require("../landscape/set");
const connect_1 = require("../devspace/connect");
const messages_1 = require("../common/messages");
const update_1 = require("../devspace/update");
async function getDevSpace(landscape, devspaceidParam) {
    const devspaces = await landscape.getChildren(landscape);
    if ((0, lodash_1.isEmpty)(devspaces)) {
        throw new Error(messages_1.messages.err_no_devspaces_in_landscape(landscape.name));
    }
    const devspace = devspaces.find((el) => el.id === devspaceidParam);
    if (!devspace) {
        throw new Error(messages_1.messages.err_devspace_missing(devspaceidParam));
    }
    return devspace;
}
async function getDevspaceFromUrl(landscape, devspaceidParam) {
    let devspace = await getDevSpace(landscape, devspaceidParam);
    // Start the dev space if it has not been started
    if (devspace.status !== sdk.devspace.DevSpaceStatus.RUNNING) {
        await (0, update_1.cmdDevSpaceStart)(devspace);
        devspace = await getDevSpace(landscape, devspaceidParam);
        // Verify the dev space has been started successfully
        if (devspace.status !== sdk.devspace.DevSpaceStatus.RUNNING) {
            throw new Error(messages_1.messages.err_devspace_must_be_started);
        }
    }
    return devspace;
}
async function getLandscapeFromUrl(devSpacesProvider, landscapeParam) {
    var _a;
    const findLandscapeNode = async () => {
        const node = (await devSpacesProvider.getChildren()).find((el) => el.name === landscapeParam);
        if (!node) {
            throw new Error(messages_1.messages.err_landscape_not_added(landscapeParam));
        }
        return node;
    };
    let isRefresh = false;
    const landscapes = await (0, landscape_1.getLandscapes)();
    const landscape = landscapes.find((el) => el.name === landscapeParam);
    if (!landscape) {
        await (0, set_1.addLandscape)(`https://${landscapeParam}`);
        isRefresh = true;
    }
    let landscapeNode = await findLandscapeNode();
    if (!/log-in/g.test((_a = landscapeNode.contextValue) !== null && _a !== void 0 ? _a : "")) {
        await (0, landscape_1.cmdLoginToLandscape)(landscapeNode);
        await new Promise((resolve) => setTimeout(() => resolve(), 1000));
        landscapeNode = await findLandscapeNode();
        isRefresh = true;
    }
    isRefresh && void vscode_1.commands.executeCommand("local-extension.tree.refresh");
    return landscapeNode;
}
function getParamFromUrl(query, name) {
    var _a;
    const param = (_a = query
        .split("&")
        .find((el) => el.split("=")[0] === name)) === null || _a === void 0 ? void 0 : _a.split("=")[1];
    if (!param) {
        throw new Error(messages_1.messages.err_url_param_missing(query, name));
    }
    return param;
}
// Create an instance of EventEmitter
exports.eventEmitter = new vscode_1.EventEmitter();
async function handleLogin(uri) {
    // expected URL format :
    // vscode://SAPOSS.app-studio-toolkit/login?jwt=`value`
    return Promise.resolve().then(() => {
        exports.eventEmitter.fire({ jwt: getParamFromUrl(uri.query, "jwt") });
    });
}
async function handleOpen(uri, devSpacesProvider) {
    // expected URL format :
    // vscode://SAPOSS.app-studio-toolkit/open?landscape=bas-extensions.stg10cf.int.applicationstudio.cloud.sap&devspaceid=ws-62qpt&folderpath=/home/user/projects/project1
    const landscape = await getLandscapeFromUrl(devSpacesProvider, getParamFromUrl(uri.query, `landscape`));
    const devspace = await getDevspaceFromUrl(landscape, getParamFromUrl(uri.query, `devspaceid`));
    let folderPath;
    try {
        folderPath = getParamFromUrl(uri.query, `folderpath`);
    }
    catch (_) {
        // folderath query param is optional.
    }
    void (0, connect_1.cmdDevSpaceConnectNewWindow)(devspace, folderPath);
}
function getBasUriHandler(devSpacesProvider) {
    return {
        handleUri: async (uri) => {
            try {
                if (uri.path === "/open") {
                    await handleOpen(uri, devSpacesProvider);
                }
                else if (uri.path === "/login") {
                    await handleLogin(uri);
                }
                else {
                    throw new Error(messages_1.messages.err_url_has_incorrect_format(uri.toString()));
                }
            }
            catch (err) {
                (0, logger_1.getLogger)().error(messages_1.messages.err_open_devspace_in_code(err.message));
                void vscode_1.window.showErrorMessage(messages_1.messages.err_open_devspace_in_code(err.message));
            }
        },
    };
}
exports.getBasUriHandler = getBasUriHandler;
//# sourceMappingURL=basHandler.js.map