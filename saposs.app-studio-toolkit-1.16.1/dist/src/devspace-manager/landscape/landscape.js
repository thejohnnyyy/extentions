"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdLoginToLandscape = exports.removeLandscape = exports.getLandscapes = exports.updateLandscapesConfig = exports.getLanscapesConfig = exports.autoRefresh = void 0;
const vscode_1 = require("vscode");
const lodash_1 = require("lodash");
const auth_utils_1 = require("../../authentication/auth-utils");
const node_url_1 = require("node:url");
const logger_1 = require("../../../src/logger/logger");
const authProvider_1 = require("../../authentication/authProvider");
function autoRefresh(refreshRate, timeOut) {
    refreshRate = refreshRate !== null && refreshRate !== void 0 ? refreshRate : 10 * 1000; // 10 sec default
    timeOut = timeOut !== null && timeOut !== void 0 ? timeOut : 2 * 60 * 1000; // 2 min default
    let refreshedTime = 0;
    const refreshInterval = setInterval(() => {
        getLandscapes()
            .then((landscapes) => {
            if (refreshedTime < timeOut && !(0, lodash_1.isEmpty)(landscapes)) {
                refreshedTime += refreshRate;
                (0, logger_1.getLogger)().info(`Auto refresh ${refreshedTime} out of ${timeOut}`);
                void vscode_1.commands.executeCommand("local-extension.tree.refresh");
            }
            else {
                (0, logger_1.getLogger)().info(`Auto refresh completed`);
                clearInterval(refreshInterval);
            }
        })
            .catch((e) => {
            (0, logger_1.getLogger)().error(`getLandscapes error: ${e.toString()}`);
        });
    }, refreshRate);
}
exports.autoRefresh = autoRefresh;
function isLandscapeLoggedIn(url) {
    return (0, auth_utils_1.hasJwt)(url);
}
function getLanscapesConfig() {
    var _a;
    return (0, lodash_1.uniq)((0, lodash_1.compact)(((_a = vscode_1.workspace.getConfiguration().get("sap-remote.landscape-name")) !== null && _a !== void 0 ? _a : "")
        .split(",")
        .map((value) => (value ? new node_url_1.URL((0, lodash_1.trim)(value)).toString() : value))));
}
exports.getLanscapesConfig = getLanscapesConfig;
async function updateLandscapesConfig(value) {
    return vscode_1.workspace
        .getConfiguration()
        .update("sap-remote.landscape-name", value.join(","), vscode_1.ConfigurationTarget.Global)
        .then(() => {
        (0, logger_1.getLogger)().debug(`Landscapes config updated: ${value.toString()}`);
    });
}
exports.updateLandscapesConfig = updateLandscapesConfig;
async function getLandscapes() {
    const lands = [];
    for (const landscape of getLanscapesConfig()) {
        const url = new node_url_1.URL(landscape);
        lands.push({
            name: url.hostname,
            url: url.toString(),
            isLoggedIn: await isLandscapeLoggedIn(landscape),
        });
    }
    return lands;
}
exports.getLandscapes = getLandscapes;
async function removeLandscape(landscapeName) {
    const config = getLanscapesConfig();
    if ((0, lodash_1.size)(config) > 0) {
        const toRemove = new node_url_1.URL(landscapeName).toString();
        const updated = config.filter((landscape) => new node_url_1.URL(landscape).toString() !== toRemove);
        if ((0, lodash_1.size)(updated) !== (0, lodash_1.size)(config)) {
            return updateLandscapesConfig(updated);
        }
    }
}
exports.removeLandscape = removeLandscape;
async function cmdLoginToLandscape(node) {
    try {
        const session = await vscode_1.authentication.getSession(authProvider_1.BasRemoteAuthenticationProvider.id, [node.url], { forceNewSession: true });
        if (session === null || session === void 0 ? void 0 : session.accessToken) {
            // auto refresh util jwt expired
            autoRefresh(30 * 1000, (0, auth_utils_1.timeUntilJwtExpires)(session.accessToken));
        }
    }
    finally {
        void vscode_1.commands.executeCommand("local-extension.tree.refresh");
    }
}
exports.cmdLoginToLandscape = cmdLoginToLandscape;
//# sourceMappingURL=landscape.js.map