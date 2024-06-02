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
const mockUtil_1 = require("./mockUtil");
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const wsConfig = {
    get: () => "",
    update: () => "",
};
const testVscode = {
    extensions: {
        all: [
            {
                packageJSON: {
                    BASContributes: {
                        actions: [
                            {
                                id: "abc123",
                                actionType: "COMMAND",
                                name: "workbench.action.openGlobalSettings",
                            },
                        ],
                    },
                },
            },
        ],
    },
    workspace: {
        getConfiguration: () => wsConfig,
        onDidChangeWorkspaceFolders: () => { },
    },
    commands: {
        registerCommand: () => { },
    },
    TreeItem: class MockTreeItem {
        constructor(label) {
            this.label = label || "";
        }
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/extension.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/controller.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/performer.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/actionsConfig.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/basctlServer/basctlServer.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/project-type/workspace-instance.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/devspace-manager/instance.js");
const extension = __importStar(require("../src/extension"));
const performer = __importStar(require("../src/actions/performer"));
const basctlServer = __importStar(require("../src/basctlServer/basctlServer"));
const runInBas = __importStar(require("../src/utils/bas-utils"));
const logger = __importStar(require("../src/logger/logger"));
const assert_1 = require("assert");
const actionsFactory_1 = require("../src/actions/actionsFactory");
const basRemoteExplorerInstance = __importStar(require("../src/devspace-manager/instance"));
const lodash_1 = require("lodash");
describe("extension unit test", () => {
    let sandbox;
    let workspaceMock;
    let basctlServerMock;
    let shouldRunCtlServerMock;
    let performerMock;
    let wsConfigMock;
    let loggerMock;
    let basRemoteExplorerMock;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        workspaceMock = sandbox.mock(testVscode.workspace);
        basctlServerMock = sandbox.mock(basctlServer);
        shouldRunCtlServerMock = sandbox.mock(runInBas);
        performerMock = sandbox.mock(performer);
        wsConfigMock = sandbox.mock(wsConfig);
        loggerMock = sandbox.mock(logger);
        basRemoteExplorerMock = sandbox.mock(basRemoteExplorerInstance);
    });
    afterEach(() => {
        workspaceMock.verify();
        basctlServerMock.verify();
        shouldRunCtlServerMock.verify();
        performerMock.verify();
        wsConfigMock.verify();
        loggerMock.verify();
        basRemoteExplorerMock.verify();
    });
    describe("package definitions", () => {
        let packageJson;
        before(() => {
            packageJson = require("../../package.json");
        });
        it("extension pack definition verifing", () => {
            (0, chai_1.expect)((0, lodash_1.xor)(packageJson.extensionPack, ["SAPOSS.app-studio-remote-access"])).to.be.empty;
        });
        it("command 'local-extension.dev-space.open-in-code' is available on web only", () => {
            const command = (0, lodash_1.find)(packageJson.contributes.menus.commandPalette, [
                `command`,
                `local-extension.dev-space.open-in-code`,
            ]);
            (0, chai_1.expect)(command).to.haveOwnProperty("when").equal("isWeb");
        });
    });
    describe("activate", () => {
        it("performs defined actions", () => {
            const context = {
                subscriptions: {
                    push: () => { },
                },
            };
            basRemoteExplorerMock
                .expects("initBasRemoteExplorer")
                .withExactArgs(context);
            loggerMock.expects("initLogger").withExactArgs(context);
            shouldRunCtlServerMock.expects("shouldRunCtlServer").returns(true);
            basctlServerMock.expects("startBasctlServer");
            const scheduledAction = {
                name: "actName",
                actionType: "COMMAND",
            };
            wsConfigMock
                .expects("get")
                .withExactArgs("actions", [])
                .returns([scheduledAction]);
            const action = actionsFactory_1.ActionsFactory.createAction(scheduledAction, true);
            performerMock.expects("_performAction").withExactArgs(action).resolves();
            extension.activate(context);
        });
        it("does nothing with no actions", () => {
            const context = {
                subscriptions: {
                    push: () => { },
                },
            };
            loggerMock.expects("initLogger").withExactArgs(context);
            shouldRunCtlServerMock.expects("shouldRunCtlServer").returns(false);
            performerMock.expects("_performAction").never();
            wsConfigMock.expects("get").withExactArgs("actions", []).returns([]);
            basRemoteExplorerMock
                .expects("initBasRemoteExplorer")
                .withExactArgs(context);
            const result = extension.activate(context);
            (0, chai_1.expect)(result).to.haveOwnProperty("getExtensionAPI");
            (0, chai_1.expect)(result).to.haveOwnProperty("actions");
        });
        it("fails when startBasctlServer throws an error", () => {
            const context = {};
            const testError = new Error("Socket failure");
            loggerMock.expects("initLogger").withExactArgs(context);
            shouldRunCtlServerMock.expects("shouldRunCtlServer").returns(true);
            basctlServerMock.expects("startBasctlServer").throws(testError);
            try {
                extension.activate(context);
                (0, assert_1.fail)("test should fail");
            }
            catch (error) {
                (0, chai_1.expect)(error.message).to.be.equal(testError.message);
            }
        });
    });
    it("deactivate", () => {
        basctlServerMock.expects("closeBasctlServer");
        extension.deactivate();
    });
});
//# sourceMappingURL=extension.spec.js.map