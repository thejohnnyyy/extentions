"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasRemoteAuthenticationProvider = void 0;
const vscode_1 = require("vscode");
const auth_utils_1 = require("./auth-utils");
const logger_1 = require("../logger/logger");
const messages_1 = require("../../src/devspace-manager/common/messages");
const lodash_1 = require("lodash");
class BasRemoteAuthenticationProvider {
    constructor(secretStorage) {
        this.secretStorage = secretStorage;
        this.secretKey = "baslandscapepat";
        this._onDidChangeSessions = new vscode_1.EventEmitter();
    }
    get onDidChangeSessions() {
        return this._onDidChangeSessions.event;
    }
    dispose() {
        var _a;
        (_a = this.initializedDisposable) === null || _a === void 0 ? void 0 : _a.dispose();
    }
    ensureInitialized(scopes) {
        if (this.initializedDisposable === undefined) {
            void this.cacheTokenFromStorage();
            this.initializedDisposable = vscode_1.Disposable.from(
            // This onDidChange event happens when the secret storage changes in _any window_ since
            // secrets are shared across all open windows.
            this.secretStorage.onDidChange((e) => {
                if (e.key === this.secretKey) {
                    void this.checkForUpdates(scopes);
                }
            }), 
            // This fires when the user initiates a "silent" auth flow via the Accounts menu.
            vscode_1.authentication.onDidChangeSessions((e) => {
                if (e.provider.id === BasRemoteAuthenticationProvider.id) {
                    void this.checkForUpdates(scopes);
                    (0, lodash_1.debounce)(() => {
                        void vscode_1.commands.executeCommand(`local-extension.tree.refresh`);
                    }, 1000)();
                }
            }));
        }
    }
    // This is a crucial function that handles whether or not the token has changed in
    // a different window of VS Code and sends the necessary event if it has.
    async checkForUpdates(scopes) {
        const added = [];
        const removed = [];
        const changed = [];
        const previousToken = this.getTokenByScope(await this.currentToken, scopes);
        const session = (await this.getSessions(scopes))[0];
        if ((session === null || session === void 0 ? void 0 : session.accessToken) && !previousToken) {
            added.push(session);
        }
        else if (!(session === null || session === void 0 ? void 0 : session.accessToken) && previousToken) {
            removed.push(new BasRemoteSession(scopes, previousToken));
        }
        else if ((session === null || session === void 0 ? void 0 : session.accessToken) !== previousToken) {
            changed.push(session);
        }
        else {
            return;
        }
        void this.cacheTokenFromStorage();
        this._onDidChangeSessions.fire({
            added: added,
            removed: removed,
            changed: changed,
        });
    }
    async cacheTokenFromStorage() {
        this.currentToken = this.secretStorage.get(this.secretKey);
        return this.currentToken;
    }
    getTokenByScope(allScopes, _scopes) {
        let objToken;
        if (allScopes) {
            objToken = JSON.parse(allScopes);
        }
        let token;
        if (objToken) {
            token = !(0, lodash_1.isEmpty)(_scopes)
                ? objToken[_scopes[0]]
                : /* indicate user signed in some BAS landscape */ `dummy-token`;
        }
        return token;
    }
    // This function is called first when `vscode.authentication.getSessions` is called.
    async getSessions(_scopes) {
        this.ensureInitialized(_scopes || []);
        const token = this.getTokenByScope(await this.cacheTokenFromStorage(), _scopes || []);
        return token ? [new BasRemoteSession(_scopes || [], token)] : [];
    }
    // This function is called after `this.getSessions` is called and only when:
    // - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
    // - `vscode.authentication.getSessions` was called with `forceNewSession: true`
    // - The end user initiates the "silent" auth flow via the Accounts menu
    async createSession(_scopes) {
        this.ensureInitialized(_scopes);
        const token = await (0, auth_utils_1.retrieveJwt)(_scopes[0]);
        // Note: consider to do some validation of the token beyond making sure it's not empty.
        if (!token) {
            (0, logger_1.getLogger)().error(messages_1.messages.err_get_jwt_required);
            throw new Error(messages_1.messages.err_get_jwt_required);
        }
        const allScopes = await this.cacheTokenFromStorage();
        const landscapeToken = {};
        landscapeToken[_scopes[0]] = token;
        // Don't set `currentToken` here, since we want to fire the proper events in the `checkForUpdates` call
        await this.secretStorage.store(this.secretKey, JSON.stringify(Object.assign(JSON.parse(allScopes !== null && allScopes !== void 0 ? allScopes : `{}`), landscapeToken)));
        (0, logger_1.getLogger)().debug(`Jwt successfully stored for ${_scopes[0]} landscape`);
        return new BasRemoteSession(_scopes, token);
    }
    // This function is called when the end user signs out of the account.
    async removeSession(_sessionId) {
        await this.secretStorage.delete(this.secretKey);
        void this.cacheTokenFromStorage();
    }
}
exports.BasRemoteAuthenticationProvider = BasRemoteAuthenticationProvider;
BasRemoteAuthenticationProvider.id = "BASLandscapePAT";
class BasRemoteSession {
    /**
     * @param accessToken The personal access token to use for authentication
     */
    constructor(scopes, accessToken) {
        this.scopes = scopes;
        this.accessToken = accessToken;
        this.account = {
            id: BasRemoteAuthenticationProvider.id,
            label: "Access Token",
        };
        this.id = BasRemoteAuthenticationProvider.id;
    }
}
//# sourceMappingURL=authProvider.js.map