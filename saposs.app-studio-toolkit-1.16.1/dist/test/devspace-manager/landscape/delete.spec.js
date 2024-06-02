"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const proxyquire_1 = __importDefault(require("proxyquire"));
const sinon_1 = require("sinon");
const messages_1 = require("../../../src/devspace-manager/common/messages");
describe("landscapes delete unit test", () => {
    let cmdLandscapeDeleteProxy;
    const proxyWindow = {
        showInformationMessage: () => {
            throw new Error("not implemented");
        },
    };
    const proxyCommands = {
        executeCommand: () => {
            throw new Error("not implemented");
        },
    };
    const removeLandscapeProxy = {
        removeLandscape: () => {
            throw new Error("not implemented");
        },
    };
    before(() => {
        cmdLandscapeDeleteProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/landscape/delete", {
            "./landscape": removeLandscapeProxy,
            vscode: {
                window: proxyWindow,
                commands: proxyCommands,
                "@noCallThru": true,
            },
        }).cmdLandscapeDelete;
    });
    let mockWindow;
    let mockCommands;
    let mockRemoveLandscape;
    beforeEach(() => {
        mockWindow = (0, sinon_1.mock)(proxyWindow);
        mockCommands = (0, sinon_1.mock)(proxyCommands);
        mockRemoveLandscape = (0, sinon_1.mock)(removeLandscapeProxy);
    });
    afterEach(() => {
        mockWindow.verify();
        mockCommands.verify();
        mockRemoveLandscape.verify();
    });
    const node = {
        label: "landscape-1",
        url: "https://my.landscape-1.com",
    };
    it("cmdLandscapeDelete, canceled", async () => {
        mockWindow
            .expects("showInformationMessage")
            .withExactArgs(messages_1.messages.lbl_delete_landscape(node.label), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves();
        mockRemoveLandscape.expects("removeLandscape").never();
        await cmdLandscapeDeleteProxy(node);
    });
    it("cmdLandscapeDelete, answer no", async () => {
        mockWindow
            .expects("showInformationMessage")
            .withExactArgs(messages_1.messages.lbl_delete_landscape(node.label), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_no);
        mockRemoveLandscape.expects("removeLandscape").never();
        await cmdLandscapeDeleteProxy(node);
    });
    it("cmdLandscapeDelete, answer yes", async () => {
        mockWindow
            .expects("showInformationMessage")
            .withExactArgs(messages_1.messages.lbl_delete_landscape(node.label), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_yes);
        mockCommands
            .expects("executeCommand")
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        mockRemoveLandscape
            .expects("removeLandscape")
            .withExactArgs(node.url)
            .resolves();
        await cmdLandscapeDeleteProxy(node);
        await new Promise((resolve) => setTimeout(() => resolve(true), 100));
    });
    it("cmdLandscapeDelete, answer yes, removeLandscape rejected", async () => {
        mockWindow
            .expects("showInformationMessage")
            .withExactArgs(messages_1.messages.lbl_delete_landscape(node.label), ...[messages_1.messages.lbl_yes, messages_1.messages.lbl_no])
            .resolves(messages_1.messages.lbl_yes);
        mockCommands
            .expects("executeCommand")
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        mockRemoveLandscape
            .expects("removeLandscape")
            .withExactArgs(node.url)
            .rejects(new Error("e"));
        await cmdLandscapeDeleteProxy(node).catch((e) => "");
        await new Promise((resolve) => setTimeout(() => resolve(true), 100));
    });
});
//# sourceMappingURL=delete.spec.js.map