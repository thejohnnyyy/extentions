"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasCapCapabilities = exports.CAP_EXTENSION_ID = void 0;
const artifact_management_1 = require("@sap/artifact-management");
const vscode_1 = require("vscode");
exports.CAP_EXTENSION_ID = "SAPSE.vscode-cds";
// eslint-disable-next-line @typescript-eslint/require-await -- the new implementation does not require await.
async function hasCapCapabilities() {
    const logger = (0, artifact_management_1.getLogger)().getChildLogger({ label: "hasCapCapabilities" });
    // Cap mode is determined by the existence of the Cap extension
    const hasCapCapabilities = !!vscode_1.extensions.getExtension(exports.CAP_EXTENSION_ID);
    logger.trace("Has Cap Capabilities", { hasCapCapabilities });
    return hasCapCapabilities;
}
exports.hasCapCapabilities = hasCapCapabilities;
//# sourceMappingURL=validateCapCapabilities.js.map