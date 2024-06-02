"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasFioriCapabilities = exports.FIORI_EXTENSION_ID = void 0;
const artifact_management_1 = require("@sap/artifact-management");
const vscode_1 = require("vscode");
exports.FIORI_EXTENSION_ID = "SAPSE.sap-ux-application-modeler-extension";
// eslint-disable-next-line @typescript-eslint/require-await -- the new implementation does not require await.
async function hasFioriCapabilities() {
    const logger = (0, artifact_management_1.getLogger)().getChildLogger({ label: "hasFioriCapabilities" });
    // Fiori mode is determined by the existence of the Fiori extension
    const hasFioriCapabilities = !!vscode_1.extensions.getExtension(exports.FIORI_EXTENSION_ID);
    logger.trace("Has Fiori Capabilities", { hasFioriCapabilities });
    return hasFioriCapabilities;
}
exports.hasFioriCapabilities = hasFioriCapabilities;
//# sourceMappingURL=validateFioriCapabilities.js.map