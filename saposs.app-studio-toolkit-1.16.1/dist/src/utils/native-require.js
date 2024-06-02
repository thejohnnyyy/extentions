"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nativeRequire = void 0;
// by avoiding parsing (and transformations) or webpack on this file
//   - see webpack.config.js
// we allow access to the native requirejs functionality for modules which import
// this `native-require` file.
exports.nativeRequire = require;
//# sourceMappingURL=native-require.js.map