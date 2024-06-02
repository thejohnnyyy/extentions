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
const assert_1 = require("assert");
const chai_1 = require("chai");
const path = __importStar(require("path"));
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../../src/devspace-manager/common/messages");
const lodash_1 = require("lodash");
const sdk = __importStar(require("@sap/bas-sdk"));
describe("devSpacesExplorer unit test", () => {
    let treeItemsProxy;
    class proxyTreeItem {
        constructor(label) {
            this.label = label;
        }
    }
    let proxyTreeItemCollapsibleState;
    (function (proxyTreeItemCollapsibleState) {
        proxyTreeItemCollapsibleState[proxyTreeItemCollapsibleState["None"] = 0] = "None";
        proxyTreeItemCollapsibleState[proxyTreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        proxyTreeItemCollapsibleState[proxyTreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(proxyTreeItemCollapsibleState || (proxyTreeItemCollapsibleState = {}));
    const proxyDevspace = {
        DevSpaceStatus: sdk.devspace.DevSpaceStatus,
        getDevSpaces: () => {
            throw new Error(`not implemented`);
        },
        PackName: sdk.devspace.PackName,
    };
    before(() => {
        treeItemsProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/tree/treeItems", {
            vscode: {
                TreeItem: proxyTreeItem,
                TreeItemCollapsibleState: proxyTreeItemCollapsibleState,
                "@noCallThru": true,
            },
            "../devspace/devspace": proxyDevspace,
        });
    });
    const extPath = path.join("my", "extension", "path");
    const testLabel = `test-label`;
    const testName = `test-name`;
    const testParentName = `test-parent-name`;
    const testLandscapeName = `landscapeName`;
    const testLandscapeUrl = `landscapeUrl/`;
    const testWsUrl = `devspace/url/`;
    const testWsId = `ws-id`;
    const testContextValue = `context-value`;
    const testTooltip = `tooltip`;
    const testDescription = `description`;
    let node;
    it("getSvgIconPath - supported icon", () => {
        const iconPath = treeItemsProxy.getSvgIconPath(extPath, `basic_error`);
        (0, chai_1.expect)(iconPath.hasOwnProperty(`light`)).to.be.true;
        (0, chai_1.expect)(iconPath.light.includes(extPath)).to.be.true;
        (0, chai_1.expect)(iconPath.hasOwnProperty(`dark`)).to.be.true;
        (0, chai_1.expect)(iconPath.dark.includes(extPath))
            .to.be.true;
    });
    it("getSvgIconPath - missed icon", () => {
        (0, chai_1.expect)(treeItemsProxy.getSvgIconPath(extPath, `unsupported`)).to.be.empty;
    });
    describe(`EmptyNode scope`, () => {
        beforeEach(() => {
            node = new treeItemsProxy.EmptyNode(testLabel);
        });
        it("EmptyNode", () => {
            (0, chai_1.expect)(node.label).to.be.equal(testLabel);
            (0, chai_1.expect)(node.collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.None);
            (0, chai_1.expect)(node.iconPath).to.be.empty;
            (0, chai_1.expect)(node.parentName).to.be.empty;
        });
        it("getChildren", async () => {
            (0, chai_1.expect)(await node.getChildren()).to.be.deep.equal([]);
        });
    });
    describe(`LoadingNode scope`, () => {
        beforeEach(() => {
            node = new treeItemsProxy.LoadingNode();
        });
        it("LoadingNode", () => {
            (0, chai_1.expect)(node.label).to.be.equal(messages_1.messages.lbl_dev_space_explorer_loading);
            (0, chai_1.expect)(node.collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.None);
            (0, chai_1.expect)(node.iconPath).to.be.empty;
            (0, chai_1.expect)(node.parentName).to.be.empty;
        });
        it("getChildren", async () => {
            (0, chai_1.expect)(await node.getChildren()).to.be.deep.equal([]);
        });
    });
    describe(`DevSpaceNode scope`, () => {
        let iconPath;
        beforeEach(() => {
            iconPath = treeItemsProxy.getSvgIconPath(extPath, `basic_not_running`);
            node = new treeItemsProxy.DevSpaceNode(testLabel, proxyTreeItemCollapsibleState.Collapsed, iconPath, testParentName, testLandscapeName, testLandscapeUrl, testWsUrl, testWsId, sdk.devspace.DevSpaceStatus.RUNNING, testContextValue, testTooltip, testDescription);
        });
        it("DevSpaceNode", () => {
            (0, chai_1.expect)(node.label).to.be.equal(testLabel);
            (0, chai_1.expect)(node.collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.Collapsed);
            (0, chai_1.expect)(node.iconPath).to.be.deep.equal(iconPath);
            (0, chai_1.expect)(node.parentName).to.be.equal(testParentName);
            (0, chai_1.expect)(node.landscapeName).to.be.equal(testLandscapeName);
            (0, chai_1.expect)(node.landscapeUrl).to.be.equal(testLandscapeUrl);
            (0, chai_1.expect)(node.wsUrl).to.be.equal(testWsUrl);
            (0, chai_1.expect)(node.id).to.be.equal(testWsId);
            (0, chai_1.expect)(node.status).to.be.equal(sdk.devspace.DevSpaceStatus.RUNNING);
            (0, chai_1.expect)(node.contextValue).to.be.equal(testContextValue);
            (0, chai_1.expect)(node.tooltip).to.be.equal(testTooltip);
            (0, chai_1.expect)(node.description).to.be.equal(testDescription);
        });
        it("getChildren", async () => {
            (0, chai_1.expect)(await node.getChildren()).to.be.deep.equal([]);
        });
    });
    describe(`LandscapeNode scope`, () => {
        let iconPath;
        let mockDevspace;
        beforeEach(() => {
            mockDevspace = (0, sinon_1.mock)(proxyDevspace);
            iconPath = treeItemsProxy.getSvgIconPath(extPath, `sme_not_running`);
            node = new treeItemsProxy.LandscapeNode(extPath, testLabel, proxyTreeItemCollapsibleState.Collapsed, iconPath, testParentName, testTooltip, testName, testLandscapeUrl, testContextValue);
        });
        afterEach(() => {
            mockDevspace.verify();
        });
        const devspaces = [
            {
                devspaceDisplayName: `devspaceDisplayName-1`,
                devspaceOrigin: `devspaceOrigin`,
                pack: `SAP Hana`,
                packDisplayName: `packDisplayName-1`,
                url: `url`,
                id: `id`,
                optionalExtensions: `optionalExtensions`,
                technicalExtensions: `technicalExtensions`,
                status: `SAFE_MODE`,
            },
            {
                devspaceDisplayName: `devspaceDisplayName-2`,
                devspaceOrigin: `devspaceOrigin`,
                pack: `SAP SME Business Application`,
                packDisplayName: `packDisplayName-2`,
                url: `url-2`,
                id: `id-2`,
                optionalExtensions: `optionalExtensions`,
                technicalExtensions: `technicalExtensions`,
                status: `STARTING`,
            },
        ];
        it("LandscapeNode", () => {
            (0, chai_1.expect)(node.label).to.be.equal(testLabel);
            (0, chai_1.expect)(node.collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.Collapsed);
            (0, chai_1.expect)(node.iconPath).to.be.deep.equal(iconPath);
            (0, chai_1.expect)(node.parentName).to.be.equal(testParentName);
            (0, chai_1.expect)(node.tooltip).to.be.equal(testTooltip);
            (0, chai_1.expect)(node.name).to.be.equal(testName);
            (0, chai_1.expect)(node.url).to.be.equal(testLandscapeUrl);
            (0, chai_1.expect)(node.contextValue).to.be.equal(testContextValue);
        });
        it("getChildren, log out", async () => {
            const item = (0, lodash_1.cloneDeep)(node);
            delete item.contextValue;
            const children = await node.getChildren(item);
            (0, chai_1.expect)(children.length).to.be.equal(1);
            (0, chai_1.expect)(children[0].label).to.be.equal(messages_1.messages.lbl_dev_space_explorer_authentication_failure);
        });
        it("getChildren, log in, no children", async () => {
            mockDevspace.expects(`getDevSpaces`).withExactArgs(node.url).resolves([]);
            const item = (0, lodash_1.cloneDeep)(node);
            item.contextValue = `log-in`;
            const children = await node.getChildren(item);
            (0, chai_1.expect)(children.length).to.be.equal(1);
            (0, chai_1.expect)(children[0].label).to.be.equal(messages_1.messages.lbl_dev_space_explorer_no_dev_spaces);
        });
        it("getChildren, log in, there are children", async () => {
            mockDevspace
                .expects(`getDevSpaces`)
                .withExactArgs(node.url)
                .resolves(devspaces);
            const item = (0, lodash_1.cloneDeep)(node);
            item.contextValue = `log-in`;
            (0, chai_1.expect)((await node.getChildren(item)).length).to.be.equal(2);
        });
        it("getChildren, log in, there are children, node's attributes partly defined", async () => {
            mockDevspace
                .expects(`getDevSpaces`)
                .withExactArgs(node.url)
                .resolves(devspaces);
            const item = (0, lodash_1.cloneDeep)(node);
            item.contextValue = `log-in`;
            delete item.label;
            delete item.name;
            (0, chai_1.expect)((await node.getChildren(item)).length).to.be.equal(2);
        });
        it("getLabel, STOPPED", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.STOPPED;
            (0, chai_1.expect)(node.getLabel(devspace)).to.be.equal(devspace.devspaceDisplayName);
        });
        it("getLabel, RUNNING", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.RUNNING;
            (0, chai_1.expect)(node.getLabel(devspace)).to.be.equal(devspace.devspaceDisplayName);
        });
        it("getLabel, transition", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.SAFE_MODE;
            (0, chai_1.expect)(node.getLabel(devspace)).to.be.equal(`${devspace.devspaceDisplayName} (${devspace.status.toLowerCase()})`);
        });
        it("getLabel, unreachable", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = `NOT DEFINED`;
            try {
                node.getLabel(devspace);
                (0, assert_1.fail)(`should fail`);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.be.equal(messages_1.messages.err_assert_unreachable);
            }
        });
        it("getIconPath, 'Basic', Running", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.pack = `Basic`;
            devspace.status = sdk.devspace.DevSpaceStatus.RUNNING;
            const iconPath = node.getIconPath(devspace);
            (0, chai_1.expect)(iconPath.hasOwnProperty(`dark`)).to.be.true;
            (0, chai_1.expect)(iconPath.hasOwnProperty(`light`)).to.be.true;
            (0, chai_1.expect)(path.parse(iconPath.dark).name.endsWith(`_running`)).to.be.true;
        });
        it("getIconPath, 'SAP Mobile Services', Stopped", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.pack = `SAP Mobile Services`;
            devspace.status = sdk.devspace.DevSpaceStatus.STOPPED;
            const iconPath = node.getIconPath(devspace);
            (0, chai_1.expect)(iconPath.hasOwnProperty(`dark`)).to.be.true;
            (0, chai_1.expect)(iconPath.hasOwnProperty(`light`)).to.be.true;
            (0, chai_1.expect)(path.parse(iconPath.dark).name.endsWith(`_not_running`)).to.be
                .true;
        });
        it("getIconPath, 'LCAP', Starting", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.pack = `LCAP`;
            devspace.status = sdk.devspace.DevSpaceStatus.STARTING;
            const iconPath = node.getIconPath(devspace);
            (0, chai_1.expect)(iconPath.hasOwnProperty(`dark`)).to.be.true;
            (0, chai_1.expect)(iconPath.hasOwnProperty(`light`)).to.be.true;
            (0, chai_1.expect)(path.parse(iconPath.dark).name.endsWith(`_transitioning`)).to.be
                .true;
        });
        it("getIconPath, 'SME', Starting", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.pack = `SAP SME Business Application`;
            devspace.status = sdk.devspace.DevSpaceStatus.ERROR;
            const iconPath = node.getIconPath(devspace);
            (0, chai_1.expect)(iconPath.hasOwnProperty(`dark`)).to.be.true;
            (0, chai_1.expect)(iconPath.hasOwnProperty(`light`)).to.be.true;
            (0, chai_1.expect)(path.parse(iconPath.dark).name.endsWith(`_error`)).to.be.true;
        });
        it("getIconPath, 'CAP', unreachable", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.pack = `SAP Cloud Business Application`;
            devspace.status = `Unreachable`;
            try {
                node.getIconPath(devspace);
                (0, assert_1.fail)(`should fail`);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.be.equal(messages_1.messages.err_assert_unreachable);
            }
        });
        it("getIconPath, 'Unknown', Running", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.pack = `SAP Unknown`;
            devspace.status = sdk.devspace.DevSpaceStatus.SAFE_MODE;
            const iconPath = node.getIconPath(devspace);
            (0, chai_1.expect)(iconPath.hasOwnProperty(`dark`)).to.be.true;
            (0, chai_1.expect)(iconPath.hasOwnProperty(`light`)).to.be.true;
            (0, chai_1.expect)(path
                .parse(iconPath.dark)
                .name.endsWith(messages_1.messages.lbl_devspace_status_error)).to.be.true;
        });
        it("getContextView, unreachable", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = `Unreachable`;
            try {
                node.getContextView(devspace);
                (0, assert_1.fail)(`should fail`);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.be.equal(messages_1.messages.err_assert_unreachable);
            }
        });
        it("getContextView, Running", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.RUNNING;
            (0, chai_1.expect)(node.getContextView(devspace)).to.be.equal(`dev-space-running`);
        });
        it("getContextView, Stopped", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.STOPPED;
            (0, chai_1.expect)(node.getContextView(devspace)).to.be.equal(`dev-space-stopped`);
        });
        it("getContextView, Starting/Stopping", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.STOPPING;
            (0, chai_1.expect)(node.getContextView(devspace)).to.be.equal(`dev-space-transitioning`);
        });
        it("getContextView, Safe/Error", () => {
            const devspace = (0, lodash_1.cloneDeep)(devspaces[0]);
            devspace.status = sdk.devspace.DevSpaceStatus.ERROR;
            (0, chai_1.expect)(node.getContextView(devspace)).to.be.equal(`dev-space-error`);
        });
    });
});
//# sourceMappingURL=treeItems.spec.js.map