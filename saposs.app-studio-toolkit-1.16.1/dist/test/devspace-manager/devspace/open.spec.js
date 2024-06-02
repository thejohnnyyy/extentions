"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const assert_1 = require("assert");
const chai_1 = require("chai");
describe("cmdDevSpaceOpen unit test", () => {
    let devspaceOpenProxy;
    const proxyEnv = {
        openExternal: () => {
            throw new Error("not implemented");
        },
    };
    const proxyUri = {
        parse: () => {
            throw new Error("not implemented");
        },
    };
    let sandbox;
    before(() => {
        devspaceOpenProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/open", {
            vscode: {
                env: proxyEnv,
                Uri: proxyUri,
                "@noCallThru": true,
            },
        });
        sandbox = (0, sinon_1.createSandbox)();
    });
    let mockUri;
    let mockEnv;
    beforeEach(() => {
        mockUri = (0, sinon_1.mock)(proxyUri);
        mockEnv = (0, sinon_1.mock)(proxyEnv);
    });
    afterEach(() => {
        sandbox.restore();
        mockUri.verify();
        mockEnv.verify();
    });
    const landscape = `https://my.test.landscape-1.com`;
    const wsId = `test-abcd-id`;
    it("cmdOpenInVSCode, succedded", () => {
        sandbox.stub(process, `env`).value({
            H2O_URL: landscape,
            WORKSPACE_ID: wsId,
        });
        mockUri
            .expects(`parse`)
            .withExactArgs(`vscode://SAPOSS.app-studio-toolkit/open?landscape=my.test.landscape-1.com&devspaceid=abcd-id`)
            .returns({});
        mockEnv.expects(`openExternal`).resolves();
        devspaceOpenProxy.cmdOpenInVSCode();
    });
    it("cmdOpenInVSCode, H2O_URL is undefined", () => {
        sandbox.stub(process, `env`).value({});
        try {
            devspaceOpenProxy.cmdOpenInVSCode();
            (0, assert_1.fail)(`should fail`);
        }
        catch (e) {
            (0, chai_1.expect)(e.message.startsWith(`Invalid URL`)).to.be.true;
        }
    });
    it("cmdOpenInVSCode, H2O_URL is incorrect format", () => {
        sandbox.stub(process, `env`).value({
            H2O_URL: `my.lanscape.com`,
        });
        try {
            devspaceOpenProxy.cmdOpenInVSCode();
            (0, assert_1.fail)(`should fail`);
        }
        catch (e) {
            (0, chai_1.expect)(e.message.startsWith(`Invalid URL`)).to.be.true;
        }
    });
    it("cmdOpenInVSCode, WORKSPACE_ID is incorrect", () => {
        sandbox.stub(process, `env`).value({
            H2O_URL: landscape,
            WORKSPACE_ID: `abcd-1234`,
        });
        mockUri
            .expects(`parse`)
            .withExactArgs(`vscode://SAPOSS.app-studio-toolkit/open?landscape=my.test.landscape-1.com&devspaceid=1234`)
            .returns({});
        mockEnv.expects(`openExternal`).resolves();
        devspaceOpenProxy.cmdOpenInVSCode();
    });
    it("cmdOpenInVSCode, WORKSPACE_ID is wrong format", () => {
        sandbox.stub(process, `env`).value({
            H2O_URL: landscape,
            WORKSPACE_ID: `test-abcd.1234`,
        });
        mockUri
            .expects(`parse`)
            .withExactArgs(`vscode://SAPOSS.app-studio-toolkit/open?landscape=my.test.landscape-1.com&devspaceid=abcd.1234`)
            .returns({});
        mockEnv.expects(`openExternal`).resolves();
        devspaceOpenProxy.cmdOpenInVSCode();
    });
    it("cmdOpenInVSCode, WORKSPACE_ID is undefined", () => {
        sandbox.stub(process, `env`).value({
            H2O_URL: landscape,
        });
        mockUri
            .expects(`parse`)
            .withExactArgs(`vscode://SAPOSS.app-studio-toolkit/open?landscape=my.test.landscape-1.com&devspaceid=`)
            .returns({});
        mockEnv.expects(`openExternal`).resolves();
        devspaceOpenProxy.cmdOpenInVSCode();
    });
});
//# sourceMappingURL=open.spec.js.map