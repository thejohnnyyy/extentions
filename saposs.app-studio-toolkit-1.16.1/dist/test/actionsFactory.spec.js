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
const testVscode = {
    Uri: { parse: () => "" },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/actionsFactory.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/impl.js");
const actionsFactory_1 = require("../src/actions/actionsFactory");
const impl_1 = require("../src/actions/impl");
const vscode_1 = require("vscode");
describe("actionsFactory test", () => {
    let sandbox;
    before(() => {
        sandbox = sinon.createSandbox();
    });
    after(() => {
        sandbox.restore();
    });
    describe("create command action", () => {
        it("suceeds with params", () => {
            const actionJson = {
                actionType: "COMMAND",
                commandName: "myCommand",
                commandParams: ["param1", "param2"],
            };
            const action = actionsFactory_1.ActionsFactory.createAction(actionJson);
            (0, chai_1.expect)(action.name).to.be.equal("myCommand");
            (0, chai_1.expect)(action.params).to.deep.equal([
                "param1",
                "param2",
            ]);
        });
        it("suceeds without params", () => {
            const actionJson = {
                actionType: "COMMAND",
                commandName: "myCommand",
            };
            const action = actionsFactory_1.ActionsFactory.createAction(actionJson);
            (0, chai_1.expect)(action.name).to.be.equal("myCommand");
            (0, chai_1.expect)(action.params).to.deep.equal([]);
        });
        it("fails without name", () => {
            const actionJson = {
                actionType: "COMMAND",
            };
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`commandName is missing for "COMMAND" actionType`);
        });
    });
    describe("create Snippet action", () => {
        it("suceeds with all the params", () => {
            const actionJson = {
                actionType: "SNIPPET",
                id: "id",
                snippetName: "name",
                contributorId: "contributorId",
                context: {},
                isNonInteractive: true,
            };
            const action = actionsFactory_1.ActionsFactory.createAction(actionJson);
            (0, chai_1.expect)(action.snippetName).to.be.equal("name");
            (0, chai_1.expect)(action.contributorId).to.deep.equal("contributorId");
        });
        it("suceeds with just the mandatory params", () => {
            const actionJson = {
                actionType: "SNIPPET",
                snippetName: "name",
                context: {},
                contributorId: "contributorId",
            };
            const action = actionsFactory_1.ActionsFactory.createAction(actionJson);
            (0, chai_1.expect)(action.snippetName).to.be.equal("name");
            (0, chai_1.expect)(action.contributorId).to.deep.equal("contributorId");
        });
        it("fails without snippetName", () => {
            const actionJson = {
                actionType: "SNIPPET",
                contributorId: "contributorId",
                context: {},
            };
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`snippetName is missing for "SNIPPET" actionType`);
        });
        it("fails without contributorId", () => {
            const actionJson = {
                actionType: "SNIPPET",
                snippetName: "name",
                context: {},
            };
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`contributorId is missing for "SNIPPET" actionType`);
        });
        it("fails without context", () => {
            const actionJson = {
                actionType: "SNIPPET",
                contributorId: "contributorId",
                snippetName: "name",
            };
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`context is missing for "SNIPPET" actionType`);
        });
    });
    describe("create File action", () => {
        let uriMock;
        beforeEach(() => {
            uriMock = sandbox.mock(testVscode.Uri);
        });
        afterEach(() => {
            uriMock.verify();
        });
        it("suceeds with uri, still with FILE actionType", () => {
            const myFileUri = "file:///usr/myFile";
            const actionJson = {
                actionType: "FILE",
                uri: myFileUri,
                id: "id",
            };
            uriMock.expects("parse").withExactArgs("");
            uriMock.expects("parse").withExactArgs(myFileUri, true);
            actionsFactory_1.ActionsFactory.createAction(actionJson);
        });
        it("suceeds with uri", () => {
            const myFileUri = "file:///usr/myFile";
            const actionJson = {
                actionType: "URI",
                uri: myFileUri,
                id: "id",
            };
            uriMock.expects("parse").withExactArgs("");
            uriMock.expects("parse").withExactArgs(myFileUri, true);
            actionsFactory_1.ActionsFactory.createAction(actionJson);
        });
        it("fails without uri", () => {
            const actionJson = {
                actionType: "URI",
            };
            uriMock.expects("parse").withExactArgs("");
            uriMock
                .expects("parse")
                .withExactArgs(undefined, true)
                .throws(new Error("Failed!"));
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`Failed to parse field uri: undefined for "URI" actionType: Failed!`);
        });
    });
    describe("create action fails", () => {
        it("when no action type defined", () => {
            const actionJson = {};
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`actionType is missing`);
        });
        it("when no unsupported action type used", () => {
            const actionJson = {
                actionType: "Unsupported",
            };
            (0, chai_1.expect)(() => actionsFactory_1.ActionsFactory.createAction(actionJson)).to.throw(`Action with type "Unsupported" could not be created from json file`);
        });
    });
    it("create executeAction", () => {
        const action = new impl_1.ExecuteAction();
        action.executeAction = () => vscode_1.window.showErrorMessage(`Hello from ExecuteAction`);
        (0, chai_1.expect)(action.actionType).to.equal("EXECUTE");
        (0, chai_1.expect)(action.params).to.deep.equal([]);
    });
});
//# sourceMappingURL=actionsFactory.spec.js.map