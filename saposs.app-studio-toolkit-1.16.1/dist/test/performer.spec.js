"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const constants_1 = require("../src/constants");
const mockUtil_1 = require("./mockUtil");
const testVscode = {
    commands: { executeCommand: () => "" },
    ViewColumn: {
        One: 1,
        Two: 2,
    },
    window: {},
    Uri: {
        parse: (path, strict) => {
            const parts = path.split("://");
            return { scheme: parts[0], fsPath: parts[1] };
        },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/actionsFactory.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/performer.js");
const performer_1 = require("../src/actions/performer");
const vscode_1 = require("vscode");
const actionsFactory_1 = require("../src/actions/actionsFactory");
describe("performer test", () => {
    let sandbox;
    let commandsMock;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        commandsMock = sandbox.mock(testVscode.commands);
    });
    afterEach(() => {
        commandsMock.verify();
    });
    describe("commandAction", () => {
        it("is successful with params when executeCommand is fulfilled", async () => {
            const commAction = {
                actionType: constants_1.COMMAND,
                name: "commandName",
                params: ["param1", "param2"],
            };
            commandsMock
                .expects("executeCommand")
                .withArgs(commAction.name, "param1", "param2")
                .resolves("success");
            (0, chai_1.expect)(await (0, performer_1._performAction)(commAction)).to.be.equal("success");
        });
        it("is successful without params when executeCommand is fulfilled", async () => {
            const commAction = {
                actionType: constants_1.COMMAND,
                name: "commandName",
            };
            commandsMock
                .expects("executeCommand")
                .withExactArgs(commAction.name)
                .resolves("success");
            (0, chai_1.expect)(await (0, performer_1._performAction)(commAction)).to.be.equal("success");
        });
        it("is successful without params when executeCommand is rejected", async () => {
            const commAction = {
                actionType: constants_1.COMMAND,
                name: "commandName",
                params: ["param1", "param2"],
            };
            commandsMock
                .expects("executeCommand")
                .withArgs(commAction.name, "param1", "param2")
                .rejects(new Error("Failure"));
            await (0, chai_1.expect)((0, performer_1._performAction)(commAction)).to.be.rejectedWith("Failure");
        });
    });
    describe("executeAction", () => {
        it("is successful with params", async () => {
            const execAction = {
                actionType: constants_1.EXECUTE,
                executeAction: () => vscode_1.window.showErrorMessage(`Hello from ExecuteAction`),
                params: ["param1", "param2"],
            };
            const executeActionMock = sandbox.mock(execAction);
            executeActionMock
                .expects("executeAction")
                .withExactArgs(execAction.params)
                .returns("success");
            (0, chai_1.expect)(await (0, performer_1._performAction)(execAction)).to.be.equal("success");
            executeActionMock.verify();
        });
    });
    describe("fileAction", () => {
        it("is fulfilled if executeCommand is fulfilled", async () => {
            const fileJson = {
                actionType: "FILE",
                uri: "file:///home/user/projects/myproj/sourcefile.js",
            };
            const fileAction = actionsFactory_1.ActionsFactory.createAction(fileJson);
            commandsMock
                .expects("executeCommand")
                .withExactArgs("vscode.open", fileAction.uri, {});
            // check that no error is thrown
            await (0, performer_1._performAction)(fileAction);
        });
        it("is rejected if executeCommand rejects", async () => {
            sandbox.stub(testVscode, "window").value({ activeTextEditor: {} });
            const fileJson = {
                actionType: "FILE",
                uri: "file:///home/user/projects/myproj/sourcefile.js",
            };
            const fileAction = actionsFactory_1.ActionsFactory.createAction(fileJson);
            commandsMock
                .expects("executeCommand")
                .withExactArgs("vscode.open", fileAction.uri, { viewColumn: undefined })
                .rejects(new Error("Something bad happened"));
            await (0, chai_1.expect)((0, performer_1._performAction)(fileAction)).to.be.rejectedWith("Something bad happened");
        });
        it("is fulfilled if executeCommand with 'external link' scheme is fulfilled", async () => {
            const fileJson = {
                actionType: "FILE",
                uri: "http:///home/user/projects/myproj/sourcefile.js",
            };
            const fileAction = actionsFactory_1.ActionsFactory.createAction(fileJson);
            commandsMock
                .expects("executeCommand")
                .withExactArgs("vscode.open", fileAction.uri);
            // check that no error is thrown
            await (0, performer_1._performAction)(fileAction);
        });
        it("is rejected if executeCommand  with 'external link' scheme rejects", async () => {
            const fileJson = {
                actionType: "FILE",
                uri: "https:///home/user/projects/myproj/sourcefile.js",
            };
            const fileAction = actionsFactory_1.ActionsFactory.createAction(fileJson);
            commandsMock
                .expects("executeCommand")
                .withExactArgs("vscode.open", fileAction.uri)
                .rejects(new Error("Something bad happened"));
            await (0, chai_1.expect)((0, performer_1._performAction)(fileAction)).to.be.rejectedWith("Something bad happened");
        });
    });
    describe("snippetAction", () => {
        it("is fulfilled if executeCommand is fulfilled", async () => {
            const snippetAction = {
                actionType: constants_1.SNIPPET,
                contributorId: "contributor1",
                snippetName: "mySnippet",
                context: { data: "myContext" },
                isNonInteractive: true,
            };
            commandsMock.expects("executeCommand").withExactArgs("loadCodeSnippet", {
                viewColumn: 2,
                contributorId: snippetAction.contributorId,
                snippetName: snippetAction.snippetName,
                context: snippetAction.context,
                isNonInteractive: snippetAction.isNonInteractive,
            });
            // check that no error is thrown
            await (0, performer_1._performAction)(snippetAction);
        });
        it("is rejected if executeCommand rejects", async () => {
            const snippetAction = {
                actionType: constants_1.SNIPPET,
                contributorId: "contributor1",
                snippetName: "mySnippet",
                context: { data: "myContext" },
            };
            commandsMock
                .expects("executeCommand")
                .withExactArgs("loadCodeSnippet", {
                viewColumn: 2,
                contributorId: snippetAction.contributorId,
                snippetName: snippetAction.snippetName,
                context: snippetAction.context,
                isNonInteractive: false,
            })
                .rejects(new Error("Something bad happened"));
            await (0, chai_1.expect)((0, performer_1._performAction)(snippetAction)).to.be.rejectedWith("Something bad happened");
        });
    });
    it("undefined action type is rejected", async () => {
        const action = {
            actionType: "unsupported",
        };
        const result = (0, performer_1._performAction)(action);
        await (0, chai_1.expect)(result).to.be.rejectedWith(`actionType is not supported`);
    });
    it("undefined action is rejected", async () => {
        await (0, chai_1.expect)((0, performer_1._performAction)(undefined)).to.be.rejectedWith(`Action is not provided`);
    });
});
//# sourceMappingURL=performer.spec.js.map