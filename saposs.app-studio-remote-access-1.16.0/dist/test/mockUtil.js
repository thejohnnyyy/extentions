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
exports.clearModuleCache = exports.mockVscode = void 0;
const path = __importStar(require("path"));
const _ = __importStar(require("lodash"));
const Module = require("module");
const originalRequire = Module.prototype.require;
const mockVscode = (oVscodeMock, testModulePath) => {
    clearModuleCache(testModulePath);
    Module.prototype.require = function (...args) {
        if (_.get(args, "[0]") === "vscode") {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- dynamic import wrapper code
            return oVscodeMock;
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- dynamic import wrapper code
        return originalRequire.apply(this, args);
    };
};
exports.mockVscode = mockVscode;
function clearModuleCache(testModulePath) {
    if (testModulePath) {
        const key = path.resolve(testModulePath);
        if (require.cache[key]) {
            delete require.cache[key];
        }
    }
}
exports.clearModuleCache = clearModuleCache;
//# sourceMappingURL=mockUtil.js.map