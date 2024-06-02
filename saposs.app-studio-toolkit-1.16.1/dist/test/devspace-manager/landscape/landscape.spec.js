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
const sinon_1 = require("sinon");
const mockUtil_1 = require("../../../test/mockUtil");
var localConfigurationTarget;
(function (localConfigurationTarget) {
    localConfigurationTarget[localConfigurationTarget["Global"] = 1] = "Global";
    localConfigurationTarget[localConfigurationTarget["Workspace"] = 2] = "Workspace";
    localConfigurationTarget[localConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
})(localConfigurationTarget || (localConfigurationTarget = {}));
let lands = [];
const wsConfig = {
    get: (key) => key === "sap-remote.landscape-name" ? lands === null || lands === void 0 ? void 0 : lands.join(",") : undefined,
    update: (key, value, target) => {
        if (key === "sap-remote.landscape-name" &&
            target === localConfigurationTarget.Global) {
            lands = value.split(",");
        }
        return Promise.resolve();
    },
};
const testVscode = {
    workspace: {
        getConfiguration: () => wsConfig,
    },
    commands: {
        executeCommand: () => {
            throw new Error(`not implemented`);
        },
    },
    ConfigurationTarget: localConfigurationTarget,
    authentication: {
        getSession: () => {
            throw new Error(`not implemented`);
        },
    },
};
(0, mockUtil_1.mockVscode)(testVscode, "dist/src/devspace-manager/landscape/landscape.js");
const land = __importStar(require("../../../src/devspace-manager/landscape/landscape"));
const authProvider_1 = require("../../../src/authentication/authProvider");
const assert_1 = require("assert");
const node_url_1 = require("node:url");
describe("landscapes unit test", () => {
    let mockCommands;
    let mockAuthentication;
    beforeEach(() => {
        mockCommands = (0, sinon_1.mock)(testVscode.commands);
        mockAuthentication = (0, sinon_1.mock)(testVscode.authentication);
        lands = [];
    });
    afterEach(() => {
        mockCommands.verify();
        mockAuthentication.verify();
    });
    const landscapeUrl1 = "https://my.landscape-1.com";
    const landscapeUrl2 = "https://my.landscape-2.com";
    it("getLandscapes, config not exists", async () => {
        lands = undefined;
        (0, chai_1.expect)(await land.getLandscapes()).be.deep.equal([]);
    });
    it("getLandscapes, no items defined", async () => {
        (0, chai_1.expect)(await land.getLandscapes()).be.deep.equal([]);
    });
    it("getLandscapes, few items defined", async () => {
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl1);
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl2);
        const landscapes = [
            {
                name: new node_url_1.URL(landscapeUrl1).hostname,
                url: new node_url_1.URL(landscapeUrl1).toString(),
                isLoggedIn: false,
            },
            {
                name: new node_url_1.URL(landscapeUrl2).hostname,
                url: new node_url_1.URL(landscapeUrl2).toString(),
                isLoggedIn: false,
            },
        ];
        (0, chai_1.expect)(await land.getLandscapes()).be.deep.equal(landscapes);
    });
    it("removeLandscape, successful", async () => {
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl1);
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl2);
        await land.removeLandscape(landscapeUrl1);
        (0, chai_1.expect)(lands).be.deep.equal([new node_url_1.URL(landscapeUrl2).toString()]);
    });
    it("removeLandscape, only one item exists", async () => {
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl1);
        await land.removeLandscape(landscapeUrl1);
        (0, chai_1.expect)(lands).be.deep.equal([""]);
    });
    it("removeLandscape, the require item not exists, result not changed", async () => {
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl1);
        await land.removeLandscape(landscapeUrl2);
        (0, chai_1.expect)(lands).be.deep.equal([landscapeUrl1]);
    });
    it("removeLandscape, no config detected", async () => {
        lands = undefined;
        await land.removeLandscape(landscapeUrl1);
        (0, chai_1.expect)(lands).be.undefined;
    });
    it("autoRefresh, landscapes empty", () => {
        lands = undefined;
        mockCommands.expects(`executeCommand`).never();
        land.autoRefresh();
    });
    it("autoRefresh, landscapes exist", (done) => {
        lands === null || lands === void 0 ? void 0 : lands.push(landscapeUrl2);
        mockCommands
            .expects(`executeCommand`)
            .atLeast(3)
            .withExactArgs("local-extension.tree.refresh");
        land.autoRefresh(100, 350);
        setTimeout(() => done(), 500);
    });
    it("autoRefresh, exception thrown", (done) => {
        lands === null || lands === void 0 ? void 0 : lands.push(`ttt:\\wrong..pattern`);
        land.autoRefresh(100, 200);
        setTimeout(() => done(), 500);
    });
    describe("cmdLoginToLandscape scope", () => {
        const landscape = `http://my.landscape.test`;
        const node = {
            url: landscape,
        };
        it("cmdLoginToLandscape - session not exists", async () => {
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`local-extension.tree.refresh`)
                .resolves();
            mockAuthentication
                .expects(`getSession`)
                .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape], {
                forceNewSession: true,
            })
                .resolves();
            await land.cmdLoginToLandscape(node);
        });
        it("cmdLoginToLandscape - token not exists", async () => {
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`local-extension.tree.refresh`)
                .resolves();
            mockAuthentication
                .expects(`getSession`)
                .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape], {
                forceNewSession: true,
            })
                .resolves({});
            await land.cmdLoginToLandscape(node);
        });
        it("cmdLoginToLandscape - wrong token specified", async () => {
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`local-extension.tree.refresh`)
                .resolves();
            mockAuthentication
                .expects(`getSession`)
                .resolves({ accessToken: `token` });
            try {
                await land.cmdLoginToLandscape(node);
                (0, assert_1.fail)("should fail due to fake token parsing");
            }
            catch (e) {
                // nothing to do
            }
        });
    });
});
//# sourceMappingURL=landscape.spec.js.map