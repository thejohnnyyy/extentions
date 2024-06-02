"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = require("sinon");
const authProvider_1 = require("../../src/authentication/authProvider");
const assert_1 = require("assert");
const proxyquire_1 = __importDefault(require("proxyquire"));
const messages_1 = require("../../src/devspace-manager/common/messages");
const lodash_1 = require("lodash");
describe("authProvider unit test", () => {
    const patLabel = "Access Token";
    let authListeners = [];
    const vscodeProxy = {
        authentication: {
            getSession: () => {
                throw new Error(`not implemented`);
            },
            onDidChangeSessions: (l) => {
                authListeners.push(l);
            },
        },
        commands: {
            executeCommand: (m) => {
                throw new Error(`not implemented`);
            },
        },
        Disposable: class proxyDispposable {
            constructor() { }
            dispose() { }
            static from() {
                return new proxyDispposable();
            }
        },
        EventEmitter: class proxyEventEmitter {
            constructor() { }
            fire() { }
        },
    };
    const proxyAuthUtils = {
        retrieveJwt: () => {
            throw new Error(`not implemented`);
        },
    };
    let storageListeners = [];
    const proxySecretSorage = {
        get: () => {
            throw new Error(`not implemented`);
        },
        store: () => {
            throw new Error(`not implemented`);
        },
        delete: () => {
            throw new Error(`not implemented`);
        },
        onDidChange: (l) => {
            storageListeners.push(l);
        },
    };
    let mockStorage;
    let BasRemoteAuthenticationProviderProxy;
    let sandbox;
    before(() => {
        sandbox = (0, sinon_1.createSandbox)();
        BasRemoteAuthenticationProviderProxy = (0, proxyquire_1.default)("../../src/authentication/authProvider", {
            vscode: {
                commands: vscodeProxy.commands,
                authentication: vscodeProxy.authentication,
                Disposable: vscodeProxy.Disposable,
                EventEmitter: vscodeProxy.EventEmitter,
                "@noCallThru": true,
            },
            "./auth-utils": proxyAuthUtils,
        }).BasRemoteAuthenticationProvider;
    });
    beforeEach(() => {
        mockStorage = (0, sinon_1.mock)(proxySecretSorage);
    });
    afterEach(() => {
        mockStorage.verify();
        sandbox.restore();
        authListeners = [];
        storageListeners = [];
    });
    const landscape1 = `https://my.landscape-1.com`;
    const landscape2 = `https://my.landscape-2.com`;
    const objToken = {};
    objToken[landscape1] = `token-1`;
    objToken[landscape2] = `token-2`;
    const secretKey = "baslandscapepat";
    const dummyToken = `dummy-token`;
    describe("getSessions method", () => {
        it("getSessions, scope not defined, storage empty", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(undefined);
            (0, chai_1.expect)(await instance.getSessions()).to.be.deep.equal([]);
        });
        it("getSessions, scope not defined, storage exist", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(`{}`);
            (0, chai_1.expect)(await instance.getSessions()).to.be.deep.equal([
                {
                    account: {
                        id: BasRemoteAuthenticationProviderProxy.id,
                        label: patLabel,
                    },
                    id: BasRemoteAuthenticationProviderProxy.id,
                    scopes: [],
                    accessToken: dummyToken,
                },
            ]);
        });
        it("getSessions, scope defined, storage exist", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(JSON.stringify(objToken));
            (0, chai_1.expect)(await instance.getSessions([landscape1])).to.be.deep.equal([
                {
                    account: {
                        id: BasRemoteAuthenticationProviderProxy.id,
                        label: patLabel,
                    },
                    id: BasRemoteAuthenticationProviderProxy.id,
                    scopes: [landscape1],
                    accessToken: objToken[landscape1],
                },
            ]);
        });
    });
    describe("createSession method", () => {
        let mockAuthUtils;
        beforeEach(() => {
            mockAuthUtils = (0, sinon_1.mock)(proxyAuthUtils);
        });
        afterEach(() => {
            mockAuthUtils.verify();
        });
        it("createSession, scope defined, storage empty, retrieveJwt succedded", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(undefined);
            mockAuthUtils
                .expects(`retrieveJwt`)
                .withExactArgs(landscape2)
                .resolves(objToken[landscape2]);
            const landscapeToken = {};
            landscapeToken[landscape2] = objToken[landscape2];
            mockStorage
                .expects(`store`)
                .withExactArgs(secretKey, JSON.stringify(Object.assign({}, landscapeToken)))
                .resolves();
            (0, chai_1.expect)(await instance[`createSession`]([landscape2])).to.be.deep.equal({
                account: {
                    id: BasRemoteAuthenticationProviderProxy.id,
                    label: patLabel,
                },
                id: BasRemoteAuthenticationProviderProxy.id,
                scopes: [landscape2],
                accessToken: objToken[landscape2],
            });
        });
        it("createSession, scope defined, storage exists, retrieveJwt succedded", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(JSON.stringify(objToken));
            mockAuthUtils
                .expects(`retrieveJwt`)
                .withExactArgs(landscape2)
                .resolves(objToken[landscape2]);
            const landscapeToken = {};
            landscapeToken[landscape2] = objToken[landscape2];
            mockStorage
                .expects(`store`)
                .withExactArgs(secretKey, JSON.stringify(Object.assign(objToken, landscapeToken)))
                .resolves();
            (0, chai_1.expect)(await instance[`createSession`]([landscape2])).to.be.deep.equal({
                account: {
                    id: BasRemoteAuthenticationProviderProxy.id,
                    label: patLabel,
                },
                id: BasRemoteAuthenticationProviderProxy.id,
                scopes: [landscape2],
                accessToken: objToken[landscape2],
            });
        });
        it("createSession, scope defined, storage added, retrieveJwt succedded", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const previousToken = (0, lodash_1.cloneDeep)(objToken);
            delete previousToken[landscape2];
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(JSON.stringify(previousToken));
            mockAuthUtils
                .expects(`retrieveJwt`)
                .withExactArgs(landscape2)
                .resolves(objToken[landscape2]);
            const landscapeToken = {};
            landscapeToken[landscape2] = objToken[landscape2];
            mockStorage
                .expects(`store`)
                .withExactArgs(secretKey, JSON.stringify(Object.assign(previousToken, landscapeToken)))
                .resolves();
            (0, chai_1.expect)(await instance[`createSession`]([landscape2])).to.be.deep.equal({
                account: {
                    id: BasRemoteAuthenticationProviderProxy.id,
                    label: patLabel,
                },
                id: BasRemoteAuthenticationProviderProxy.id,
                scopes: [landscape2],
                accessToken: objToken[landscape2],
            });
        });
        it("createSession, scope defined, storage empty, retrieveJwt failure", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            mockAuthUtils.expects(`retrieveJwt`).withExactArgs(landscape2).resolves();
            try {
                await instance[`createSession`]([landscape2]);
                (0, assert_1.fail)(`should fail`);
            }
            catch (e) {
                (0, chai_1.expect)(e.message).to.be.equal(messages_1.messages.err_get_jwt_required);
            }
        });
    });
    describe("removeSession method", () => {
        it("removeSession, succedded", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            mockStorage
                .expects(`delete`)
                .withExactArgs(secretKey)
                .resolves(undefined);
            await instance[`removeSession`](`sessionId`);
        });
    });
    describe("getTokenByScope method", () => {
        it("getTokenByScope, objToken empty, scope empty", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance[`getTokenByScope`](``, [])).to.be.undefined;
        });
        it("getTokenByScope, objToken undefined, scope empty", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance[`getTokenByScope`](undefined, [])).to.be.undefined;
        });
        it("getTokenByScope, objToken empty object, scope empty", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance[`getTokenByScope`](`{}`, [])).to.be.equal(dummyToken);
        });
        it("getTokenByScope, objToken empty object, scope specified", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance[`getTokenByScope`](`{}`, [landscape2])).to.be.undefined;
        });
        it("getTokenByScope, objToken provided, scope specified", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance[`getTokenByScope`](JSON.stringify(objToken), [landscape2])).to.be.equal(objToken[landscape2]);
        });
        it("getTokenByScope, objToken provided, not existed scope specified", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance[`getTokenByScope`](JSON.stringify(objToken), [
                `not-existing-scope`,
            ])).to.be.undefined;
        });
    });
    describe("checkForUpdates method", () => {
        const proxyEmitter = {
            fire: () => {
                throw new Error(`not implemented`);
            },
        };
        it("checkForUpdates, scope undefined, no changes", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(undefined);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([])).to.be.undefined;
        });
        it("checkForUpdates, scope empty, no changes", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .twice()
                .resolves(`{}`);
            instance[`currentToken`] = Promise.resolve(`{}`);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([])).to.be.undefined;
        });
        it("checkForUpdates, scope empty, added common scope", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .thrice()
                .resolves(`{}`);
            instance[`currentToken`] = Promise.resolve(undefined);
            instance[`_onDidChangeSessions`] = proxyEmitter;
            const stubEmitter = sandbox.stub(proxyEmitter, `fire`);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([])).to.be.undefined;
            const args = stubEmitter.args[0][0];
            (0, chai_1.expect)(args.added.length).to.be.equal(1);
            (0, chai_1.expect)(args.added[0].accessToken).to.be.equal(dummyToken);
            (0, chai_1.expect)(args.removed.length).to.be.equal(0);
            (0, chai_1.expect)(args.changed.length).to.be.equal(0);
        });
        it("checkForUpdates, scope undefined, remove common scope", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .thrice()
                .resolves(undefined);
            instance[`currentToken`] = Promise.resolve(`{}`);
            instance[`_onDidChangeSessions`] = proxyEmitter;
            const stubEmitter = sandbox.stub(proxyEmitter, `fire`);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([])).to.be.undefined;
            const args = stubEmitter.args[0][0];
            (0, chai_1.expect)(args.added.length).to.be.equal(0);
            (0, chai_1.expect)(args.removed.length).to.be.equal(1);
            (0, chai_1.expect)(args.removed[0].accessToken).to.be.equal(dummyToken);
            (0, chai_1.expect)(args.changed.length).to.be.equal(0);
        });
        it("checkForUpdates, scope specified, added scope", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const landscapeToken = (0, lodash_1.cloneDeep)(objToken);
            delete landscapeToken[landscape2];
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .thrice()
                .resolves(JSON.stringify(landscapeToken));
            instance[`currentToken`] = Promise.resolve(`{}`);
            instance[`_onDidChangeSessions`] = proxyEmitter;
            const stubEmitter = sandbox.stub(proxyEmitter, `fire`);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([landscape1])).to.be.undefined;
            const args = stubEmitter.args[0][0];
            (0, chai_1.expect)(args.added.length).to.be.equal(1);
            (0, chai_1.expect)(args.added[0].accessToken).to.be.equal(landscapeToken[landscape1]);
            (0, chai_1.expect)(args.removed.length).to.be.equal(0);
            (0, chai_1.expect)(args.changed.length).to.be.equal(0);
        });
        it("checkForUpdates, scope exists, remove scope", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const landscapeToken = (0, lodash_1.cloneDeep)(objToken);
            delete landscapeToken[landscape2];
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .thrice()
                .resolves(JSON.stringify(landscapeToken));
            instance[`currentToken`] = Promise.resolve(JSON.stringify(objToken));
            instance[`_onDidChangeSessions`] = proxyEmitter;
            const stubEmitter = sandbox.stub(proxyEmitter, `fire`);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([landscape2])).to.be.undefined;
            const args = stubEmitter.args[0][0];
            (0, chai_1.expect)(args.added.length).to.be.equal(0);
            (0, chai_1.expect)(args.removed.length).to.be.equal(1);
            (0, chai_1.expect)(args.removed[0].accessToken).to.be.equal(objToken[landscape2]);
            (0, chai_1.expect)(args.changed.length).to.be.equal(0);
        });
        it("checkForUpdates, scope exists, changed scope", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const landscapeToken = (0, lodash_1.cloneDeep)(objToken);
            landscapeToken[landscape2] = "token-updated";
            mockStorage
                .expects(`get`)
                .withExactArgs(secretKey)
                .thrice()
                .resolves(JSON.stringify(landscapeToken));
            instance[`currentToken`] = Promise.resolve(JSON.stringify(objToken));
            instance[`_onDidChangeSessions`] = proxyEmitter;
            const stubEmitter = sandbox.stub(proxyEmitter, `fire`);
            (0, chai_1.expect)(await instance[`checkForUpdates`]([landscape2])).to.be.undefined;
            const args = stubEmitter.args[0][0];
            (0, chai_1.expect)(args.added.length).to.be.equal(0);
            (0, chai_1.expect)(args.removed.length).to.be.equal(0);
            (0, chai_1.expect)(args.changed.length).to.be.equal(1);
            (0, chai_1.expect)(args.changed[0].accessToken).to.be.equal(landscapeToken[landscape2]);
        });
    });
    describe("dispose method", () => {
        it("dispose, not initialized", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance.dispose()).to.be.undefined;
        });
        it("dispose, initialized", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            instance[`ensureInitialized`]([]);
            (0, chai_1.expect)(instance.dispose()).to.be.undefined;
        });
    });
    describe("ensureInitialized method", () => {
        let mockCommands;
        beforeEach(() => {
            mockCommands = (0, sinon_1.mock)(vscodeProxy.commands);
        });
        afterEach(() => {
            mockCommands.verify();
        });
        it("ensureInitialized, already initialized", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            instance[`ensureInitialized`]([]);
            instance[`ensureInitialized`]([]);
        });
        it("onDidChange triggered with correct secret key", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const spyCheckup = sandbox
                .stub(instance, `checkForUpdates`)
                .resolves();
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            instance[`ensureInitialized`]([landscape1]);
            storageListeners[0]({ key: secretKey });
            (0, chai_1.expect)(spyCheckup.called).to.be.true;
            (0, chai_1.expect)(spyCheckup.args[0][0]).to.be.deep.equal([landscape1]);
        });
        it("onDidChange triggered with incorrect secret key", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const spyCheckup = sandbox
                .stub(instance, `checkForUpdates`)
                .resolves();
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            instance[`ensureInitialized`]([landscape1]);
            storageListeners[0]({ key: `key` });
            (0, chai_1.expect)(spyCheckup.called).to.be.false;
        });
        it("onDidChangeSessions triggered with correct provider id", async () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            mockCommands
                .expects(`executeCommand`)
                .withExactArgs(`local-extension.tree.refresh`)
                .resolves();
            const spyCheckup = sandbox
                .stub(instance, `checkForUpdates`)
                .resolves();
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            instance[`ensureInitialized`]([landscape2]);
            authListeners[0]({
                provider: { id: authProvider_1.BasRemoteAuthenticationProvider.id, label: `label` },
            });
            await new Promise((resolve) => setTimeout(() => resolve(true), 1100));
            (0, chai_1.expect)(spyCheckup.called).to.be.true;
            (0, chai_1.expect)(spyCheckup.args[0][0]).to.be.deep.equal([landscape2]);
        });
        it("onDidChangeSessions triggered with incorrect provider id", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            const spyCheckup = sandbox
                .stub(instance, `checkForUpdates`)
                .resolves();
            mockStorage.expects(`get`).withExactArgs(secretKey).resolves(undefined);
            instance[`ensureInitialized`]([landscape2]);
            authListeners[0]({ provider: { id: `incorrect-id`, label: `label` } });
            (0, chai_1.expect)(spyCheckup.called).to.be.false;
        });
        it("onDidChangeSessions, get event", () => {
            const instance = new BasRemoteAuthenticationProviderProxy(proxySecretSorage);
            (0, chai_1.expect)(instance.onDidChangeSessions).to.be.deep.equal(instance[`_onDidChangeSessions`].event);
        });
    });
});
//# sourceMappingURL=authProvider.spec.js.map