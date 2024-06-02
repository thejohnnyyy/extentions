"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.baseBasToolkitAPI = void 0;
const vscode_1 = require("vscode");
const client_1 = require("../actions/client");
const controller_1 = require("../actions/controller");
const impl_1 = require("../actions/impl");
const logger_1 = require("../logger/logger");
const validateLCAP_1 = require("../apis/validateLCAP");
const validateFioriCapabilities_1 = require("../apis/validateFioriCapabilities");
const validateCapCapabilities_1 = require("../apis/validateCapCapabilities");
const isOpenedForAction_1 = require("../apis/isOpenedForAction");
/**
 * The BasToolkit API without the **dynamically** initialized
 * `workspaceAPI` part.
 */
exports.baseBasToolkitAPI = {
    getExtensionAPI: (extensionId) => {
        const extension = vscode_1.extensions.getExtension(extensionId);
        const logger = (0, logger_1.getLogger)().getChildLogger({ label: "getExtensionAPI" });
        return new Promise((resolve, reject) => {
            if (extension === undefined) {
                return reject(new Error(`Extension ${extensionId} is not loaded`));
            }
            if (extension.isActive) {
                logger.info(`Detected ${extensionId} is active`);
                resolve(extension.exports);
            }
            else {
                logger.info(`Waiting for activation of ${extensionId}`);
                const intervalId = setInterval(() => {
                    if (extension.isActive) {
                        logger.info(`Detected activation of ${extensionId}`);
                        clearInterval(intervalId);
                        resolve(extension.exports);
                    }
                }, 500);
            }
        });
    },
    getAction: (actionId) => controller_1.ActionsController.getAction(actionId),
    performAction: client_1.performAction,
    isLCAPEnabled: validateLCAP_1.isLCAPEnabled,
    isLCAPEnabledSync: validateLCAP_1.isLCAPEnabledSync,
    hasFioriCapabilities: validateFioriCapabilities_1.hasFioriCapabilities,
    hasCapCapabilities: validateCapCapabilities_1.hasCapCapabilities,
    isOpenedForAction: isOpenedForAction_1.isOpenedForAction,
    actions: {
        performAction: client_1.performAction,
        ExecuteAction: impl_1.ExecuteAction,
        SnippetAction: impl_1.SnippetAction,
        CommandAction: impl_1.CommandAction,
        FileAction: impl_1.FileAction,
    },
};
//# sourceMappingURL=base-bas-api.js.map