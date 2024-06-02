"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../../src/devspace-manager/common/messages");
describe("cmdCopyWsId unit test", () => {
    let devspaceCopyProxy;
    const proxyWindow = {
        showErrorMessage: () => {
            throw new Error("not implemented");
        },
        showInformationMessage: () => {
            throw new Error("not implemented");
        },
    };
    const proxyEnv = {
        clipboard: {
            writeText: () => {
                throw new Error("not implemented");
            },
        },
    };
    before(() => {
        devspaceCopyProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/copy", {
            vscode: {
                env: proxyEnv,
                window: proxyWindow,
                "@noCallThru": true,
            },
        }).cmdCopyWsId;
    });
    let mockClip;
    let mockWindow;
    beforeEach(() => {
        mockClip = (0, sinon_1.mock)(proxyEnv.clipboard);
        mockWindow = (0, sinon_1.mock)(proxyWindow);
    });
    afterEach(() => {
        mockClip.verify();
        mockWindow.verify();
    });
    const node = {
        id: `ws-id`,
    };
    it("cmdCopyWsId, succedded", async () => {
        mockClip.expects(`writeText`).withExactArgs(node.id).resolves();
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.info_wsid_copied)
            .resolves();
        await devspaceCopyProxy(node);
    });
    it("cmdCopyWsId, failed", async () => {
        const err = new Error(`error`);
        mockClip.expects(`writeText`).withExactArgs(node.id).rejects(err);
        mockWindow
            .expects(`showErrorMessage`)
            .withExactArgs(messages_1.messages.err_copy_devspace_id(err.message))
            .resolves();
        await devspaceCopyProxy(node);
    });
});
//# sourceMappingURL=copy.spec.js.map