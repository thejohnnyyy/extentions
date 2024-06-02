"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const mockUtil_1 = require("../mockUtil");
const vscodeProxy = {
    authentication: {
        getSession: () => {
            throw new Error(`not implemented`);
        },
    },
    env: {
        openExternal: () => {
            throw new Error(`not implemented`);
        },
    },
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
(0, mockUtil_1.mockVscode)(vscodeProxy, "dist/src/devspace-manager/handler/basHandler.js");
const authProvider_1 = require("../../src/authentication/authProvider");
const assert_1 = require("assert");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../src/devspace-manager/common/messages");
describe("auth-utils unit test", () => {
    let mockWindow;
    let mockUri;
    let mockAuth;
    let mockOs;
    let mockEnv;
    let authUtilsProxy;
    let handlerProxy;
    let extLoginListener;
    let cbOnServerError;
    const server = {
        on: (path, listener) => {
            if (path === `error`) {
                cbOnServerError = listener;
            }
        },
    };
    const appProxy = {
        use: () => { },
        options: () => { },
        post: (path, listener) => {
            if (path === `/ext-login`) {
                extLoginListener = listener;
            }
        },
        listen: (port, cb) => {
            (0, chai_1.expect)(port).to.be.equal(55532);
            return server;
        },
    };
    const expressProxy = () => appProxy;
    const listenerProxy = {
        dispose: () => { },
    };
    const proxyEmitter = {
        event: (handler) => {
            handlerProxy = handler;
            return listenerProxy;
        },
        fire: (event) => {
            handlerProxy(event);
        },
    };
    const proxyOs = {
        platform: () => {
            throw new Error("not implemented");
        },
    };
    before(() => {
        const basHandlerModule = (0, proxyquire_1.default)("../../src/devspace-manager/handler/basHandler", {
            vscode: {
                Uri: vscodeProxy.Uri,
                window: vscodeProxy.window,
                commands: vscodeProxy.commands,
                EventEmitter: vscodeProxy.EventEmitter,
                "@noCallThru": true,
            },
        });
        basHandlerModule.eventEmitter = proxyEmitter;
        authUtilsProxy = (0, proxyquire_1.default)("../../src/authentication/auth-utils", {
            vscode: {
                window: vscodeProxy.window,
                authentication: vscodeProxy.authentication,
                env: vscodeProxy.env,
                Uri: vscodeProxy.Uri,
                "@noCallThru": true,
            },
            os: proxyOs,
            express: expressProxy,
            "../../src/devspace-manager/handler/basHandler": basHandlerModule,
        });
    });
    beforeEach(() => {
        extLoginListener = undefined;
        cbOnServerError = undefined;
        mockWindow = (0, sinon_1.mock)(vscodeProxy.window);
        mockUri = (0, sinon_1.mock)(vscodeProxy.Uri);
        mockAuth = (0, sinon_1.mock)(vscodeProxy.authentication);
        mockEnv = (0, sinon_1.mock)(vscodeProxy.env);
        mockOs = (0, sinon_1.mock)(proxyOs);
    });
    afterEach(() => {
        mockWindow.verify();
        mockUri.verify();
        mockAuth.verify();
        mockEnv.verify();
        mockOs.verify();
    });
    const landscape = `https://my.landscape-1.com`;
    const dummyToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJmb28iOiJiYXIiLCJleHAiOjEzOTMyODY4OTMsImlhdCI6MTM5MzI2ODg5M30.4-iaDojEVl0pJQMjrbM1EzUIfAZgsbK_kgnVyVxFSVo";
    it("timeUntilJwtExpires, expired", () => {
        const jwt = dummyToken;
        (0, chai_1.expect)(authUtilsProxy.timeUntilJwtExpires(jwt)).to.be.lt(0);
    });
    it("timeUntilJwtExpires, `exp` not defined", () => {
        const jwt = dummyToken;
        (0, chai_1.expect)(authUtilsProxy.timeUntilJwtExpires(jwt)).to.be.lt(0);
    });
    it("getJwt, exists", async () => {
        const session = { accessToken: `token` };
        mockAuth
            .expects(`getSession`)
            .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape])
            .resolves(session);
        (0, chai_1.expect)(await authUtilsProxy.getJwt(landscape)).to.be.equal(session.accessToken);
    });
    it("getJwt, not exists", async () => {
        mockAuth
            .expects(`getSession`)
            .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape])
            .resolves();
        try {
            await authUtilsProxy.getJwt(landscape);
            (0, assert_1.fail)(`should fail`);
        }
        catch (e) {
            (0, chai_1.expect)(e.message).to.equal(messages_1.messages.err_get_jwt_not_exists);
        }
    });
    it("hasJwt, session exists, expired", async () => {
        const session = {
            accessToken: dummyToken,
        };
        mockAuth
            .expects(`getSession`)
            .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape])
            .resolves(session);
        (0, chai_1.expect)(await authUtilsProxy.hasJwt(landscape)).to.be.false;
    });
    it("hasJwt, session not exists", async () => {
        mockAuth
            .expects(`getSession`)
            .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape])
            .resolves(undefined);
        (0, chai_1.expect)(await authUtilsProxy.hasJwt(landscape)).to.be.false;
    });
    it("hasJwt, session exists, token broken", async () => {
        mockAuth
            .expects(`getSession`)
            .withExactArgs(authProvider_1.BasRemoteAuthenticationProvider.id, [landscape])
            .resolves({ accessToken: `token` });
        (0, chai_1.expect)(await authUtilsProxy.hasJwt(landscape)).to.be.false;
    });
    describe(`ext-login unit test for "mac"`, () => {
        let mockListener;
        beforeEach(() => {
            mockListener = (0, sinon_1.mock)(listenerProxy);
            (0, sinon_1.stub)(authUtilsProxy, "JWT_TIMEOUT").value(1000);
            mockOs.expects("platform").atLeast(3).returns("darwin");
        });
        afterEach(() => {
            mockListener.verify();
        });
        it("retrieveJwt, login suceedded", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockListener.expects("dispose").returns(undefined);
            setTimeout(() => {
                handlerProxy({ jwt: "token" });
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.equal(`token`);
        });
        it("retrieveJwt, wrong jwt received", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockListener.expects("dispose").returns({});
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_incorrect_jwt(landscape))
                .resolves();
            setTimeout(() => {
                handlerProxy({ jwt: `<html> authentication wrong </html>` });
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
        });
        it("retrieveJwt, browser not accepted", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(false);
            mockListener.expects("dispose").returns({});
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.empty;
        });
        it("retrieveJwt, login timeout", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockListener.expects("dispose").returns({});
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(`Login time out in 1000 ms.`)
                .resolves();
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
        });
    });
    describe(`ext-login unit test"`, () => {
        let status;
        const request = {
            body: {
                jwt: ``,
            },
        };
        const response = {
            send: (s) => {
                status = s;
            },
        };
        beforeEach(() => {
            status = {};
            request.body.jwt = ``;
            (0, sinon_1.stub)(authUtilsProxy, "JWT_TIMEOUT").value(1000);
            mockOs.expects("platform").atMost(3).returns("win");
        });
        it("retrieveJwt, login suceedded", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            request.body.jwt = `token`;
            setTimeout(() => {
                (0, chai_1.expect)(extLoginListener).to.be.ok;
                extLoginListener(request, response);
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.equal(`token`);
            (0, chai_1.expect)(status).to.be.deep.equal({ status: "ok" });
        });
        it("retrieveJwt, empty jwt received", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_incorrect_jwt(landscape))
                .resolves();
            setTimeout(() => {
                (0, chai_1.expect)(extLoginListener).to.be.ok;
                extLoginListener(request, response);
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
            (0, chai_1.expect)(status).to.be.deep.equal({ status: "error" });
        });
        it("retrieveJwt, wrong jwt received", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_incorrect_jwt(landscape))
                .resolves();
            request.body.jwt = `<html> wrong flow </html>`;
            setTimeout(() => {
                (0, chai_1.expect)(extLoginListener).to.be.ok;
                extLoginListener(request, response);
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
            (0, chai_1.expect)(status).to.be.deep.equal({ status: "error" });
        });
        it("retrieveJwt, wrong request bdoy received", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_incorrect_jwt(landscape))
                .resolves();
            setTimeout(() => {
                (0, chai_1.expect)(extLoginListener).to.be.ok;
                extLoginListener({}, response);
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
            (0, chai_1.expect)(status).to.be.deep.equal({ status: "error" });
        });
        it("retrieveJwt, empty request received", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_incorrect_jwt(landscape))
                .resolves();
            setTimeout(() => {
                (0, chai_1.expect)(extLoginListener).to.be.ok;
                extLoginListener(undefined, response);
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
            (0, chai_1.expect)(status).to.be.deep.equal({ status: "error" });
        });
        it("retrieveJwt, on server error", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            const err = new Error(`server error`);
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(messages_1.messages.err_listening(err.message, landscape))
                .resolves();
            setTimeout(() => {
                (0, chai_1.expect)(cbOnServerError).to.be.ok;
                cbOnServerError(err);
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
        });
        it("retrieveJwt, browser not accepted", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(false);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
        });
        it("retrieveJwt, login timeout", async () => {
            mockUri.expects("parse").returns({ psPath: landscape });
            mockEnv.expects("openExternal").resolves(true);
            mockWindow
                .expects("showErrorMessage")
                .withExactArgs(`Login time out in 1000 ms.`)
                .resolves();
            setTimeout(() => {
                (0, chai_1.expect)(extLoginListener).to.be.ok;
            }, 100);
            (0, chai_1.expect)(await authUtilsProxy.retrieveJwt(landscape)).to.be.undefined;
        });
    });
});
//# sourceMappingURL=auth-utils.spec.js.map