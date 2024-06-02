"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getParameter = void 0;
const logger_1 = require("../logger/logger");
const optional_require_1 = require("../utils/optional-require");
async function getParameter(parameterName) {
    var _a;
    const logger = (0, logger_1.getLogger)().getChildLogger({ label: "getParameter" });
    const noSapPlugin = "NO_SAP_PLUGIN_FOUND";
    const sapPlugin = (_a = (0, optional_require_1.optionalRequire)("@sap/plugin")) !== null && _a !== void 0 ? _a : noSapPlugin;
    if (sapPlugin === noSapPlugin) {
        logger.trace("Failed to load @sap/plugin, so returning undefined.");
        return;
    }
    logger.trace("@sap/plugin successfully loaded.");
    const configuration = await sapPlugin.window.configuration();
    logger.trace("Configuration successfully received.", { configuration });
    return configuration === null || configuration === void 0 ? void 0 : configuration[parameterName];
}
exports.getParameter = getParameter;
//# sourceMappingURL=parameters.js.map