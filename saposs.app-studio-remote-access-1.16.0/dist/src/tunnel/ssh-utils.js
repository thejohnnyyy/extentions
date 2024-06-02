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
exports.getRandomArbitrary = exports.runChannelClient = exports.cleanRemotePlatformSetting = exports.updateRemotePlatformSetting = exports.removeSSHConfig = exports.updateSSHConfig = exports.deletePK = exports.savePK = exports.getPK = exports.SSH_SOCKET_PORT = exports.SSHD_SOCKET_PORT = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("../logger/logger");
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os_1 = require("os");
const bas_sdk_1 = require("@sap/bas-sdk");
const ssh_1 = require("./ssh");
const node_url_1 = require("node:url");
const lodash_1 = require("lodash");
const sshConfig = require("ssh-config");
exports.SSHD_SOCKET_PORT = 33765;
exports.SSH_SOCKET_PORT = 443;
const KEY_SSH_REMOTE_PLATFORM = "remote.SSH.remotePlatform";
function getSshConfigFilePath() {
    return (vscode_1.workspace.getConfiguration("remote.SSH").get("configFile") ||
        path.join((0, os_1.homedir)(), ".ssh", "config"));
}
function getSshConfigFolderPath() {
    return path.parse(getSshConfigFilePath()).dir;
}
async function getJwt(landscape) {
    return vscode_1.authentication
        .getSession("BASLandscapePAT", [landscape], { createIfNone: true })
        .then((session) => { var _a; return (_a = session === null || session === void 0 ? void 0 : session.accessToken) !== null && _a !== void 0 ? _a : ""; });
}
async function getPK(landscapeUrl, wsId) {
    return getJwt(landscapeUrl).then((jwt) => {
        return bas_sdk_1.remotessh.getKey(landscapeUrl, jwt, wsId);
    });
}
exports.getPK = getPK;
function composeKeyFileName(folder, url) {
    return path.join(folder, `${new node_url_1.URL(url).host}.key`);
}
function savePK(pk, urlStr) {
    //construct file named "<ws-url>.key"
    const sshFolderPath = getSshConfigFolderPath();
    if (!fs.existsSync(sshFolderPath)) {
        fs.mkdirSync(sshFolderPath);
    }
    const fileName = composeKeyFileName(sshFolderPath, urlStr);
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
    fs.writeFileSync(fileName, `${pk}\n`, { mode: "0400", flag: "w" });
    (0, logger_1.getLogger)().info(`Private key file ${fileName} created`);
    return fileName;
}
exports.savePK = savePK;
function deletePK(wsUrl) {
    const fileName = composeKeyFileName(getSshConfigFolderPath(), wsUrl);
    let message = `Private key file ${fileName} deleted`;
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }
    else {
        message = `Private key file ${fileName} doesn't exists`;
    }
    (0, logger_1.getLogger)().info(message);
}
exports.deletePK = deletePK;
function getSSHConfig(sshConfigFile) {
    let configData;
    if (fs.existsSync(sshConfigFile)) {
        configData = fs.readFileSync(sshConfigFile);
        (0, logger_1.getLogger)().info(`SSH Config file ${sshConfigFile} exists`);
    }
    else {
        configData = Buffer.from(``, `utf8`);
        (0, logger_1.getLogger)().info(`SSH Config file ${sshConfigFile} doest exist, creating new file`);
    }
    return sshConfig.parse(configData.toString());
}
function composeSSHConfigSectionName(landscape, wsId) {
    return `${new node_url_1.URL(landscape).host}.${wsId}`;
}
function updateSSHConfig(sshKeyFilePath, devSpace) {
    const sectionName = composeSSHConfigSectionName(devSpace.landscapeUrl, devSpace.id);
    const sshConfigFile = getSshConfigFilePath();
    const port = getRandomArbitrary();
    // get ssh config object form ssh config file
    const config = getSSHConfig(sshConfigFile);
    // push to the ssh config object with the new configuration
    config.remove({ Host: sectionName });
    // keep the existing indentation of the next block
    config.push(sshConfig.parse(`Host ${sectionName}
  HostName 127.0.0.1
  Port ${port}
  IdentityFile ${sshKeyFilePath}
  User user
  NoHostAuthenticationForLocalhost yes
`)[0]);
    //save the ssh config object back to file
    fs.writeFileSync(sshConfigFile, sshConfig.stringify(config));
    return { name: sectionName, port: `${port}` };
}
exports.updateSSHConfig = updateSSHConfig;
function removeSSHConfig(devSpace) {
    const sshConfigFile = getSshConfigFilePath();
    // get ssh config object form ssh config file
    const config = getSSHConfig(sshConfigFile);
    // remove the section by name
    config.remove({
        Host: `${composeSSHConfigSectionName(devSpace.landscapeUrl, devSpace.id)}`,
    });
    //save the ssh config object back to file
    fs.writeFileSync(sshConfigFile, sshConfig.stringify(config));
}
exports.removeSSHConfig = removeSSHConfig;
async function updateRemotePlatformSetting(config) {
    const remotePlatform = {};
    remotePlatform[config.name] = "linux";
    const remotePlatformsList = vscode_1.workspace.getConfiguration().get(KEY_SSH_REMOTE_PLATFORM) || {};
    (0, lodash_1.assign)(remotePlatformsList, remotePlatform);
    await vscode_1.workspace
        .getConfiguration()
        .update(KEY_SSH_REMOTE_PLATFORM, remotePlatformsList, vscode_1.ConfigurationTarget.Global);
}
exports.updateRemotePlatformSetting = updateRemotePlatformSetting;
async function cleanRemotePlatformSetting(devSpace) {
    const remotePlatform = vscode_1.workspace.getConfiguration().get(KEY_SSH_REMOTE_PLATFORM) || {};
    const sectionName = composeSSHConfigSectionName(devSpace.landscapeUrl, devSpace.id);
    (0, lodash_1.unset)(remotePlatform, sectionName);
    await vscode_1.workspace
        .getConfiguration()
        .update(KEY_SSH_REMOTE_PLATFORM, remotePlatform, vscode_1.ConfigurationTarget.Global);
}
exports.cleanRemotePlatformSetting = cleanRemotePlatformSetting;
async function runChannelClient(opt) {
    return getJwt(opt.landscape).then((jwt) => {
        void (0, ssh_1.ssh)({
            host: { url: opt.host, port: `${exports.SSH_SOCKET_PORT}` },
            client: { port: opt.localPort },
            username: "user",
            jwt,
        });
        (0, logger_1.getLogger)().info(`Start dev-channel client for ${opt.host} on port ${exports.SSH_SOCKET_PORT}`);
    });
}
exports.runChannelClient = runChannelClient;
function getRandomArbitrary(min, max) {
    max = max || 33654;
    min = min || 30432;
    // verify max is larger than min
    const tmp = Math.max(min, max);
    if (tmp !== max) {
        // swap min <-> max
        min = max;
        max = tmp;
    }
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.getRandomArbitrary = getRandomArbitrary;
//# sourceMappingURL=ssh-utils.js.map