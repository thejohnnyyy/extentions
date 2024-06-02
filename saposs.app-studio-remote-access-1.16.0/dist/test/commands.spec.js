"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const mockUtil_1 = require("./mockUtil");
const proxyProgress = {
    report: () => {
        throw new Error("not implemented");
    },
};
const testVscode = {
    window: {
        showErrorMessage: (m) => {
            throw new Error(`not implemented`);
        },
        withProgress: (opt, listener) => {
            (0, chai_1.expect)(opt.location).to.be.equal(testVscode.ProgressLocation.Notification);
            (0, chai_1.expect)(opt.cancellable).to.be.true;
            (0, chai_1.expect)(opt.title.startsWith(`Connecting to `)).to.be.true;
            return listener(proxyProgress);
        },
    },
    commands: {
        executeCommand: () => {
            throw new Error(`not implemented`);
        },
    },
    ProgressLocation: {
        SourceControl: 1,
        Window: 10,
        Notification: 15,
    },
    Uri: { parse: () => "" },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/commands.js");
const proxyquire_1 = __importDefault(require("proxyquire"));
const node_url_1 = require("node:url");
const ssh_utils_1 = require("../src/tunnel/ssh-utils");
const messages_1 = require("../src/messages");
describe("devspace connect unit test", () => {
    let commandsProxy;
    const proxySshUtils = {
        getPK: () => {
            throw new Error("not implemented");
        },
        runChannelClient: () => {
            throw new Error("not implemented");
        },
        savePK: () => {
            throw new Error("not implemented");
        },
        updateRemotePlatformSetting: () => {
            throw new Error("not implemented");
        },
        updateSSHConfig: () => {
            throw new Error("not implemented");
        },
        cleanRemotePlatformSetting: () => {
            throw new Error("not implemented");
        },
        deletePK: () => {
            throw new Error("not implemented");
        },
        removeSSHConfig: () => {
            throw new Error("not implemented");
        },
    };
    const dummyLogger = {
        info: () => "",
        error: () => "",
    };
    before(() => {
        commandsProxy = (0, proxyquire_1.default)("../src/commands", {
            vscode: {
                ProgressLocation: testVscode.ProgressLocation,
                window: testVscode.window,
                commands: testVscode.commands,
                Uri: testVscode.Uri,
                "@noCallThru": true,
            },
            "./tunnel/ssh-utils": proxySshUtils,
            "./logger/logger": {
                getLogger: () => dummyLogger,
            },
        });
    });
    let mockCommands;
    let mockWindow;
    let mockSshUtils;
    beforeEach(() => {
        mockCommands = (0, sinon_1.mock)(testVscode.commands);
        mockWindow = (0, sinon_1.mock)(testVscode.window);
        mockSshUtils = (0, sinon_1.mock)(proxySshUtils);
    });
    afterEach(() => {
        mockCommands.verify();
        mockWindow.verify();
        mockSshUtils.verify();
    });
    const node = {
        landscapeUrl: `https://my.landscape-1.com`,
        wsUrl: `https://my.devspace.com`,
        id: `wd-id`,
    };
    it("closeTunnel", () => {
        (0, chai_1.expect)(commandsProxy.closeTunnel()).to.be.false;
    });
    describe(`cmdDevSpaceConnectNewWindow scope unit tests set`, () => {
        let mockProgress;
        beforeEach(() => {
            mockProgress = (0, sinon_1.mock)(proxyProgress);
        });
        afterEach(() => {
            mockProgress.verify();
        });
        const key = `key`;
        const keyPath = `/home/user/location.${key}`;
        const config = {
            name: node.landscapeUrl,
            port: 12345,
        };
        const opts = {
            host: `port${ssh_utils_1.SSHD_SOCKET_PORT}-${new node_url_1.URL(node.wsUrl).hostname}`,
            landscape: node.landscapeUrl,
            localPort: config.port,
        };
        it("cmdDevSpaceConnectNewWindow, succedded - opens empty window", async () => {
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_obtaining_key}` })
                .returns(true);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_save_pk_to_file}` })
                .returns(true);
            mockProgress
                .expects(`report`)
                .withExactArgs({
                message: `${messages_1.messages.info_update_config_file_with_ssh_connection}`,
            })
                .returns(true);
            mockSshUtils
                .expects("getPK")
                .withExactArgs(node.landscapeUrl, node.id)
                .resolves(key);
            mockSshUtils
                .expects("savePK")
                .withExactArgs(key, node.wsUrl)
                .returns(keyPath);
            mockSshUtils
                .expects("updateSSHConfig")
                .withExactArgs(keyPath, node)
                .resolves(config);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_closing_old_tunnel}` })
                .returns(true);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_staring_new_tunnel}` })
                .returns(true);
            mockSshUtils.expects("runChannelClient").withExactArgs(opts).resolves();
            mockSshUtils
                .expects("updateRemotePlatformSetting")
                .withExactArgs(config)
                .resolves();
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`opensshremotes.openEmptyWindow`, {
                host: config.name,
            });
            await commandsProxy.cmdDevSpaceConnectNewWindow(node, "");
        });
        it("cmdDevSpaceConnectNewWindow, succedded - opens new window with specific folder", async () => {
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_obtaining_key}` })
                .returns(true);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_save_pk_to_file}` })
                .returns(true);
            mockProgress
                .expects(`report`)
                .withExactArgs({
                message: `${messages_1.messages.info_update_config_file_with_ssh_connection}`,
            })
                .returns(true);
            mockSshUtils
                .expects("getPK")
                .withExactArgs(node.landscapeUrl, node.id)
                .resolves(key);
            mockSshUtils
                .expects("savePK")
                .withExactArgs(key, node.wsUrl)
                .returns(keyPath);
            mockSshUtils
                .expects("updateSSHConfig")
                .withExactArgs(keyPath, node)
                .resolves(config);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_closing_old_tunnel}` })
                .returns(true);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_staring_new_tunnel}` })
                .returns(true);
            mockSshUtils.expects("runChannelClient").withExactArgs(opts).resolves();
            mockSshUtils
                .expects("updateRemotePlatformSetting")
                .withExactArgs(config)
                .resolves();
            mockCommands.expects(`executeCommand`).withArgs(`vscode.openFolder`);
            await commandsProxy.cmdDevSpaceConnectNewWindow(node, "/home/user/projects/project1");
        });
        it("cmdDevSpaceConnectNewWindow, failed", async () => {
            const err = new Error(`error during getPK`);
            mockProgress
                .expects(`report`)
                .withExactArgs({ message: `${messages_1.messages.info_obtaining_key}` })
                .returns(true);
            mockSshUtils
                .expects("getPK")
                .withExactArgs(node.landscapeUrl, node.id)
                .rejects(err);
            mockCommands.expects(`executeCommand`).never();
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_devspace_connect_new_window(node.wsUrl, err.toString()))
                .resolves();
            await commandsProxy.cmdDevSpaceConnectNewWindow(node, "");
        });
    });
    describe(`cleanDevspaceConfig scope unit tests`, () => {
        let mockLogger;
        beforeEach(() => {
            mockLogger = (0, sinon_1.mock)(dummyLogger);
        });
        afterEach(() => {
            mockLogger.verify();
        });
        it("cleanDevspaceConfig, ok", async () => {
            mockSshUtils.expects("deletePK").withExactArgs(node.wsUrl).returns(true);
            mockSshUtils.expects("removeSSHConfig").withExactArgs(node).returns(true);
            mockSshUtils
                .expects("cleanRemotePlatformSetting")
                .withExactArgs(node)
                .resolves();
            mockLogger
                .expects("info")
                .withExactArgs(`Devspace ssh config info cleaned`)
                .returns("");
            await commandsProxy.cleanDevspaceConfig(node);
        });
        it("cleanDevspaceConfig, failed", async () => {
            const err = new Error("deletePK - failed");
            mockSshUtils.expects("deletePK").withExactArgs(node.wsUrl).throws(err);
            mockLogger
                .expects("error")
                .withExactArgs(`Can't complete the devspace ssh config cleaning: ${err.toString()}`)
                .returns("");
            await commandsProxy.cleanDevspaceConfig(node);
        });
    });
});
//# sourceMappingURL=commands.spec.js.map