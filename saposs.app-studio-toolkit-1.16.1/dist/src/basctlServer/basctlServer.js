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
exports.startBasctlServer = exports.closeBasctlServer = void 0;
const vscode = __importStar(require("vscode"));
const net = __importStar(require("net"));
const fs = __importStar(require("fs"));
const _ = __importStar(require("lodash"));
const performer_1 = require("../actions/performer");
const actionsFactory_1 = require("../actions/actionsFactory");
const logger_1 = require("../logger/logger");
const SOCKETFILE = "/extbin/basctlSocket";
const logger = (0, logger_1.getLogger)().getChildLogger({ label: "client" });
let basctlServer;
function handleRequest(socket) {
    socket.on("data", (dataBuffer) => {
        void (async () => {
            const data = getRequestData(dataBuffer);
            let result;
            try {
                const action = actionsFactory_1.ActionsFactory.createAction(data);
                result = await (0, performer_1._performAction)(action);
            }
            catch (error) {
                showErrorMessage(error, "failed to perform action");
                result = false;
            }
            socket.write(JSON.stringify({ result }));
        })();
    });
}
function getRequestData(dataBuffer) {
    try {
        return JSON.parse(_.toString(dataBuffer));
    }
    catch (error) {
        showErrorMessage(error, "failed to parse basctl request data");
        /* istanbul ignore next - ignoring "legacy" missing coverage to enforce all new code to be 100% */
        return {};
    }
}
function showErrorMessage(error, defaultError) {
    const errorMessage = _.get(error, "message", defaultError);
    logger.error(errorMessage);
    void vscode.window.showErrorMessage(errorMessage);
}
function closeBasctlServer() {
    /* istanbul ignore if - ignoring "legacy" missing coverage to enforce all new code to be 100% */
    if (basctlServer) {
        basctlServer.close();
    }
}
exports.closeBasctlServer = closeBasctlServer;
function createBasctlServer() {
    try {
        basctlServer = net
            .createServer((socket) => {
            handleRequest(socket);
        })
            .listen(SOCKETFILE);
    }
    catch (error) {
        showErrorMessage(error, "basctl server error");
    }
}
function startBasctlServer() {
    fs.stat(SOCKETFILE, (err) => {
        if (err) {
            createBasctlServer();
        }
        else {
            fs.unlink(SOCKETFILE, (err) => {
                if (err) {
                    throw new Error(`Failed to unlink socket ${SOCKETFILE}:\n${err.message}:\n${err.stack}`);
                }
                createBasctlServer();
            });
        }
    });
}
exports.startBasctlServer = startBasctlServer;
//# sourceMappingURL=basctlServer.js.map