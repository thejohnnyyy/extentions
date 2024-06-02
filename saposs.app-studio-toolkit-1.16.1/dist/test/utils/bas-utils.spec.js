"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mockUtil_1 = require("../mockUtil");
const chai_1 = require("chai");
const sinon_1 = require("sinon");
var proxyExtensionKind;
(function (proxyExtensionKind) {
    proxyExtensionKind[proxyExtensionKind["UI"] = 1] = "UI";
    proxyExtensionKind[proxyExtensionKind["Workspace"] = 2] = "Workspace";
})(proxyExtensionKind || (proxyExtensionKind = {}));
const proxyEnv = {
    remoteName: undefined,
};
const proxyExtension = {
    getExtension: () => {
        throw new Error(`not implemented`);
    },
};
const proxyCommands = {
    executeCommand: () => {
        throw new Error(`not implemented`);
    },
};
const workspaceConfigurationMock = {
    update: () => "",
};
const testVscode = {
    extensions: proxyExtension,
    env: proxyEnv,
    ExtensionKind: proxyExtensionKind,
    commands: proxyCommands,
    ConfigurationTarget: {
        Global: 1,
    },
    workspace: {
        getConfiguration: () => workspaceConfigurationMock,
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/utils/bas-utils.js");
const bas_utils_1 = require("../../src/utils/bas-utils");
const bas_sdk_1 = require("@sap/bas-sdk");
describe("bas-utils unit test", () => {
    let sandbox;
    let mockExtension;
    let mockCommands;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
    });
    afterEach(() => {
        sandbox.restore();
    });
    beforeEach(() => {
        mockExtension = sandbox.mock(proxyExtension);
        mockCommands = sandbox.mock(proxyCommands);
    });
    afterEach(() => {
        mockExtension.verify();
        mockCommands.verify();
    });
    const landscape = `https://my-landscape.test.com`;
    describe("shouldRunCtlServer scope", () => {
        it("shouldRunCtlServer, running locally, process.env.WS_BASE_URL is undefined", () => {
            sandbox.stub(process, `env`).value({});
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.desktop)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.false;
        });
        it("shouldRunCtlServer, running through ssh-remote, process.env.WS_BASE_URL is defined", () => {
            sandbox.stub(process, `env`).value({ WS_BASE_URL: landscape });
            sandbox.stub(proxyEnv, `remoteName`).value(`ssh-remote`);
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.basRemote)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.true;
        });
        it("shouldRunCtlServer, running personal-edition", () => {
            const devspaceMock = sandbox.mock(bas_sdk_1.devspace);
            devspaceMock.expects(`getBasMode`).returns(`personal-edition`);
            sandbox.stub(process, `env`).value({ WS_BASE_URL: landscape });
            sandbox.stub(proxyEnv, `remoteName`).value(undefined);
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.desktop)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.true;
            devspaceMock.verify();
        });
        it("shouldRunCtlServer, running in BAS, extensionKind === 'Workspace'", () => {
            sandbox.stub(process, `env`).value({ WS_BASE_URL: landscape });
            sandbox.stub(proxyEnv, `remoteName`).value(landscape);
            mockExtension
                .expects(`getExtension`)
                .returns({ extensionKind: proxyExtensionKind.Workspace });
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.basWorkspace)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.true;
        });
        it("shouldRunCtlServer, running in BAS, extensionKind === 'UI'", () => {
            sandbox.stub(process, `env`).value({ WS_BASE_URL: landscape });
            sandbox.stub(proxyEnv, `remoteName`).value(landscape);
            mockExtension
                .expects(`getExtension`)
                .returns({ extensionKind: proxyExtensionKind.UI });
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.basUi)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.false;
        });
        it("shouldRunCtlServer, running in BAS, extension undefined", () => {
            sandbox.stub(process, `env`).value({ WS_BASE_URL: landscape });
            sandbox.stub(proxyEnv, `remoteName`).value(landscape);
            mockExtension.expects(`getExtension`).returns(undefined);
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.unexpected)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.false;
        });
        it("shouldRunCtlServer, running locally through WSL, extension undefined", () => {
            sandbox.stub(process, `env`).value({});
            sandbox.stub(proxyEnv, `remoteName`).value("wsl");
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.wsl)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.false;
        });
        it("shouldRunCtlServer, running locally through SSH, extension undefined", () => {
            sandbox.stub(process, `env`).value({});
            sandbox.stub(proxyEnv, `remoteName`).value("ssh-remote");
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`setContext`, `ext.runPlatform`, bas_utils_1.ExtensionRunMode.unexpected)
                .resolves();
            (0, chai_1.expect)((0, bas_utils_1.shouldRunCtlServer)()).to.be.false;
        });
    });
});
//# sourceMappingURL=bas-utils.spec.js.map