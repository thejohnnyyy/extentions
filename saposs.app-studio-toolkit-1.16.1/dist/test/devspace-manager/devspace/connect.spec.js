"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const url_join_1 = __importDefault(require("url-join"));
const messages_1 = require("../../../src/devspace-manager/common/messages");
const assert_1 = require("assert");
describe("devspace connect unit test", () => {
    let sandbox;
    let connectProxy;
    const proxyWindow = {
        showErrorMessage: () => {
            throw new Error("not implemented");
        },
    };
    const proxyCommands = {
        executeCommand: () => {
            throw new Error("not implemented");
        },
    };
    const proxyUri = {
        parse: (urlStr) => { },
    };
    const proxyEnv = {
        openExternal: () => {
            throw new Error("not implemented");
        },
    };
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
        connectProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/connect", {
            vscode: {
                window: proxyWindow,
                commands: proxyCommands,
                env: proxyEnv,
                Uri: proxyUri,
                "@noCallThru": true,
            },
        });
    });
    let mockCommands;
    let mockWindow;
    beforeEach(() => {
        sandbox.restore();
        mockCommands = (0, sinon_1.mock)(proxyCommands);
        mockWindow = (0, sinon_1.mock)(proxyWindow);
    });
    afterEach(() => {
        mockCommands.verify();
        mockWindow.verify();
    });
    const node = {
        landscapeUrl: `https://my.landscape-1.com`,
        wsUrl: `https://my.devspace.com`,
        id: `wd-id`,
    };
    it("closeTunnel", async () => {
        mockCommands
            .expects("executeCommand")
            .withExactArgs("remote-access.close-tunnel")
            .resolves();
        await connectProxy.closeTunnel();
    });
    describe(`cmdDevSpaceOpenInBAS scope unit tests set`, () => {
        let mockEnv;
        beforeEach(() => {
            mockEnv = (0, sinon_1.mock)(proxyEnv);
        });
        afterEach(() => {
            mockEnv.verify();
        });
        it("cmdDevSpaceOpenInBAS, succedded", async () => {
            const urlStr = (0, url_join_1.default)(node.landscapeUrl, `index.html`, `#${node.id}`);
            const url = { fsPath: urlStr };
            mockEnv.expects(`openExternal`).withExactArgs(url).resolves(true);
            sandbox.stub(proxyUri, `parse`).withArgs(urlStr).returns(url);
            (0, chai_1.expect)(await connectProxy.cmdDevSpaceOpenInBAS(node)).to.be.true;
        });
        it("cmdDevSpaceOpenInBAS, rejected", async () => {
            const err = new Error(`parse error`);
            sandbox.stub(proxyUri, `parse`).throws(err);
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_bas(node.landscapeUrl, err.message))
                .resolves();
            (0, chai_1.expect)(await connectProxy.cmdDevSpaceOpenInBAS(node)).to.be.false;
        });
    });
    describe(`cmdDevSpaceConnectNewWindow scope unit tests set`, () => {
        it("cmdDevSpaceConnectNewWindow, succedded", async () => {
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`remote-access.dev-space.connect-new-window`, node, "")
                .resolves();
            await connectProxy.cmdDevSpaceConnectNewWindow(node, "");
        });
        it("cmdDevSpaceConnectNewWindow, failed", async () => {
            const err = new Error(`command execution error`);
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`remote-access.dev-space.connect-new-window`, node, "")
                .rejects(err);
            try {
                await connectProxy.cmdDevSpaceConnectNewWindow(node, "");
                (0, assert_1.fail)("should fail");
            }
            catch (e) {
                (0, chai_1.expect)(e).to.be.deep.equal(err);
            }
        });
    });
});
//# sourceMappingURL=connect.spec.js.map