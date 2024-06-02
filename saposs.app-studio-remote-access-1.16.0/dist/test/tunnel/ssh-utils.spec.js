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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const assert_1 = require("assert");
const path = __importStar(require("path"));
const sinon_1 = require("sinon");
const node_url_1 = require("node:url");
const os_1 = require("os");
const proxyquire_1 = __importDefault(require("proxyquire"));
const sshConfig = require("ssh-config");
describe("ssh-utils unit test", () => {
    let localConfigurationTarget;
    (function (localConfigurationTarget) {
        localConfigurationTarget[localConfigurationTarget["Global"] = 1] = "Global";
        localConfigurationTarget[localConfigurationTarget["Workspace"] = 2] = "Workspace";
        localConfigurationTarget[localConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
    })(localConfigurationTarget || (localConfigurationTarget = {}));
    const configProxy = {
        get: () => {
            throw new Error(`not implemented`);
        },
        update: (key, data, target) => { },
    };
    const testVscode = {
        commands: {
            executeCommand: () => {
                throw new Error(`not implemented`);
            },
        },
        workspace: {
            getConfiguration: () => configProxy,
        },
        authentication: {
            getSession: () => {
                throw new Error(`not implemented`);
            },
        },
        ConfigurationTarget: localConfigurationTarget,
    };
    let sshUtilsProxy;
    const remoteSshProxy = {
        remotessh: {
            getKey: () => {
                throw new Error(`not implemented`);
            },
        },
    };
    const fsProxy = {
        existsSync: () => {
            throw new Error(`not implemented`);
        },
        mkdirSync: () => {
            throw new Error(`not implemented`);
        },
        writeFileSync: (file, data) => { },
        unlinkSync: () => {
            throw new Error(`not implemented`);
        },
    };
    const SshProxy = {
        ssh: (opts) => {
            throw new Error(`not implemented`);
        },
    };
    const dummyLogger = {
        info: () => "",
        error: () => "",
    };
    before(() => {
        sshUtilsProxy = (0, proxyquire_1.default)("../../src/tunnel/ssh-utils", {
            vscode: Object.assign(Object.assign({}, testVscode), { "@noCallThru": true }),
            "../logger/logger": {
                getLogger: () => dummyLogger,
            },
            "@sap/bas-sdk": remoteSshProxy,
            fs: fsProxy,
            "./ssh": SshProxy,
        });
    });
    let mockWorkspace;
    let mockWorkspaceConfig;
    let mockAuthentication;
    let mockFs;
    beforeEach(() => {
        mockWorkspace = (0, sinon_1.mock)(testVscode.workspace);
        mockWorkspaceConfig = (0, sinon_1.mock)(configProxy);
        mockAuthentication = (0, sinon_1.mock)(testVscode.authentication);
        mockFs = (0, sinon_1.mock)(fsProxy);
    });
    afterEach(() => {
        mockWorkspace.verify();
        mockWorkspaceConfig.verify();
        mockAuthentication.verify();
        mockFs.verify();
    });
    const landscape = `https://my.landscape-1.com`;
    const wsId = `ws-id`;
    const dummyJwt = `dummy-token`;
    const dummySession = {
        accessToken: dummyJwt,
    };
    const key = `pak-key`;
    const node = {
        id: `node-id`,
        landscapeUrl: landscape,
    };
    describe("getPK unit test", () => {
        let mockRemoteSsh;
        beforeEach(() => {
            mockRemoteSsh = (0, sinon_1.mock)(remoteSshProxy.remotessh);
        });
        afterEach(() => {
            mockRemoteSsh.verify();
        });
        it("getPK, succedded", async () => {
            mockAuthentication
                .expects("getSession")
                .withExactArgs("BASLandscapePAT", [landscape], { createIfNone: true })
                .resolves(dummySession);
            mockRemoteSsh
                .expects("getKey")
                .withExactArgs(landscape, dummyJwt, wsId)
                .resolves(key);
            (0, chai_1.expect)(await sshUtilsProxy.getPK(landscape, wsId)).to.be.equal(key);
        });
        it("getPK, auth session not created or canceled", async () => {
            mockAuthentication
                .expects("getSession")
                .withExactArgs("BASLandscapePAT", [landscape], { createIfNone: true })
                .resolves();
            mockRemoteSsh
                .expects("getKey")
                .withExactArgs(landscape, "", wsId)
                .resolves("");
            (0, chai_1.expect)(await sshUtilsProxy.getPK(landscape, wsId)).to.be.empty;
        });
        it("getPK, auth session created, token empty", async () => {
            mockAuthentication
                .expects("getSession")
                .withExactArgs("BASLandscapePAT", [landscape], { createIfNone: true })
                .resolves({});
            mockRemoteSsh
                .expects("getKey")
                .withExactArgs(landscape, "", wsId)
                .resolves("");
            (0, chai_1.expect)(await sshUtilsProxy.getPK(landscape, wsId)).to.be.empty;
        });
        it("getPK, exception thrown", async () => {
            const err = new Error(`command error`);
            mockAuthentication
                .expects("getSession")
                .withExactArgs("BASLandscapePAT", [landscape], { createIfNone: true })
                .rejects(err);
            try {
                await sshUtilsProxy.getPK(landscape, wsId);
                (0, assert_1.fail)(`should fail`);
            }
            catch (e) {
                (0, chai_1.expect)(e).to.be.deep.equal(err);
            }
        });
    });
    describe("savePK/deletePK unit test", () => {
        const configPath = `/my/config/path/test.cfg`;
        const folderPath = path.parse(configPath).dir;
        const fileName = path.join(folderPath, `${new node_url_1.URL(landscape).host}.key`);
        it("savePK, succedded, folder exists, config path configured", () => {
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(folderPath).returns(true);
            mockFs.expects(`existsSync`).withExactArgs(fileName).returns(false);
            mockFs
                .expects(`writeFileSync`)
                .withExactArgs(fileName, `${key}\n`, { mode: "0400", flag: "w" })
                .returns("");
            (0, chai_1.expect)(sshUtilsProxy.savePK(key, landscape)).to.be.equal(fileName);
        });
        it("savePK, succedded, folder exists, config path system used", () => {
            const configPath = path.join((0, os_1.homedir)(), ".ssh", "config");
            const folderPath = path.parse(configPath).dir;
            const fileName = path.join(folderPath, `${new node_url_1.URL(landscape).host}.key`);
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(undefined);
            mockFs.expects(`existsSync`).withExactArgs(folderPath).returns(true);
            mockFs.expects(`existsSync`).withExactArgs(fileName).returns(false);
            mockFs
                .expects(`writeFileSync`)
                .withExactArgs(fileName, `${key}\n`, { mode: "0400", flag: "w" })
                .returns("");
            (0, chai_1.expect)(sshUtilsProxy.savePK(key, landscape)).to.be.equal(fileName);
        });
        it("savePK, succedded, folder doesn't exist, key file exists, config path configured", () => {
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(folderPath).returns(false);
            mockFs.expects(`mkdirSync`).withExactArgs(folderPath).returns(true);
            mockFs.expects(`existsSync`).withExactArgs(fileName).returns(true);
            mockFs.expects(`unlinkSync`).withExactArgs(fileName).returns(true);
            mockFs
                .expects(`writeFileSync`)
                .withExactArgs(fileName, `${key}\n`, { mode: "0400", flag: "w" })
                .returns("");
            (0, chai_1.expect)(sshUtilsProxy.savePK(key, landscape)).to.be.equal(fileName);
        });
        it("deletePK, succedded, file exists, config path configured", () => {
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(fileName).returns(true);
            mockFs.expects(`unlinkSync`).withExactArgs(fileName).returns("");
            sshUtilsProxy.deletePK(landscape);
        });
        it("deletePK, succedded, file doesn't exist, config path configured", () => {
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(fileName).returns(false);
            mockFs.expects(`unlinkSync`).withExactArgs(fileName).never();
            sshUtilsProxy.deletePK(landscape);
        });
    });
    describe("updateSSHConfig unit tests", () => {
        const configPath = `/my/config/path/test.cfg`;
        const fileName = path.join(`/my/config/path`, `${new node_url_1.URL(landscape).host}.key`);
        it("updateSSHConfig, succedded, config not existed", () => {
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(configPath).returns(false);
            mockFs.expects(`writeFileSync`).withArgs(configPath).returns("");
            const configInfo = sshUtilsProxy.updateSSHConfig(fileName, node);
            (0, chai_1.expect)(configInfo.name).to.be.equal(`${new node_url_1.URL(node.landscapeUrl).host}.${node.id}`);
            (0, chai_1.expect)(parseInt(configInfo.port)).to.be.gt(30432);
            (0, chai_1.expect)(parseInt(configInfo.port)).to.be.lt(33654);
        });
        it("updateSSHConfig, succedded, config exists", () => {
            const data = `
Host ${`${new node_url_1.URL(landscape).host}.${node.id}`}
HostName 127.0.0.1
Port ${1234}
IdentityFile ${fileName}
User user
NoHostAuthenticationForLocalhost yes
`;
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(configPath).returns(true);
            mockFs
                .expects(`readFileSync`)
                .withArgs(configPath)
                .returns(Buffer.from(data, `utf8`));
            mockFs.expects(`writeFileSync`).withArgs(configPath).returns("");
            const configInfo = sshUtilsProxy.updateSSHConfig(fileName, node);
            (0, chai_1.expect)(configInfo.name).to.be.equal(`${new node_url_1.URL(node.landscapeUrl).host}.${node.id}`);
            (0, chai_1.expect)(parseInt(configInfo.port)).to.be.gt(30432);
            (0, chai_1.expect)(parseInt(configInfo.port)).to.be.lt(33654);
        });
    });
    describe("removeSSHConfig unit tests", () => {
        const configPath = `/my/config/path/test.cfg`;
        const fileName = path.join(`/my/config/path`, `${new node_url_1.URL(landscape).host}.key`);
        let data = `
Host ${`${new node_url_1.URL(landscape).host}.1`}
HostName 127.0.0.1
Port ${1234}
User user
`;
        it("removeSSHConfig, succedded, config section doesn't exist", () => {
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(configPath).returns(true);
            mockFs
                .expects(`readFileSync`)
                .withArgs(configPath)
                .returns(Buffer.from(data, `utf8`));
            let updatedConfig = "";
            fsProxy.writeFileSync = (file, data) => {
                updatedConfig = data;
            };
            sshUtilsProxy.removeSSHConfig(node);
            const config = sshConfig.parse(updatedConfig);
            (0, chai_1.expect)(config.compute(`${`${new node_url_1.URL(landscape).host}.${node.id}`}`)).to.be
                .empty;
            (0, chai_1.expect)(config.compute(`${`${new node_url_1.URL(landscape).host}.1`}`)).to.be.not
                .empty;
        });
        it("removeSSHConfig, succedded, config section exists", () => {
            data = `${data}

Host ${`${new node_url_1.URL(landscape).host}.${node.id}`}
HostName 127.0.0.1
Port ${1234}
`;
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(configPath).returns(true);
            mockFs
                .expects(`readFileSync`)
                .withArgs(configPath)
                .returns(Buffer.from(data, `utf8`));
            let updatedConfig = "";
            fsProxy.writeFileSync = (file, data) => {
                updatedConfig = data;
            };
            sshUtilsProxy.removeSSHConfig(node);
            const config = sshConfig.parse(updatedConfig);
            (0, chai_1.expect)(config.compute(`${`${new node_url_1.URL(landscape).host}.${node.id}`}`)).to.be
                .empty;
            (0, chai_1.expect)(config.compute(`${`${new node_url_1.URL(landscape).host}.1`}`)).to.be.not
                .empty;
        });
        it("removeSSHConfig, exception thrown", () => {
            const err = new Error(`error`);
            mockWorkspace
                .expects("getConfiguration")
                .withExactArgs("remote.SSH")
                .returns(configProxy);
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(`configFile`)
                .returns(configPath);
            mockFs.expects(`existsSync`).withExactArgs(configPath).returns(true);
            mockFs.expects(`readFileSync`).withArgs(configPath).throws(err);
            try {
                sshUtilsProxy.removeSSHConfig(node);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.equal(err.message);
            }
        });
    });
    describe("platform settings unit tests", () => {
        const keySshRemotePlatform = `remote.SSH.remotePlatform`;
        const config = {
            name: `${new node_url_1.URL(node.landscapeUrl).host}.${node.id}`,
            port: `12345`,
        };
        it("updateRemotePlatformSetting, config section doesn't exist", async () => {
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .returns(undefined);
            let settings;
            configProxy.update = (key, data, target) => {
                (0, chai_1.expect)(key).to.be.equal(keySshRemotePlatform);
                (0, chai_1.expect)(target).to.be.equal(localConfigurationTarget.Global);
                settings = data;
                return Promise.resolve();
            };
            await sshUtilsProxy.updateRemotePlatformSetting(config);
            (0, chai_1.expect)(settings[config.name]).to.be.equal(`linux`);
        });
        it("updateRemotePlatformSetting, config section exists", async () => {
            let settings = {};
            settings[config.name] = "windows";
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .returns(settings);
            configProxy.update = (key, data, target) => {
                (0, chai_1.expect)(key).to.be.equal(keySshRemotePlatform);
                (0, chai_1.expect)(target).to.be.equal(localConfigurationTarget.Global);
                settings = data;
                return Promise.resolve();
            };
            await sshUtilsProxy.updateRemotePlatformSetting(config);
            (0, chai_1.expect)(settings[config.name]).to.be.equal(`linux`);
        });
        it("updateRemotePlatformSetting, exception thrown", async () => {
            const err = new Error("error");
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .throws(err);
            try {
                await sshUtilsProxy.updateRemotePlatformSetting(config);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.be.equal(err.message);
            }
        });
        it("cleanRemotePlatformSetting, config section exists", async () => {
            let settings = {};
            settings[`${new node_url_1.URL(node.landscapeUrl).host}.${node.id}`] = "windows";
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .returns(settings);
            configProxy.update = (key, data, target) => {
                (0, chai_1.expect)(key).to.be.equal(keySshRemotePlatform);
                (0, chai_1.expect)(target).to.be.equal(localConfigurationTarget.Global);
                settings = data;
                return Promise.resolve();
            };
            await sshUtilsProxy.cleanRemotePlatformSetting(node);
            (0, chai_1.expect)(settings).to.be.deep.equal({});
        });
        it("cleanRemotePlatformSetting, config section doesn't exist", async () => {
            let settings = { section: `linux` };
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .returns(settings);
            configProxy.update = (key, data, target) => {
                (0, chai_1.expect)(key).to.be.equal(keySshRemotePlatform);
                (0, chai_1.expect)(target).to.be.equal(localConfigurationTarget.Global);
                settings = data;
                return Promise.resolve();
            };
            await sshUtilsProxy.cleanRemotePlatformSetting(node);
            (0, chai_1.expect)(settings).to.be.deep.equal({ section: `linux` });
        });
        it("cleanRemotePlatformSetting, config doesn't exist", async () => {
            let settings;
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .returns(settings);
            configProxy.update = (key, data, target) => {
                (0, chai_1.expect)(key).to.be.equal(keySshRemotePlatform);
                (0, chai_1.expect)(target).to.be.equal(localConfigurationTarget.Global);
                settings = data;
                return Promise.resolve();
            };
            await sshUtilsProxy.cleanRemotePlatformSetting(node);
            (0, chai_1.expect)(settings).to.be.deep.equal({});
        });
        it("cleanRemotePlatformSetting, exception thrown", async () => {
            const err = new Error("error");
            mockWorkspaceConfig
                .expects(`get`)
                .withExactArgs(keySshRemotePlatform)
                .throws(err);
            try {
                await sshUtilsProxy.cleanRemotePlatformSetting(node);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.be.equal(err.message);
            }
        });
    });
    describe("runChannelClient unit test", () => {
        let mockSsh;
        beforeEach(() => {
            mockSsh = (0, sinon_1.mock)(SshProxy);
        });
        afterEach(() => {
            mockSsh.verify();
        });
        const options = {
            host: `https://devspace-host.my`,
            landscape,
            localPort: `12345`,
        };
        it("runChannelClient, succedded", async () => {
            mockAuthentication
                .expects("getSession")
                .withExactArgs("BASLandscapePAT", [landscape], { createIfNone: true })
                .resolves(dummySession);
            mockSsh
                .expects("ssh")
                .withExactArgs({
                host: {
                    url: options.host,
                    port: `443`,
                },
                client: {
                    port: options.localPort,
                },
                username: `user`,
                jwt: dummyJwt,
            })
                .resolves();
            await sshUtilsProxy.runChannelClient(options);
        });
        it("runChannelClient, exception thrown", async () => {
            const err = new Error(`get jwt error`);
            mockAuthentication
                .expects("getSession")
                .withExactArgs("BASLandscapePAT", [landscape], { createIfNone: true })
                .rejects(err);
            return sshUtilsProxy
                .runChannelClient(options)
                .then(() => (0, assert_1.fail)(`should fail`))
                .catch((e) => {
                (0, chai_1.expect)(e).to.be.deep.equal(err);
            });
        });
    });
    describe("getRandomArbitrary unit test", () => {
        it("getRandomArbitrary, no params", () => {
            const x = 30432, y = 33654;
            (0, chai_1.expect)(sshUtilsProxy[`getRandomArbitrary`]()).to.be.gte(Math.min(x, y));
            (0, chai_1.expect)(sshUtilsProxy[`getRandomArbitrary`]()).to.be.lte(Math.max(x, y));
        });
        it("getRandomArbitrary, range specified", () => {
            const x = 10001, y = 10010;
            (0, chai_1.expect)(sshUtilsProxy[`getRandomArbitrary`](x, y)).to.be.gte(Math.min(x, y));
            (0, chai_1.expect)(sshUtilsProxy[`getRandomArbitrary`](x, y)).to.be.lte(Math.max(x, y));
        });
        it("getRandomArbitrary, range specified inverse", () => {
            const x = 2543, y = 1987;
            (0, chai_1.expect)(sshUtilsProxy[`getRandomArbitrary`](x, y)).to.be.gte(Math.min(x, y));
            (0, chai_1.expect)(sshUtilsProxy[`getRandomArbitrary`](x, y)).to.be.lte(Math.max(x, y));
        });
    });
});
//# sourceMappingURL=ssh-utils.spec.js.map