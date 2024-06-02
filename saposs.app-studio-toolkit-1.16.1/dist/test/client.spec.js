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
const sinon_1 = require("sinon");
const mockUtil_1 = require("./mockUtil");
const testVscode = {
    ConfigurationTarget: {
        Workspace: 2,
    },
    workspace: {
        getConfiguration: () => "",
        onDidChangeWorkspaceFolders: () => { },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/client.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/performer.js");
const client_1 = require("../src/actions/client");
const performer = __importStar(require("../src/actions/performer"));
const constants_1 = require("../src/constants");
describe("client test", () => {
    let sandbox;
    let workspaceMock;
    let performerMock;
    let configMock;
    const config = {
        get: () => "",
        update: () => "",
    };
    const myAction = {
        actionType: constants_1.COMMAND,
        name: "myAction",
    };
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        performerMock = sandbox.mock(performer);
        workspaceMock = sandbox.mock(testVscode.workspace);
        configMock = sandbox.mock(config);
    });
    afterEach(() => {
        performerMock.verify();
        workspaceMock.verify();
        configMock.verify();
    });
    describe("perform action", () => {
        it("performs the action without schedule", async () => {
            performerMock.expects("_performAction").withExactArgs(myAction);
            await (0, client_1.performAction)(myAction);
        });
        it("schedules the action with schedule (existing action list, update successful)", async () => {
            const actions = [myAction, myAction];
            workspaceMock.expects("getConfiguration").returns(config);
            configMock.expects("get").withExactArgs("actions", []).returns(actions);
            configMock
                .expects("update")
                .withExactArgs("actions", [myAction, myAction, myAction], 2)
                .resolves();
            await (0, client_1.performAction)(myAction, { schedule: true });
        });
        it("schedules the action with schedule (empy action list, update successful)", async () => {
            workspaceMock.expects("getConfiguration").returns(config);
            configMock.expects("get").withExactArgs("actions", []).returns([]);
            configMock
                .expects("update")
                .withExactArgs("actions", [myAction], 2)
                .resolves();
            await (0, client_1.performAction)(myAction, { schedule: true });
        });
        it("schedules the action with schedule (existing action list, update rejected)", async () => {
            const actions = [myAction, myAction];
            workspaceMock.expects("getConfiguration").returns(config);
            configMock.expects("get").withExactArgs("actions", []).returns(actions);
            configMock
                .expects("update")
                .withExactArgs("actions", [myAction, myAction, myAction], 2)
                .rejects("Reasons!");
            await (0, client_1.performAction)(myAction, { schedule: true });
        });
    });
});
//# sourceMappingURL=client.spec.js.map