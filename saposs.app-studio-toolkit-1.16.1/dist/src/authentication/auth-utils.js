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
exports.hasJwt = exports.getJwt = exports.retrieveJwt = exports.timeUntilJwtExpires = exports.JWT_TIMEOUT = void 0;
const vscode_1 = require("vscode");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const bodyParser = __importStar(require("body-parser"));
const http_terminator_1 = require("http-terminator");
const jwt_decode_1 = __importDefault(require("jwt-decode"));
const os_1 = require("os");
const logger_1 = require("../logger/logger");
const authProvider_1 = require("./authProvider");
const bas_sdk_1 = require("@sap/bas-sdk");
const messages_1 = require("../../src/devspace-manager/common/messages");
const basHandler_1 = require("../../src/devspace-manager/handler/basHandler");
exports.JWT_TIMEOUT = 60 * 1000; // 60s
const EXT_LOGIN_PORTNUM = 55532;
const serverCache = new Map();
/**
 * Decides which method is used for the login procedure: `vscode` or `express (http)`
 * @returns true in case of `vscode`
 */
function isVscode() {
    // currently `vscode` is only used for `mac` platform
    return (0, os_1.platform)() === "darwin";
}
async function expressGetJwtFromServer(landscapeUrl) {
    return new Promise((resolve, reject) => {
        const app = (0, express_1.default)();
        app.use((0, cors_1.default)());
        app.use(bodyParser.urlencoded({ extended: false }));
        app.use(bodyParser.json());
        app.post("/ext-login", function (request, response) {
            var _a;
            const jwt = (_a = request === null || request === void 0 ? void 0 : request.body) === null || _a === void 0 ? void 0 : _a.jwt;
            if (!jwt || jwt.startsWith("<html>")) {
                response.send({ status: "error" });
                reject(new Error(messages_1.messages.err_incorrect_jwt(landscapeUrl)));
            }
            else {
                (0, logger_1.getLogger)().info(`jwt recieved from remote for ${landscapeUrl}`);
                response.send({ status: "ok" });
                resolve(jwt);
            }
        });
        /* istanbul ignore next */
        const server = app.listen(EXT_LOGIN_PORTNUM, () => {
            (0, logger_1.getLogger)().info(`CORS-enabled web server listening to get jwt for ${landscapeUrl}`);
        });
        server.on("error", function (err) {
            reject(new Error(messages_1.messages.err_listening(err.message, landscapeUrl)));
        });
        serverCache.set(landscapeUrl, (0, http_terminator_1.createHttpTerminator)({ server }));
    });
}
/* istanbul ignore next */
async function expressCloseListener(landscapeUrl) {
    var _a;
    await ((_a = serverCache.get(landscapeUrl)) === null || _a === void 0 ? void 0 : _a.terminate());
    serverCache.delete(landscapeUrl);
    (0, logger_1.getLogger)().info(`closing server for ${landscapeUrl}`);
}
async function vscodeCloseListener(promise) {
    promise = promise || Promise.reject(new Error("canceled"));
    // dispose the login event listener in case of :
    //   1. open browser is canceled or disallowed
    //   2. login timeout occured
    if (
    // confirm promise is rejected
    await promise
        .then(() => false)
        .catch((e) => {
        return !e.message.startsWith(messages_1.messages.err_incorrect_jwt("").split(" ").slice(0, 3).join(" "));
    })) {
        basHandler_1.eventEmitter.fire({});
    }
    (0, logger_1.getLogger)().info(`closing listener`);
}
async function vscodeGetJwtFromServer(landscapeUrl) {
    return new Promise((resolve, reject) => {
        // Subscribe the listener to the event
        const listener = basHandler_1.eventEmitter.event(handleEvent);
        // Listener function to resolve the promise when the event is received
        function handleEvent(event) {
            var _a, _b;
            if ((_a = event.jwt) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase().startsWith("<html>")) {
                reject(new Error(messages_1.messages.err_incorrect_jwt(landscapeUrl)));
            }
            else {
                resolve((_b = event.jwt) !== null && _b !== void 0 ? _b : "");
            }
            // Remove the listener after resolving the promise
            listener.dispose();
        }
    });
}
async function onJwtReceived(opt) {
    return isVscode()
        ? vscodeCloseListener(opt.jwtPromise)
        : expressCloseListener(opt.landscapeUrl);
}
async function loginToLandscape(landscapeUrl) {
    return vscode_1.env.openExternal(vscode_1.Uri.parse(bas_sdk_1.core.getExtLoginPath(landscapeUrl, isVscode())));
}
async function getJwtFromServer(landscapeUrl) {
    return isVscode()
        ? vscodeGetJwtFromServer(landscapeUrl)
        : expressGetJwtFromServer(landscapeUrl);
}
function getJwtExpiration(jwt) {
    var _a;
    const decodedJwt = (0, jwt_decode_1.default)(jwt);
    return (((_a = decodedJwt.exp) !== null && _a !== void 0 ? _a : 
    /* istanbul ignore next: test's dummy jwt always has 'exp' attribute */ 0) *
        1000);
}
function isJwtExpired(jwt) {
    const expired = getJwtExpiration(jwt);
    (0, logger_1.getLogger)().info(`jwt expires at ${new Date(expired).toString()}`);
    return Date.now() >= expired;
}
function timeUntilJwtExpires(jwt) {
    const untilExpired = getJwtExpiration(jwt) - Date.now();
    (0, logger_1.getLogger)().info(`jwt expires in ${untilExpired / 1000} seconds`);
    return untilExpired;
}
exports.timeUntilJwtExpires = timeUntilJwtExpires;
async function getJwtFromServerWithTimeout(ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    const timeout = new Promise((resolve, reject) => {
        const delay = setTimeout(() => {
            clearTimeout(delay);
            reject(new Error(messages_1.messages.err_get_jwt_timeout(ms)));
        }, ms);
    });
    // Returns a race between our timeout and the passed in promise
    return Promise.race([promise, timeout]);
}
async function retrieveJwtFromRemote(landscapeUrl) {
    const jwtPromise = getJwtFromServerWithTimeout(exports.JWT_TIMEOUT, getJwtFromServer(landscapeUrl));
    return receiveJwt({
        accepted: await loginToLandscape(landscapeUrl),
        jwtPromise,
        landscapeUrl,
    });
}
async function receiveJwt(opt) {
    // browser open not accepted
    if (!opt.accepted) {
        if (isVscode()) {
            void vscodeCloseListener();
        }
        else {
            void expressCloseListener(opt.landscapeUrl);
            return; // not waiting for jwtPromise fulfilled
        }
    }
    return opt.jwtPromise.finally(() => void onJwtReceived(opt));
}
function retrieveJwt(landscapeUrl) {
    return retrieveJwtFromRemote(landscapeUrl).catch((e) => {
        void vscode_1.window.showErrorMessage(e.message);
        (0, logger_1.getLogger)().error(e.toString());
    });
}
exports.retrieveJwt = retrieveJwt;
async function getJwt(landscapeUrl) {
    const session = await vscode_1.authentication.getSession(authProvider_1.BasRemoteAuthenticationProvider.id, [landscapeUrl]);
    if (session === null || session === void 0 ? void 0 : session.accessToken) {
        return session.accessToken;
    }
    else {
        (0, logger_1.getLogger)().debug(messages_1.messages.err_get_jwt_not_exists);
        throw new Error(messages_1.messages.err_get_jwt_not_exists);
    }
}
exports.getJwt = getJwt;
async function hasJwt(landscapeUrl) {
    return getJwt(landscapeUrl)
        .then((jwt) => !isJwtExpired(jwt))
        .catch((_) => false);
}
exports.hasJwt = hasJwt;
//# sourceMappingURL=auth-utils.js.map