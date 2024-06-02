"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initLogger = exports.getLogger = exports.SOURCE_TRACKING_CONFIG_PROP = exports.LOGGING_LEVEL_CONFIG_PROP = void 0;
const vscode_1 = require("vscode");
const wrapper_1 = require("@vscode-logging/wrapper");
exports.LOGGING_LEVEL_CONFIG_PROP = "app-studio-toolkit.logging.level";
exports.SOURCE_TRACKING_CONFIG_PROP = "app-studio-toolkit.logging.sourceLocationTracking";
let logger = wrapper_1.NOOP_LOGGER;
/**
 * Note the use of a getter function so the value would be lazy resolved on each use.
 * This enables concise and simple consumption of the Logger throughout our extension.
 */
function getLogger() {
    return logger;
}
exports.getLogger = getLogger;
/* istanbul ignore next - ignoring "legacy" missing coverage to enforce all new code to be 100% */
function initLogger(context) {
    const extensionName = "app-studio-toolkit"; // If the extension name changes, change this too
    try {
        logger = (0, wrapper_1.configureLogger)({
            extName: extensionName,
            logPath: context.logUri.fsPath,
            logOutputChannel: vscode_1.window.createOutputChannel(extensionName),
            loggingLevelProp: exports.LOGGING_LEVEL_CONFIG_PROP,
            sourceLocationProp: exports.SOURCE_TRACKING_CONFIG_PROP,
            subscriptions: context.subscriptions,
        });
    }
    catch (error) /* istanbul ignore next -- this is complex to test and will give little value */ {
        console.error(`Logs won't be available for the ${extensionName} extension: "`, error.message);
    }
}
exports.initLogger = initLogger;
//# sourceMappingURL=logger.js.map