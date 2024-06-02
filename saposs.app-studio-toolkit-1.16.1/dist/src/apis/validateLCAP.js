"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isLCAPEnabledSync = exports.isLCAPEnabled = exports.LACP_EXTENSION_ID = void 0;
const artifact_management_1 = require("@sap/artifact-management");
const vscode_1 = require("vscode");
exports.LACP_EXTENSION_ID = "SAPSE.lcap-treeview-container";
// eslint-disable-next-line @typescript-eslint/require-await -- the new implementation does not require await.
async function isLCAPEnabled() {
    return isLCAPEnabledSync();
}
exports.isLCAPEnabled = isLCAPEnabled;
function isLCAPEnabledSync() {
    const logger = (0, artifact_management_1.getLogger)().getChildLogger({ label: "isLCAPEnabled" });
    // LCAP mode is determined by the existence of the LCAP extension
    const isLCAPEnabled = !!vscode_1.extensions.getExtension(exports.LACP_EXTENSION_ID);
    logger.trace("LCAP enabled mode", { isLCAPEnabled });
    return isLCAPEnabled;
}
exports.isLCAPEnabledSync = isLCAPEnabledSync;
//# sourceMappingURL=validateLCAP.js.map