"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../../src/devspace-manager/common/messages");
describe("cmdDevSpaceDelete unit test", () => {
    let devspaceDeleteProxy;
    const proxyWindow = {
        showErrorMessage: () => {
            throw new Error("not implemented");
        },
        showInformationMessage: () => {
            throw new Error("not implemented");
        },
    };
    const proxyCommands = {
        executeCommand: () => {
            throw new Error("not implemented");
        },
    };
    const proxyDevSpace = {
        devspace: {
            deleteDevSpace: () => {
                throw new Error("not implemented");
            },
        },
    };
    const proxyAuthUtils = {
        getJwt: () => {
            throw new Error(`not implemented`);
        },
    };
    before(() => {
        devspaceDeleteProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/delete", {
            vscode: {
                commands: proxyCommands,
                window: proxyWindow,
                "@noCallThru": true,
            },
            "@sap/bas-sdk": proxyDevSpace,
            "../../authentication/auth-utils": proxyAuthUtils,
        }).cmdDevSpaceDelete;
    });
    let mockAuthUtils;
    let mockDevspace;
    let mockCommands;
    let mockWindow;
    beforeEach(() => {
        mockAuthUtils = (0, sinon_1.mock)(proxyAuthUtils);
        mockDevspace = (0, sinon_1.mock)(proxyDevSpace.devspace);
        mockCommands = (0, sinon_1.mock)(proxyCommands);
        mockWindow = (0, sinon_1.mock)(proxyWindow);
    });
    afterEach(() => {
        mockAuthUtils.verify();
        mockDevspace.verify();
        mockCommands.verify();
        mockWindow.verify();
    });
    const node = {
        label: `devspace.lable`,
        landscapeUrl: `https://my.landscape-1.com`,
        wsUrl: `https://my.devspace.url.test`,
        id: `ws-id`,
    };
    const jwt = `devscape-jwt`;
    it("cmdDevSpaceDelete, confirmed, succedded", async () => {
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.lbl_delete_devspace(node.label, node.id), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_yes);
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .resolves(jwt);
        mockDevspace
            .expects(`deleteDevSpace`)
            .withExactArgs(node.landscapeUrl, jwt, node.id)
            .resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("remote-access.dev-space.clean-devspace-config", node)
            .resolves();
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.info_devspace_deleted(node.id))
            .resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        await devspaceDeleteProxy(node);
    });
    it("cmdDevSpaceDelete, canceled", async () => {
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.lbl_delete_devspace(node.label, node.id), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_no);
        await devspaceDeleteProxy(node);
    });
    it("cmdDevSpaceDelete, confirmed, exception thrown via cleaning stage", async () => {
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.lbl_delete_devspace(node.label, node.id), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_yes);
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .resolves(jwt);
        mockDevspace
            .expects(`deleteDevSpace`)
            .withExactArgs(node.landscapeUrl, jwt, node.id)
            .resolves();
        const err = new Error(`cleaning stage error`);
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("remote-access.dev-space.clean-devspace-config", node)
            .rejects(err);
        mockWindow
            .expects(`showErrorMessage`)
            .withExactArgs(messages_1.messages.err_devspace_delete(node.id, err.toString()))
            .resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        await devspaceDeleteProxy(node);
    });
    it("cmdDevSpaceDelete, confirmed, exception thrown", async () => {
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.lbl_delete_devspace(node.label, node.id), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_yes);
        const err = new Error(`getting jwt error`);
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .rejects(err);
        mockWindow
            .expects(`showErrorMessage`)
            .withExactArgs(messages_1.messages.err_devspace_delete(node.id, err.toString()))
            .resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        await devspaceDeleteProxy(node);
    });
});
//# sourceMappingURL=delete.spec.js.map