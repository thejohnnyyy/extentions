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
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../../src/devspace-manager/common/messages");
const sdk = __importStar(require("@sap/bas-sdk"));
const lodash_1 = require("lodash");
describe("devspace start/stop unit test", () => {
    let devspaceProxy;
    const proxyWindow = {
        showErrorMessage: () => {
            throw new Error("not implemented");
        },
        showInformationMessage: () => {
            throw new Error("not implemented");
        },
    };
    const proxyCommands = {
        executeCommand: () => {
            throw new Error("not implemented");
        },
    };
    const proxySdkDevSpace = {
        devspace: {
            updateDevSpace: () => {
                throw new Error("not implemented");
            },
            DevSpaceStatus: sdk.devspace.DevSpaceStatus,
            PackName: sdk.devspace.PackName,
        },
    };
    const proxyAuthUtils = {
        getJwt: () => {
            throw new Error(`not implemented`);
        },
    };
    const proxyLandscape = {
        autoRefresh: () => {
            throw new Error(`not implemented`);
        },
    };
    const proxyDevspace = {
        DevSpaceStatus: sdk.devspace.DevSpaceStatus,
        getDevSpaces: () => {
            throw new Error(`not implemented`);
        },
    };
    before(() => {
        devspaceProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/devspace/update", {
            vscode: {
                commands: proxyCommands,
                window: proxyWindow,
                "@noCallThru": true,
            },
            "@sap/bas-sdk": proxySdkDevSpace,
            "../../authentication/auth-utils": proxyAuthUtils,
            "../landscape/landscape": proxyLandscape,
            "./devspace": proxyDevspace,
        });
    });
    let mockAuthUtils;
    let mockSdkDevspace;
    let mockCommands;
    let mockWindow;
    let mockLandscape;
    let mockDevspace;
    beforeEach(() => {
        mockAuthUtils = (0, sinon_1.mock)(proxyAuthUtils);
        mockSdkDevspace = (0, sinon_1.mock)(proxySdkDevSpace.devspace);
        mockCommands = (0, sinon_1.mock)(proxyCommands);
        mockWindow = (0, sinon_1.mock)(proxyWindow);
        mockLandscape = (0, sinon_1.mock)(proxyLandscape);
        mockDevspace = (0, sinon_1.mock)(proxyDevspace);
    });
    afterEach(() => {
        mockAuthUtils.verify();
        mockSdkDevspace.verify();
        mockCommands.verify();
        mockWindow.verify();
        mockLandscape.verify();
        mockDevspace.verify();
    });
    const node = {
        label: `devspace.lable`,
        landscapeUrl: `https://my.landscape-1.com`,
        id: `ws-id`,
    };
    const jwt = `devscape-jwt`;
    const devspaces = [
        {
            devspaceDisplayName: `devspaceDisplayName-1`,
            devspaceOrigin: `devspaceOrigin`,
            pack: `pack-1`,
            packDisplayName: `packDisplayName-1`,
            url: `url`,
            id: `id`,
            optionalExtensions: `optionalExtensions`,
            technicalExtensions: `technicalExtensions`,
            status: sdk.devspace.DevSpaceStatus.STOPPED,
        },
        {
            devspaceDisplayName: `devspaceDisplayName-2`,
            devspaceOrigin: `devspaceOrigin`,
            pack: `pack-2`,
            packDisplayName: `packDisplayName-2`,
            url: `url-2`,
            id: `id-2`,
            optionalExtensions: `optionalExtensions`,
            technicalExtensions: `technicalExtensions`,
            status: sdk.devspace.DevSpaceStatus.RUNNING,
        },
    ];
    it("cmdDevSpaceStart, succedded", async () => {
        mockDevspace
            .expects(`getDevSpaces`)
            .withExactArgs(node.landscapeUrl)
            .resolves(devspaces);
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .resolves(jwt);
        mockSdkDevspace
            .expects(`updateDevSpace`)
            .withExactArgs(node.landscapeUrl, jwt, node.id, {
            Suspended: false,
            WorkspaceDisplayName: node.label,
        })
            .resolves();
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.info_devspace_state_updated(node.label, node.id, false))
            .resolves();
        mockLandscape.expects(`autoRefresh`).resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .returns(true);
        await devspaceProxy.cmdDevSpaceStart(node);
    });
    it("cmdDevSpaceStart, failed", async () => {
        const err = new Error(`error`);
        mockDevspace
            .expects(`getDevSpaces`)
            .withExactArgs(node.landscapeUrl)
            .resolves(devspaces);
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .rejects(err);
        mockWindow
            .expects(`showErrorMessage`)
            .withExactArgs(messages_1.messages.err_ws_update(node.id, err.toString()))
            .resolves();
        mockLandscape.expects(`autoRefresh`).never();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .returns(true);
        await devspaceProxy.cmdDevSpaceStart(node);
    });
    it("cmdDevSpaceStart, failure by 2 running devspaces restriction", async () => {
        const localDevspaces = (0, lodash_1.cloneDeep)(devspaces);
        localDevspaces[0].status = sdk.devspace.DevSpaceStatus.STARTING;
        mockDevspace
            .expects(`getDevSpaces`)
            .withExactArgs(node.landscapeUrl)
            .resolves(localDevspaces);
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.info_can_run_only_2_devspaces)
            .resolves();
        await devspaceProxy.cmdDevSpaceStart(node);
    });
    it("cmdDevSpaceStart, failure by other reason", async () => {
        mockDevspace
            .expects(`getDevSpaces`)
            .withExactArgs(node.landscapeUrl)
            .resolves();
        await devspaceProxy.cmdDevSpaceStart(node);
    });
    it("cmdDevSpaceStop, succedded", async () => {
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .resolves(jwt);
        mockSdkDevspace
            .expects(`updateDevSpace`)
            .withExactArgs(node.landscapeUrl, jwt, node.id, {
            Suspended: true,
            WorkspaceDisplayName: node.label,
        })
            .resolves();
        mockWindow
            .expects(`showInformationMessage`)
            .withExactArgs(messages_1.messages.info_devspace_state_updated(node.label, node.id, true))
            .resolves();
        mockLandscape.expects(`autoRefresh`).resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .returns(true);
        await devspaceProxy.cmdDevSpaceStop(node);
    });
    it("cmdDevSpaceStop, failed", async () => {
        const err = new Error(`error`);
        mockAuthUtils
            .expects(`getJwt`)
            .withExactArgs(node.landscapeUrl)
            .rejects(err);
        mockWindow
            .expects(`showErrorMessage`)
            .withExactArgs(messages_1.messages.err_ws_update(node.id, err.toString()))
            .resolves();
        mockCommands
            .expects(`executeCommand`)
            .withExactArgs("local-extension.tree.refresh")
            .returns(true);
        await devspaceProxy.cmdDevSpaceStop(node);
    });
});
//# sourceMappingURL=update.spec.js.map