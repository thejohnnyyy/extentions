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
const sinon = __importStar(require("sinon"));
const mockUtil_1 = require("./mockUtil");
let wasUpdateCalled = false;
const wsConfig = {
    get: () => [
        {
            id: "create",
            actionType: "CREATE",
            name: "create",
        },
        "create",
    ],
    update: () => {
        wasUpdateCalled = true;
    },
    actions: [
        {
            id: "openSettingsAction",
            actionType: "COMMAND",
            name: "workbench.action.openGlobalSettings",
        },
    ],
};
const testVscode = {
    workspace: {
        workspaceFolders: [{}, {}],
        getConfiguration: () => wsConfig,
        onDidChangeWorkspaceFolders: () => { },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/actionsFactory.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/impl.js");
const actionsConfig_1 = require("../src/actions/actionsConfig");
describe("actionsFactory test", () => {
    let sandbox;
    let workspaceMock;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        workspaceMock = sandbox.mock(testVscode.workspace);
        wasUpdateCalled = false;
    });
    it("test clear actions", () => {
        (0, actionsConfig_1.clear)();
        (0, chai_1.expect)(wasUpdateCalled).to.be.true;
    });
    it("test clear empty actions", () => {
        wsConfig.actions = [];
        (0, actionsConfig_1.clear)();
        (0, chai_1.expect)(wasUpdateCalled).to.be.false;
    });
});
//# sourceMappingURL=actionsConfig.spec.js.map