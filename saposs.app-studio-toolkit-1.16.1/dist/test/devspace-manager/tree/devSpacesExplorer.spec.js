"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
describe("devSpacesExplorer unit test", () => {
    let devSpacesExplorerProxy;
    const proxyWindow = {
        createTreeView: () => {
            throw new Error("not implemented");
        },
    };
    class proxyTreeItem {
        constructor(label) {
            this.label = label;
        }
    }
    class proxyDevSpaceDataProvider {
        constructor(extensionPath) {
            this.extensionPath = extensionPath;
        }
        refresh() {
            throw new Error("not implemented");
        }
        setLoading() {
            throw new Error("not implemented");
        }
    }
    before(() => {
        devSpacesExplorerProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/tree/devSpacesExplorer", {
            vscode: {
                TreeItem: proxyTreeItem,
                window: proxyWindow,
                "@noCallThru": true,
            },
            "./devSpacesProvider": {
                DevSpaceDataProvider: proxyDevSpaceDataProvider,
            },
        }).DevSpacesExplorer;
    });
    let mockWindow;
    beforeEach(() => {
        mockWindow = (0, sinon_1.mock)(proxyWindow);
    });
    afterEach(() => {
        mockWindow.verify();
    });
    const proxyDevSpacesExplorerView = {
        data: {
            description: `dummy explorer view`,
        },
    };
    it("getDevSpacesExplorerProvider", () => {
        const path = `my/extension/path`;
        mockWindow
            .expects(`createTreeView`)
            .withArgs(`dev-spaces`)
            .returns(proxyDevSpacesExplorerView);
        const instance = new devSpacesExplorerProxy(path);
        (0, chai_1.expect)(instance.getDevSpacesExplorerProvider()[`extensionPath`]).to.be.equal(path);
    });
    it("getDevSpacesExplorerView", () => {
        mockWindow
            .expects(`createTreeView`)
            .withArgs(`dev-spaces`)
            .returns(proxyDevSpacesExplorerView);
        const instance = new devSpacesExplorerProxy(`my/extension/path`);
        (0, chai_1.expect)(instance.getDevSpacesExplorerView()).to.be.deep.equal(proxyDevSpacesExplorerView);
    });
    it("refreshTree", () => {
        mockWindow
            .expects(`createTreeView`)
            .withArgs(`dev-spaces`)
            .returns(proxyDevSpacesExplorerView);
        const instance = new devSpacesExplorerProxy(``);
        const provider = instance.getDevSpacesExplorerProvider();
        const mockProvider = (0, sinon_1.mock)(provider);
        mockProvider.expects(`refresh`).returns(true);
        instance.refreshTree();
        mockProvider.verify();
    });
    it("changeTreeToLoading", () => {
        mockWindow
            .expects(`createTreeView`)
            .withArgs(`dev-spaces`)
            .returns(proxyDevSpacesExplorerView);
        const instance = new devSpacesExplorerProxy(``);
        const provider = instance.getDevSpacesExplorerProvider();
        const mockProvider = (0, sinon_1.mock)(provider);
        mockProvider.expects(`setLoading`).withExactArgs(true).returns(true);
        mockProvider.expects(`refresh`).returns(true);
        instance.changeTreeToLoading();
        mockProvider.verify();
    });
    it("changeTreeToLoaded", () => {
        mockWindow
            .expects(`createTreeView`)
            .withArgs(`dev-spaces`)
            .returns(proxyDevSpacesExplorerView);
        const instance = new devSpacesExplorerProxy(``);
        const provider = instance.getDevSpacesExplorerProvider();
        const mockProvider = (0, sinon_1.mock)(provider);
        mockProvider.expects(`setLoading`).withExactArgs(false).returns(true);
        mockProvider.expects(`refresh`).returns(true);
        instance.changeTreeToLoaded();
        mockProvider.verify();
    });
});
//# sourceMappingURL=devSpacesExplorer.spec.js.map