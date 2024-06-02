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
const proxyquire_1 = __importDefault(require("proxyquire"));
const treeItems_1 = require("../../../src/devspace-manager/tree/treeItems");
const messages_1 = require("../../../src/devspace-manager/common/messages");
const sdk = __importStar(require("@sap/bas-sdk"));
describe("devSpacesProvider unit test", () => {
    let devSpacesProviderProxy;
    class proxyTreeItem {
        constructor(label) {
            this.label = label;
        }
    }
    class proxyEventEmitter {
        constructor() {
            this.event = {};
        }
        fire() {
            throw new Error(`not implemented`);
        }
    }
    let proxyTreeItemCollapsibleState;
    (function (proxyTreeItemCollapsibleState) {
        proxyTreeItemCollapsibleState[proxyTreeItemCollapsibleState["None"] = 0] = "None";
        proxyTreeItemCollapsibleState[proxyTreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
        proxyTreeItemCollapsibleState[proxyTreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
    })(proxyTreeItemCollapsibleState || (proxyTreeItemCollapsibleState = {}));
    const proxyLandscape = {
        getLandscapes: () => {
            throw new Error(`not implemented`);
        },
    };
    before(() => {
        devSpacesProviderProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/tree/devSpacesProvider", {
            vscode: {
                TreeItem: proxyTreeItem,
                EventEmitter: proxyEventEmitter,
                TreeItemCollapsibleState: proxyTreeItemCollapsibleState,
                "@noCallThru": true,
            },
            "../landscape/landscape": proxyLandscape,
        }).DevSpaceDataProvider;
    });
    const path = `my/extension/path`;
    let instance;
    let mockLandscape;
    beforeEach(() => {
        instance = new devSpacesProviderProxy(path);
        mockLandscape = (0, sinon_1.mock)(proxyLandscape);
    });
    afterEach(() => {
        mockLandscape.verify();
    });
    const landscapes = [
        {
            name: `http://test-domain.landscape-1.com`,
            url: `http://test-domain.landscape-1.com/`,
            isLoggedIn: false,
        },
        {
            name: `http://test-domain.landscape-2.com`,
            url: `http://test-domain.landscape-2.com/`,
            isLoggedIn: true,
        },
    ];
    it("constructed structure", () => {
        (0, chai_1.expect)(instance[`loading`]).to.be.false;
        (0, chai_1.expect)(instance[`extensionPath`]).to.be.equal(path);
    });
    it("setLoading -> true", () => {
        instance.setLoading(true);
        (0, chai_1.expect)(instance[`loading`]).to.be.true;
    });
    it("setLoading -> false", () => {
        instance.setLoading(false);
        (0, chai_1.expect)(instance[`loading`]).to.be.false;
    });
    it("refresh", () => {
        const mockOnDidChangeTreeData = (0, sinon_1.mock)(instance.privateOnDidChangeTreeData);
        mockOnDidChangeTreeData
            .expects(`fire`)
            .withExactArgs(undefined)
            .returns(false);
        instance.refresh();
        mockOnDidChangeTreeData.verify();
    });
    it("getTreeItem", () => {
        const iconPath = (0, treeItems_1.getSvgIconPath)(instance[`extensionPath`], "landscape");
        const node = new treeItems_1.LandscapeNode(instance[`extensionPath`], `label`, proxyTreeItemCollapsibleState.None, iconPath, `parentName`, `tooltip`, `name`, `url`);
        (0, chai_1.expect)(instance.getTreeItem(node)).to.be.deep.equal(node);
    });
    it("getChildren, node not specified", async () => {
        mockLandscape.expects(`getLandscapes`).resolves(landscapes);
        const childrens = await instance.getChildren();
        (0, chai_1.expect)(childrens.length).to.be.equal(2);
        let item = childrens[0];
        (0, chai_1.expect)(item.label).to.be.equal(landscapes[0].name);
        (0, chai_1.expect)(item.collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.Expanded);
        (0, chai_1.expect)(item.tooltip).to.be.equal(`Not logged in`);
        (0, chai_1.expect)(item.name).to.be.equal(landscapes[0].name);
        (0, chai_1.expect)(item.url).to.be.equal(landscapes[0].url);
        (0, chai_1.expect)(item.contextValue).to.be.equal(`landscape-log-out`);
        item = childrens[1];
        (0, chai_1.expect)(item.label).to.be.equal(landscapes[1].name);
        (0, chai_1.expect)(item.collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.Expanded);
        (0, chai_1.expect)(item.tooltip).to.be.equal(`Logged in`);
        (0, chai_1.expect)(item.name).to.be.equal(landscapes[1].name);
        (0, chai_1.expect)(item.url).to.be.equal(landscapes[1].url);
        (0, chai_1.expect)(item.contextValue).to.be.equal(`landscape-log-in`);
    });
    it("getChildren, element not specified, loading mode is turned on", async () => {
        instance.setLoading(true);
        const children = await instance.getChildren();
        (0, chai_1.expect)(children.length).to.be.equal(1);
        (0, chai_1.expect)(children[0].collapsibleState).to.be.equal(proxyTreeItemCollapsibleState.None);
        (0, chai_1.expect)(children[0].label).to.be.equal(messages_1.messages.lbl_dev_space_explorer_loading);
    });
    it("getChildren, with specified element", async () => {
        instance.setLoading(false);
        const iconPath = (0, treeItems_1.getSvgIconPath)(instance[`extensionPath`], "devspace");
        const node = new treeItems_1.DevSpaceNode(`label`, proxyTreeItemCollapsibleState.Expanded, iconPath, `parentName`, `landscapeName`, `landscapeUrl`, `wsUrl`, `ws-id`, sdk.devspace.DevSpaceStatus.STOPPED);
        (0, chai_1.expect)(await instance.getChildren(node)).to.be.deep.equal([]);
    });
});
//# sourceMappingURL=devSpacesProvider.spec.js.map