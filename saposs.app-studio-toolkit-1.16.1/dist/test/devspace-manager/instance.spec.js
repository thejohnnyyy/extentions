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
const chai_1 = require("chai");
const mockUtil_1 = require("../../test/mockUtil");
const sinon_1 = require("sinon");
var ConfigurationTargetProxy;
(function (ConfigurationTargetProxy) {
    ConfigurationTargetProxy[ConfigurationTargetProxy["Global"] = 1] = "Global";
})(ConfigurationTargetProxy || (ConfigurationTargetProxy = {}));
let registry;
const vscodeProxy = {
    workspace: {
        getConfiguration: () => {
            return {
                get: () => "",
                update: () => "",
            };
        },
        onDidChangeWorkspaceFolders: () => { },
        onDidChangeSessions: () => { },
    },
    commands: {
        registerCommand: (command, handler) => {
            registry.set(command, handler);
        },
        executeCommand: (...args) => { },
    },
    window: {
        createTreeView: () => { },
        registerUriHandler: () => { },
    },
    TreeItem: class MockTreeItem {
        constructor(label) {
            this.label = label || "";
        }
    },
    Disposable: {
        dispose: () => { },
    },
    ConfigurationTarget: ConfigurationTargetProxy,
    authentication: {
        getSession: () => { },
        registerAuthenticationProvider: () => { },
    },
    EventEmitter: class EventEmitterMock {
        constructor() { }
    },
};
(0, mockUtil_1.mockVscode)(vscodeProxy, "dist/src/authentication/authProvider.js");
(0, mockUtil_1.mockVscode)(vscodeProxy, "dist/src/devspace-manager/devspace/connect.js");
(0, mockUtil_1.mockVscode)(vscodeProxy, "dist/src/devspace-manager/instance.js");
const instance = __importStar(require("../../src/devspace-manager/instance"));
const authProvider_1 = require("../../src/authentication/authProvider");
const lodash_1 = require("lodash");
describe("extension unit test", () => {
    let sandbox;
    let authenticationMock;
    let commandsMock;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        registry = new Map();
        authenticationMock = sandbox.mock(vscodeProxy.authentication);
        commandsMock = sandbox.mock(vscodeProxy.commands);
    });
    afterEach(() => {
        authenticationMock.verify();
        commandsMock.verify();
    });
    const context = {
        subscriptions: {
            push: () => { },
        },
    };
    describe("initBasRemoteExplorer", () => {
        it("verifying registered commands", () => {
            instance.initBasRemoteExplorer(context);
            (0, chai_1.expect)((0, lodash_1.xor)([...registry.keys()], [
                `local-extension.tree.settings`,
                `local-extension.tree.refresh`,
                `local-extension.dev-space.connect-new-window`,
                `local-extension.dev-space.open-in-bas`,
                `local-extension.dev-space.start`,
                `local-extension.dev-space.stop`,
                `local-extension.dev-space.delete`,
                `local-extension.dev-space.add`,
                `local-extension.dev-space.edit`,
                `local-extension.dev-space.copy-ws-id`,
                `local-extension.landscape.open-dev-space-manager`,
                `local-extension.landscape.add`,
                `local-extension.landscape.delete`,
                `local-extension.landscape.set`,
                `local-extension.login`,
                `local-extension.dev-space.open-in-code`,
            ])).to.be.empty;
        });
        it("authentication provider registered", () => {
            authenticationMock
                .expects(`registerAuthenticationProvider`)
                .withArgs(authProvider_1.BasRemoteAuthenticationProvider.id, "SAP Business Application Studio")
                .returns({});
            instance.initBasRemoteExplorer(context);
        });
        it("command `local-extension.tree.settings`", () => {
            var _a;
            commandsMock
                .expects(`executeCommand`)
                .withExactArgs(`workbench.action.openSettings`, `Desktop Client`)
                .returns({});
            instance.initBasRemoteExplorer(context);
            (_a = registry.get(`local-extension.tree.settings`)) === null || _a === void 0 ? void 0 : _a();
        });
    });
    it("deactivate", async () => {
        commandsMock
            .expects(`executeCommand`)
            .withExactArgs(`remote-access.close-tunnel`)
            .resolves();
        await instance.deactivateBasRemoteExplorer();
    });
});
//# sourceMappingURL=instance.spec.js.map