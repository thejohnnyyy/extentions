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
const proxyquire_1 = __importDefault(require("proxyquire"));
const p_defer_1 = __importDefault(require("p-defer"));
const chai_1 = require("chai");
const mockUtil_1 = require("./mockUtil");
const sinon_1 = require("sinon");
const lodash_1 = require("lodash");
const wsConfig = {
    get: () => [
        {
            id: "create",
            actionType: "CREATE",
            name: "create",
        },
        "create",
    ],
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
                                id: "openSettingsAction",
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
        workspaceFolders: [{}, {}],
        getConfiguration: () => wsConfig,
        onDidChangeWorkspaceFolders: () => { },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/controller.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/performer.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/actionsConfig.js");
const controller_1 = require("../src/actions/controller");
const actionsFactory_1 = require("../src/actions/actionsFactory");
const performer = __importStar(require("../src/actions/performer"));
const basctlServer = __importStar(require("../src/basctlServer/basctlServer"));
describe("controller unit test", () => {
    let sandbox;
    let basctlServerMock;
    let performerMock;
    let workspaceMock;
    let extensionsMock;
    let loggerMock;
    let actionsFactoryMock;
    const testLogger = {
        getChildLogger: () => ({}),
    };
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        workspaceMock = sandbox.mock(testVscode.workspace);
        basctlServerMock = sandbox.mock(basctlServer);
        performerMock = sandbox.mock(performer);
        extensionsMock = sandbox.mock(testVscode.extensions);
        loggerMock = sandbox.mock(testLogger);
        actionsFactoryMock = sandbox.mock(actionsFactory_1.ActionsFactory);
    });
    afterEach(() => {
        workspaceMock.verify();
        basctlServerMock.verify();
        performerMock.verify();
        extensionsMock.verify();
        loggerMock.verify();
        actionsFactoryMock.verify();
    });
    describe("loadContributedActions", () => {
        let requireMock;
        before(() => {
            requireMock = require("mock-require");
            const configuration = { actions: "openSettingsAction,stam" };
            const sapPlugin = {
                window: {
                    configuration: () => configuration,
                },
            };
            requireMock("@sap/plugin", sapPlugin);
        });
        const action = {
            id: "openSettingsAction",
            actionType: "COMMAND",
            name: "workbench.action.openGlobalSettings",
        };
        it("one of the two actions exists", () => {
            controller_1.ActionsController.loadContributedActions();
            const result = controller_1.ActionsController.getAction("openSettingsAction");
            (0, chai_1.expect)(controller_1.ActionsController["actions"].length).to.be.equal(1);
            (0, chai_1.expect)(result).to.includes(action);
        });
        it("action doesnt exist", () => {
            controller_1.ActionsController.loadContributedActions();
            const result = controller_1.ActionsController.getAction("abc");
            (0, chai_1.expect)(result).to.be.undefined;
        });
        it("throw error", () => {
            const api = {
                packageJSON: {
                    BASContributes: {
                        actions: [
                            {
                                id: "create",
                                actionType: "CREATE",
                                name: "create",
                            },
                        ],
                    },
                },
            };
            (0, lodash_1.set)(testVscode, "extensions.all", [api]);
            const testError = new Error(`Failed to create action ${JSON.stringify(api.packageJSON.BASContributes.actions[0])}`);
            try {
                controller_1.ActionsController.loadContributedActions();
            }
            catch (error) {
                (0, chai_1.expect)(error).to.be.equal(testError);
            }
        });
    });
    describe("performAction", () => {
        context("byIDs", () => {
            context("performActionsFromURL()", () => {
                let actionCtrlProxy;
                let performActionArgsPromise;
                let requireMock;
                before(() => {
                    requireMock = require("mock-require");
                    const configuration = { actions: "openSettingsAction,stam" };
                    const sapPlugin = {
                        window: {
                            configuration: () => configuration,
                        },
                    };
                    requireMock("@sap/plugin", sapPlugin);
                    const performActionDeferred = (0, p_defer_1.default)();
                    performActionArgsPromise = performActionDeferred.promise;
                    const proxyControllerModule = (0, proxyquire_1.default)("../src/actions/controller", {
                        "../apis/parameters": {
                            getParameter() {
                                // by "ids" structure (no array)
                                return "openSettingsAction";
                            },
                        },
                        "./performer": {
                            _performAction(action) {
                                performActionDeferred.resolve(action);
                            },
                        },
                        vscode: {
                            extensions: {
                                all: [
                                    {
                                        packageJSON: {
                                            BASContributes: {
                                                actions: [
                                                    {
                                                        // `id` matches `getParameter()` result above
                                                        id: "openSettingsAction",
                                                        actionType: "COMMAND",
                                                        name: "workbench.action.openGlobalSettings",
                                                    },
                                                ],
                                            },
                                        },
                                    },
                                ],
                            },
                            "@noCallThru": true,
                        },
                    });
                    actionCtrlProxy = proxyControllerModule.ActionsController;
                    actionCtrlProxy.loadContributedActions();
                });
                it("performActionsFromURL call to performFullActions bamba", async () => {
                    const expectedAction = actionsFactory_1.ActionsFactory.createAction({
                        name: "workbench.action.openGlobalSettings",
                        actionType: "COMMAND",
                        id: "openSettingsAction",
                    }, true);
                    await actionCtrlProxy.performActionsFromURL();
                    await (0, chai_1.expect)(performActionArgsPromise).to.eventually.deep.equal(expectedAction);
                });
            });
            it("throw error", () => {
                const api = {
                    packageJSON: {
                        BASContributes: {
                            actions: [
                                {
                                    id: "create",
                                    actionType: "CREATE",
                                    name: "create",
                                },
                            ],
                        },
                    },
                };
                const testError = new Error(`Failed to execute scheduled action ${JSON.stringify(api.packageJSON.BASContributes.actions[0])}`);
                try {
                    controller_1.ActionsController.performScheduledActions();
                }
                catch (error) {
                    (0, chai_1.expect)(error).to.be.equal(testError);
                }
            });
        });
    });
    context("inlined", () => {
        context("performActionsFromURL()", () => {
            let actionCtrlProxy;
            let performActionArgsPromise;
            before(() => {
                const performActionDeferred = (0, p_defer_1.default)();
                performActionArgsPromise = performActionDeferred.promise;
                const proxyControllerModule = (0, proxyquire_1.default)("../src/actions/controller", {
                    "../apis/parameters": {
                        getParameter() {
                            // **inlined** json structured
                            return '[{"actionType":"COMMAND","name":"workbench.action.openSettings"}]';
                        },
                    },
                    "./performer": {
                        _performAction(action) {
                            performActionDeferred.resolve(action);
                        },
                    },
                    vscode: Object.assign(Object.assign({}, testVscode), { "@noCallThru": true }),
                });
                actionCtrlProxy = proxyControllerModule.ActionsController;
            });
            it("performActionsFromURL call to perfomFullActions", async () => {
                const expectedAction = actionsFactory_1.ActionsFactory.createAction({ actionType: "COMMAND", name: "workbench.action.openSettings" }, true);
                await actionCtrlProxy.performActionsFromURL();
                await (0, chai_1.expect)(performActionArgsPromise).to.eventually.deep.equal(expectedAction);
            });
        });
        it("_performAction should be called", () => {
            const action = actionsFactory_1.ActionsFactory.createAction({ actionType: "FILE", uri: "https://www.google.com/" }, true);
            performerMock.expects("_performAction").withExactArgs(action).resolves();
            controller_1.ActionsController["perfomInlinedActions"]('[{"actionType":"FILE","uri":"https://www.google.com/"}]');
        });
        it("error should be thrown", () => {
            const testError = new Error(`Failed to create action`);
            try {
                controller_1.ActionsController["perfomInlinedActions"]('[{"actionType":"STAM","uri":"https://www.google.com/"}]');
            }
            catch (error) {
                (0, chai_1.expect)(error).to.be.equal(testError);
            }
        });
    });
});
//# sourceMappingURL=controller.spec.js.map