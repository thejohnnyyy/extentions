"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
describe("landscapes set unit test", () => {
    let lands = [];
    let cmdLandscapeSetProxy;
    const proxyWindow = {
        showInputBox: () => {
            throw new Error("not implemented");
        },
    };
    const proxyCommands = {
        executeCommand: () => {
            throw new Error("not implemented");
        },
    };
    const landscapeProxy = {
        getLanscapesConfig: () => {
            return lands;
        },
        updateLandscapesConfig: (other) => {
            lands = other;
        },
    };
    before(() => {
        cmdLandscapeSetProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/landscape/set", {
            "./landscape": landscapeProxy,
            vscode: {
                window: proxyWindow,
                commands: proxyCommands,
                "@noCallThru": true,
            },
        }).cmdLandscapeSet;
    });
    let mockCommands;
    let mockWindow;
    beforeEach(() => {
        mockCommands = (0, sinon_1.mock)(proxyCommands);
        mockWindow = (0, sinon_1.mock)(proxyWindow);
    });
    afterEach(() => {
        mockCommands.verify();
        mockWindow.verify();
        lands = [];
    });
    const landscape = `https://my.landscape-1.com`;
    it("cmdLandscapeSet, confirmed added", async () => {
        mockWindow.expects("showInputBox").returns(landscape);
        mockCommands
            .expects("executeCommand")
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        await cmdLandscapeSetProxy();
        (0, chai_1.expect)(lands.includes(landscape)).to.be.true;
        (0, chai_1.expect)(lands.length).to.be.equal(1);
    });
    it("cmdLandscapeSet, confirmed, existed", async () => {
        lands.push(landscape);
        mockWindow.expects("showInputBox").returns(landscape);
        mockCommands
            .expects("executeCommand")
            .withExactArgs("local-extension.tree.refresh")
            .resolves();
        await cmdLandscapeSetProxy();
        (0, chai_1.expect)(lands.includes(landscape)).to.be.true;
        (0, chai_1.expect)(lands.length).to.be.equal(1);
    });
    it("cmdLandscapeSet, canceled", async () => {
        mockWindow.expects("showInputBox").returns(undefined);
        mockCommands.expects("executeCommand").never();
        await cmdLandscapeSetProxy();
        (0, chai_1.expect)(lands.includes(landscape)).to.be.false;
    });
});
//# sourceMappingURL=set.spec.js.map