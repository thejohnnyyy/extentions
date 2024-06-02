"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const proxyquire_1 = __importDefault(require("proxyquire"));
const node_url_1 = require("node:url");
const lodash_1 = require("lodash");
const messages_1 = require("../../../src/devspace-manager/common/messages");
const bas_sdk_1 = require("@sap/bas-sdk");
describe("basHandler scope", () => {
    const vscodeProxy = {
        Uri: {
            parse: () => {
                throw new Error(`not implemented`);
            },
        },
        window: {
            showErrorMessage: (m) => {
                throw new Error(`not implemented`);
            },
        },
        commands: {
            executeCommand: () => {
                throw new Error(`not implemented`);
            },
        },
        EventEmitter: class ProxyEventEmitter {
            constructor() { }
            fire() {
                throw new Error("not implemented");
            }
        },
    };
    let basHandlerProxy;
    const proxyLandscape = {
        cmdLoginToLandscape: () => {
            throw new Error(`not implemented`);
        },
        getLandscapes: () => {
            throw new Error(`not implemented`);
        },
    };
    const proxyLandscapeSet = {
        addLandscape: () => {
            throw new Error("not implemented");
        },
    };
    const proxyDevspaceConnect = {
        cmdDevSpaceConnectNewWindow: () => {
            throw new Error("not implemented");
        },
    };
    const proxyDevspaceUpdate = {
        cmdDevSpaceStart: () => {
            return;
        },
    };
    const proxyDevSpacesProvider = {
        getChildren: () => Promise.resolve([]),
    };
    const proxyNode = {
        getChildren: () => {
            throw new Error(`not implemented`);
        },
    };
    let handler;
    before(() => {
        basHandlerProxy = (0, proxyquire_1.default)("../../../src/devspace-manager/handler/basHandler", {
            vscode: {
                Uri: vscodeProxy.Uri,
                window: vscodeProxy.window,
                commands: vscodeProxy.commands,
                EventEmitter: vscodeProxy.EventEmitter,
                "@noCallThru": true,
            },
            "../landscape/landscape": proxyLandscape,
            "../landscape/set": proxyLandscapeSet,
            "../devspace/connect": proxyDevspaceConnect,
            "../devspace/update": proxyDevspaceUpdate,
        });
        handler = basHandlerProxy.getBasUriHandler(proxyDevSpacesProvider);
    });
    let mockLandscape;
    let mockDevSpaceProvider;
    let mockDevSpaceConnect;
    let mockDevSpaceUpdate;
    let mockLandscapeSet;
    let mockWindow;
    let mockCommands;
    beforeEach(() => {
        mockLandscape = (0, sinon_1.mock)(proxyLandscape);
        mockDevSpaceProvider = (0, sinon_1.mock)(proxyDevSpacesProvider);
        mockDevSpaceConnect = (0, sinon_1.mock)(proxyDevspaceConnect);
        mockDevSpaceUpdate = (0, sinon_1.mock)(proxyDevspaceUpdate);
        mockLandscapeSet = (0, sinon_1.mock)(proxyLandscapeSet);
        mockWindow = (0, sinon_1.mock)(vscodeProxy.window);
        mockCommands = (0, sinon_1.mock)(vscodeProxy.commands);
    });
    afterEach(() => {
        mockLandscape.verify();
        mockDevSpaceProvider.verify();
        mockDevSpaceConnect.verify();
        mockDevSpaceUpdate.verify();
        mockLandscapeSet.verify();
        mockWindow.verify();
        mockCommands.verify();
    });
    const landscapeUrl1 = `https://my.landscape-1.com`;
    const landscapeUrl2 = `https://my.landscape-2.com`;
    const workspaceid = `workspace-my-id1`;
    describe("handle open", () => {
        const uri = {
            path: `/open`,
            query: `landscape=${new node_url_1.URL(landscapeUrl1).hostname}&devspaceid=${workspaceid.split(`-`).slice(1).join(`-`)}`,
            toString: () => `uri:toString`,
        };
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
        const nodes = [
            Object.assign({
                contextValue: `log-in-node`,
                name: landscapes[0].name,
                uri: landscapes[0].url,
            }, proxyNode),
            Object.assign({
                name: landscapes[1].name,
                uri: landscapes[1].url,
            }, proxyNode),
        ];
        const devspaces = [
            {
                landscapeUrl: landscapeUrl1,
                id: `my-id1`,
                status: bas_sdk_1.devspace.DevSpaceStatus.RUNNING,
            },
            {
                landscapeUrl: landscapeUrl2,
                id: `my-id2`,
                status: bas_sdk_1.devspace.DevSpaceStatus.RUNNING,
            },
        ];
        it("handleUri, ok - no specific folder", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).resolves(nodes);
            const mockLandscapeNode = (0, sinon_1.mock)(nodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves(devspaces);
            mockDevSpaceConnect
                .expects(`cmdDevSpaceConnectNewWindow`)
                .withExactArgs(devspaces[0], undefined)
                .resolves();
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
        it("handleUri, uri path is unexpected", async () => {
            const wrongUri = (0, lodash_1.cloneDeep)(uri);
            wrongUri.path = `/run`;
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_url_has_incorrect_format(wrongUri.toString())));
            await handler.handleUri(wrongUri);
        });
        it("handleUri, url has wromg 'landscape' param", async () => {
            const wrongParamUri = (0, lodash_1.cloneDeep)(uri);
            wrongParamUri.query = `landcape=some-landscape.com&devspaceid=someid`;
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_url_param_missing(wrongParamUri.query, `landscape`)));
            await handler.handleUri(wrongParamUri);
        });
        it("handleUri, url has wromg 'landscape' param format", async () => {
            const wrongParamUri = (0, lodash_1.cloneDeep)(uri);
            wrongParamUri.query = `landscape:some-landscape.com&devspaceid=someid`;
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_url_param_missing(wrongParamUri.query, `landscape`)));
            await handler.handleUri(wrongParamUri);
        });
        it("handleUri, url has wromg 'devspaceid' param", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).resolves(nodes);
            const wrongParamUri = (0, lodash_1.cloneDeep)(uri);
            wrongParamUri.query = `landscape=${new node_url_1.URL(landscapeUrl1).hostname}&devspace=${workspaceid.split(`-`).slice(1).join(`-`)}`;
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_url_param_missing(wrongParamUri.query, `devspaceid`)));
            await handler.handleUri(wrongParamUri);
        });
        it("handleUri, landscape not exist, added", async () => {
            const landscapeUrl = `https://my.landscape-other.com`;
            const landscapeParam = new node_url_1.URL(landscapeUrl).hostname;
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            const fullLandscapes = (0, lodash_1.concat)(landscapes, {
                name: new node_url_1.URL(landscapeUrl).hostname,
                url: new node_url_1.URL(landscapeUrl).toString(),
                isLoggedIn: false,
            });
            mockLandscapeSet
                .expects(`addLandscape`)
                .withExactArgs(`https://${landscapeParam}`)
                .resolves(fullLandscapes);
            const fullNodes = (0, lodash_1.concat)(nodes, Object.assign({
                label: `label`,
                contextValue: `log-in-node`,
                name: fullLandscapes[2].name,
                uri: fullLandscapes[2].url,
            }, proxyNode));
            mockDevSpaceProvider.expects(`getChildren`).resolves(fullNodes);
            const mockLandscapeNode = (0, sinon_1.mock)(fullNodes[2]);
            mockLandscapeNode.expects(`getChildren`).resolves(devspaces);
            mockDevSpaceConnect
                .expects(`cmdDevSpaceConnectNewWindow`)
                .withExactArgs(devspaces[0], undefined)
                .resolves();
            const otherUri = (0, lodash_1.cloneDeep)(uri);
            otherUri.query = `landscape=${landscapeParam}&devspaceid=${workspaceid
                .split(`-`)
                .slice(1)
                .join(`-`)}`;
            mockCommands
                .expects("executeCommand")
                .withExactArgs("local-extension.tree.refresh");
            await handler.handleUri(otherUri);
            mockLandscapeNode.verify();
        });
        it("handleUri, landscape node not found", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            const missedNodes = (0, lodash_1.slice)(nodes, 1);
            mockDevSpaceProvider.expects(`getChildren`).resolves(missedNodes);
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_landscape_not_added(new node_url_1.URL(landscapeUrl1).hostname)));
            await handler.handleUri(uri);
        });
        it("handleUri, landscape is not log in", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            const copyNodes = (0, lodash_1.cloneDeep)(nodes);
            copyNodes[0].contextValue = `log-out-node`;
            mockLandscape
                .expects(`cmdLoginToLandscape`)
                .withExactArgs(copyNodes[0])
                .resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).twice().resolves(copyNodes);
            const mockLandscapeNode = (0, sinon_1.mock)(copyNodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves(devspaces);
            mockDevSpaceConnect
                .expects(`cmdDevSpaceConnectNewWindow`)
                .withExactArgs(devspaces[0], undefined)
                .resolves();
            mockCommands
                .expects("executeCommand")
                .withExactArgs("local-extension.tree.refresh");
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
        it("handleUri, landscape is not log in (contex value empty)", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            const copyNodes = (0, lodash_1.cloneDeep)(nodes);
            delete copyNodes[0].contextValue;
            mockLandscape
                .expects(`cmdLoginToLandscape`)
                .withExactArgs(copyNodes[0])
                .resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).twice().resolves(copyNodes);
            const mockLandscapeNode = (0, sinon_1.mock)(copyNodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves(devspaces);
            mockDevSpaceConnect
                .expects(`cmdDevSpaceConnectNewWindow`)
                .withExactArgs(devspaces[0], undefined)
                .resolves();
            mockCommands
                .expects("executeCommand")
                .withExactArgs("local-extension.tree.refresh");
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
        it("handleUri, landscape is empty (there are no devscapes)", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).resolves(nodes);
            const mockLandscapeNode = (0, sinon_1.mock)(nodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves([]);
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_no_devspaces_in_landscape(nodes[0].name)));
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
        it("handleUri, devspace not found", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).resolves(nodes);
            const mockLandscapeNode = (0, sinon_1.mock)(nodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves((0, lodash_1.slice)(devspaces, 1));
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_devspace_missing(workspaceid.split(`-`).slice(1).join(`-`))));
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
        it("handleUri, devspace stopped and starting it was successful", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).resolves(nodes);
            const clonedDevSpaces = (0, lodash_1.cloneDeep)(devspaces);
            clonedDevSpaces[0].status = bas_sdk_1.devspace.DevSpaceStatus.STOPPED;
            const mockLandscapeNode = (0, sinon_1.mock)(nodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves(clonedDevSpaces);
            mockLandscapeNode.expects(`getChildren`).resolves(devspaces);
            mockDevSpaceConnect
                .expects(`cmdDevSpaceConnectNewWindow`)
                .withExactArgs(devspaces[0], undefined)
                .resolves();
            mockDevSpaceUpdate
                .expects(`cmdDevSpaceStart`)
                .withExactArgs(clonedDevSpaces[0])
                .resolves();
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
        it("handleUri, devspace stopped and starting it was not successful", async () => {
            mockLandscape.expects(`getLandscapes`).resolves(landscapes);
            mockDevSpaceProvider.expects(`getChildren`).resolves(nodes);
            const clonedDevSpaces = (0, lodash_1.cloneDeep)(devspaces);
            clonedDevSpaces[0].status = bas_sdk_1.devspace.DevSpaceStatus.STOPPED;
            const mockLandscapeNode = (0, sinon_1.mock)(nodes[0]);
            mockLandscapeNode.expects(`getChildren`).resolves(clonedDevSpaces);
            mockLandscapeNode.expects(`getChildren`).resolves(clonedDevSpaces);
            mockWindow
                .expects(`showErrorMessage`)
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_devspace_must_be_started));
            mockDevSpaceUpdate
                .expects(`cmdDevSpaceStart`)
                .withExactArgs(clonedDevSpaces[0])
                .resolves();
            await handler.handleUri(uri);
            mockLandscapeNode.verify();
        });
    });
    describe("handle login", () => {
        const token = "jwt";
        const uri = {
            path: `/login`,
            query: `jwt=${token}`,
            toString: () => `uri: login path`,
        };
        let mockEmitter;
        beforeEach(() => {
            mockEmitter = (0, sinon_1.mock)(basHandlerProxy.eventEmitter);
        });
        afterEach(() => {
            mockEmitter.verify();
        });
        it("login, ok", async () => {
            mockEmitter
                .expects("fire")
                .withExactArgs({ jwt: `${token}` })
                .returns("");
            await handler.handleUri(uri);
        });
        it("login, wrong query param received", async () => {
            const url = (0, lodash_1.cloneDeep)(uri);
            url.query = `notjwt=${token}`;
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_url_param_missing(url.query, "jwt")))
                .resolves();
            await handler.handleUri(url);
        });
    });
    it("handle unsupported path", async () => {
        const uri = {
            path: `/support`,
            toString: () => `uri:unsupported path`,
        };
        mockWindow
            .expects("showErrorMessage")
            .withExactArgs(messages_1.messages.err_open_devspace_in_code(messages_1.messages.err_url_has_incorrect_format(uri.toString())))
            .resolves();
        (0, chai_1.expect)(await handler.handleUri(uri)).to.be.undefined;
    });
});
//# sourceMappingURL=basHandler.spec.js.map