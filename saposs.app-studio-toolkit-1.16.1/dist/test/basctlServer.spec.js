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
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const net_1 = __importDefault(require("net"));
const fs_1 = __importDefault(require("fs"));
const mockUtil_1 = require("./mockUtil");
const testVscode = {
    Uri: {
        parse: () => "",
    },
    workspace: {
        getConfiguration: () => "",
    },
    window: {
        showErrorMessage: () => Promise.reject(),
    },
};
const testSocket = {
    on: () => "",
    write: () => true,
};
const testServer = {
    listen: () => "",
    close: () => "",
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/performer.js");
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/actions/actionsFactory.js");
const performer = __importStar(require("../src/actions/performer"));
const actionsFactory = __importStar(require("../src/actions/actionsFactory"));
const basctlServer_1 = require("../src/basctlServer/basctlServer");
describe("basctlServer", () => {
    let sandbox;
    let performerMock;
    let actionsFactoryMock;
    let windowMock;
    let fsMock;
    let netMock;
    let socketMock;
    let serverMock;
    beforeEach(() => {
        sandbox = (0, sinon_1.createSandbox)();
        performerMock = sandbox.mock(performer);
        actionsFactoryMock = sandbox.mock(actionsFactory.ActionsFactory);
        windowMock = sandbox.mock(testVscode.window);
        fsMock = sandbox.mock(fs_1.default);
        netMock = sandbox.mock(net_1.default);
        socketMock = sandbox.mock(testSocket);
        serverMock = sandbox.mock(testServer);
    });
    afterEach(() => {
        setTimeout(() => {
            actionsFactoryMock.verify();
            performerMock.verify();
            windowMock.verify();
            fsMock.verify();
            netMock.verify();
            socketMock.verify();
            serverMock.verify();
            performerMock.verify();
            actionsFactoryMock.verify();
        }, 100);
        sandbox.restore();
    });
    it(`startBasctlServer socket exists, 
        unlink successfull, 
        listen successful, 
        handle request received valid JSON, 
        create action successful,
        perform action successful`, () => {
        mockIpc();
        (0, basctlServer_1.startBasctlServer)();
    });
    it(`startBasctlServer socket exists, 
        unlink successfull, 
        listen successful, 
        handle request received valid JSON, 
        create action successful,
        perform action fails`, () => {
        mockIpc({ performFails: true });
        (0, basctlServer_1.startBasctlServer)();
    });
    it(`startBasctlServer socket exists, 
        unlink successfull, 
        listen successful, 
        handle request received invalid JSON, 
        create action successful,
        perform action successful`, () => {
        mockIpc({ invalidJsonInBuffer: true });
        (0, basctlServer_1.startBasctlServer)();
    });
    it(`startBasctlServer socket exists, 
        unlink successfull, 
        listen fails`, () => {
        mockIpc({ socketInUse: true });
        (0, basctlServer_1.startBasctlServer)();
    });
    it(`startBasctlServer socket doesn't exist, 
        listen successful`, () => {
        mockIpc({ socketDoesNotExist: true });
        (0, basctlServer_1.startBasctlServer)();
    });
    it(`startBasctlServer socket exists, 
        unlink fails`, () => {
        mockIpc({ unlinkFails: true });
        (0, chai_1.expect)(() => (0, basctlServer_1.startBasctlServer)()).to.throw("Failed to unlink socket /extbin/basctlSocket:");
    });
    it("does nothing if server doesn't exist", () => {
        (0, basctlServer_1.closeBasctlServer)();
    });
    function mockIpc(options) {
        if (options && options.socketDoesNotExist) {
            fsMock.expects("stat").yields(new Error("Socket does not exist"));
        }
        else {
            fsMock.expects("stat").yields(undefined);
            if (options && options.unlinkFails) {
                fsMock.expects("unlink").yields(new Error("Socket is locked !"));
                return;
            }
            else {
                fsMock.expects("unlink").yields(undefined);
            }
        }
        netMock
            .expects("createServer")
            .yields(socketMock.object)
            .returns(serverMock.object);
        if (options && options.socketInUse) {
            serverMock
                .expects("listen")
                .withExactArgs("/extbin/basctlSocket")
                .throws(new Error("Socket already serving a server"));
            windowMock
                .expects("showErrorMessage")
                .withArgs((0, sinon_1.match)("Socket already serving a server"));
            return;
        }
        else {
            serverMock.expects("listen").withExactArgs("/extbin/basctlSocket");
        }
        let dataObject;
        dataObject = {
            actionType: "COMMAND",
            commandName: "dummy-command",
        };
        const actionObject = {
            name: "myAction",
        };
        const result = {
            status: "success",
        };
        if (options && options.invalidJsonInBuffer) {
            socketMock.expects("on").withArgs("data").yields("invalid json");
            windowMock
                .expects("showErrorMessage")
                .withArgs((0, sinon_1.match)("SyntaxError: Unexpected token i in JSON at position 0"));
            dataObject = {};
        }
        else {
            socketMock
                .expects("on")
                .withArgs("data")
                .yields(JSON.stringify(dataObject));
        }
        actionsFactoryMock
            .expects("createAction")
            .withExactArgs(dataObject)
            .returns(actionObject);
        if (options && options.performFails) {
            performerMock
                .expects("_performAction")
                .withExactArgs(actionObject)
                .throws(new Error("Perform failed !"));
            windowMock
                .expects("showErrorMessage")
                .withArgs((0, sinon_1.match)("Perform failed !"));
        }
        else {
            performerMock
                .expects("_performAction")
                .withExactArgs(actionObject)
                .returns(result);
            socketMock.expects("write").withExactArgs(JSON.stringify({ result }));
        }
    }
});
//# sourceMappingURL=basctlServer.spec.js.map