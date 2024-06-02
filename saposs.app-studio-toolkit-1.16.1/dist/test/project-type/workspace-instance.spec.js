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
const mockUtil_1 = require("../mockUtil");
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const wsConfig = {
    get: () => "",
    update: () => "",
};
let commandParmater;
let callbackParmater;
const testVscode = {
    workspace: {
        getConfiguration: () => wsConfig,
        onDidChangeWorkspaceFolders: () => { },
    },
    commands: {
        registerCommand: (command, callback) => {
            commandParmater = command;
            callbackParmater = callback;
        },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/project-type/workspace-instance.js");
const workspaceInstance = __importStar(require("../../src/project-type/workspace-instance"));
const artifact_management_1 = require("@sap/artifact-management");
describe("workspace-instance unit test", () => {
    let sandbox;
    let workspaceMock;
    let commandExecutorMock;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        commandParmater = "";
        callbackParmater = () => Promise.resolve("");
        workspaceMock = sandbox.mock(testVscode.workspace);
        commandExecutorMock = sandbox.mock(artifact_management_1.CommandExecutor);
    });
    afterEach(() => {
        workspaceMock.verify();
        commandExecutorMock.verify();
    });
    it("run BAS command and return STRING result", async () => {
        const context = {
            subscriptions: {
                push: () => { },
            },
        };
        workspaceInstance.initWorkspaceAPI(context);
        (0, chai_1.expect)(commandParmater).to.equal("project-api.command.run");
        commandExecutorMock
            .expects("execute")
            .withExactArgs("testCommand", "testProjectPath")
            .returns("testResult");
        const result = await callbackParmater("testCommand", "testProjectPath");
        (0, chai_1.expect)(result).to.match(/^testResult/);
    });
    it("run BAS command and return OBJECT result", async () => {
        const context = {
            subscriptions: {
                push: () => { },
            },
        };
        workspaceInstance.initWorkspaceAPI(context);
        (0, chai_1.expect)(commandParmater).equal("project-api.command.run");
        commandExecutorMock
            .expects("execute")
            .withExactArgs("testCommand", "testProjectPath")
            .returns({
            result: "Result is an object",
        });
        const result = await callbackParmater("testCommand", "testProjectPath");
        (0, chai_1.expect)(result).includes("Result is an object");
    });
    it("run BAS command and no return", async () => {
        const context = {
            subscriptions: {
                push: () => { },
            },
        };
        workspaceInstance.initWorkspaceAPI(context);
        (0, chai_1.expect)(commandParmater).to.equal("project-api.command.run");
        commandExecutorMock
            .expects("execute")
            .withExactArgs("testCommand", "testProjectPath");
        const result = await callbackParmater("testCommand", "testProjectPath");
        (0, chai_1.expect)(result.trim()).to.be.empty;
    });
    it("run BAS command and return unsupported type of result", async () => {
        const context = {
            subscriptions: {
                push: () => { },
            },
        };
        workspaceInstance.initWorkspaceAPI(context);
        (0, chai_1.expect)(commandParmater).equal("project-api.command.run");
        commandExecutorMock
            .expects("execute")
            .withExactArgs("testCommand", "testProjectPath")
            .returns(true);
        const result = await callbackParmater("testCommand", "testProjectPath");
        (0, chai_1.expect)(result).includes("boolean");
    });
    it("unsupported command", async () => {
        const context = {
            subscriptions: {
                push: () => { },
            },
        };
        workspaceInstance.initWorkspaceAPI(context);
        (0, chai_1.expect)(commandParmater).to.equal("project-api.command.run");
        commandExecutorMock
            .expects("execute")
            .withExactArgs("unsupportedCommand", "testProjectPath")
            .throws(new Error("Unsupported command"));
        const result = await callbackParmater("unsupportedCommand", "testProjectPath");
        (0, chai_1.expect)(result).includes("Unsupported command");
    });
});
//# sourceMappingURL=workspace-instance.spec.js.map