"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalRequire = void 0;
const native_require_1 = require("./native-require");
/**
 * Naive implementation of optional-require.
 * It does not deal with all edge cases, e.g differentiate between:
 * 1. a module which does not exist.
 * 2. a module which exists but throws an error on initialization.
 *
 * But our use cases are simple enough that this naive implementation should suffice.
 * And this resolves bundling issue around the combination of:
 * - webpack
 * - optional-require npm package
 * - pnpm (which creates sym-links in node_modules)
 * - vsce vsix packager (which does **not** copy contents of sym-links).
 *
 */
function optionalRequire(moduleName) {
    try {
        // will throw "MODULE_NOT_FOUND" if the module cannot be located
        return (0, native_require_1.nativeRequire)(moduleName);
    }
    catch (e) {
        // our incredibly naive implementation does not currently distinguish between
        // "MODULE_NOT_FOUND" exceptions or exceptions thrown during the optional module loading
        return undefined;
    }
}
exports.optionalRequire = optionalRequire;
//# sourceMappingURL=optional-require.js.map