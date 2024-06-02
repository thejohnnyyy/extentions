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
let registry;
const testVscode = {
    commands: {
        registerCommand: (command, handler) => {
            registry.set(command, handler);
        },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/extension.js");
const extension = __importStar(require("../src/extension"));
const logger = __importStar(require("../src/logger/logger"));
const lodash_1 = require("lodash");
describe("extension unit test", () => {
    let sandbox;
    let commandsMock;
    let loggerMock;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    after(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        registry = new Map();
        commandsMock = sandbox.mock(testVscode.commands);
        loggerMock = sandbox.mock(logger);
    });
    afterEach(() => {
        commandsMock.verify();
        loggerMock.verify();
    });
    describe("package definitions", () => {
        let packageJson;
        before(() => {
            packageJson = require("../../package.json");
        });
        it("extension pack definition verifing", () => {
            (0, chai_1.expect)((0, lodash_1.xor)(packageJson.extensionDependencies, ["ms-vscode-remote.remote-ssh"])).to.be.empty;
        });
        it("extension kind definition verifing", () => {
            (0, chai_1.expect)((0, lodash_1.xor)(packageJson.extensionKind, ["ui"])).to.be.empty;
        });
        it("commands are unavailable via command palette", () => {
            packageJson.contributes.menus.commandPalette.forEach((command) => {
                (0, chai_1.expect)(command).to.haveOwnProperty("when").to.be.equal("false");
            });
        });
    });
    describe("activate", () => {
        const context = {
            subscriptions: {
                push: () => { },
            },
        };
        it("verifying registered commands", () => {
            loggerMock.expects("initLogger").withExactArgs(context);
            extension.activate(context);
            (0, chai_1.expect)((0, lodash_1.xor)([...registry.keys()], [
                `remote-access.dev-space.connect-new-window`,
                `remote-access.dev-space.clean-devspace-config`,
                `remote-access.close-tunnel`,
            ])).to.be.empty;
        });
    });
    it("deactivate", () => {
        extension.deactivate();
    });
});
//# sourceMappingURL=extension.spec.js.map