"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivate = exports.activate = void 0;
const base_bas_api_1 = require("./public-api/base-bas-api");
const create_bas_toolkit_api_1 = require("./public-api/create-bas-toolkit-api");
const basctlServer_1 = require("./basctlServer/basctlServer");
const controller_1 = require("./actions/controller");
const logger_1 = require("./logger/logger");
const workspace_instance_1 = require("./project-type/workspace-instance");
const instance_1 = require("./devspace-manager/instance");
const bas_utils_1 = require("./utils/bas-utils");
function activate(context) {
    (0, logger_1.initLogger)(context);
    // should be trigered earlier on acivating because the `shouldRunCtlServer` method sets the context value of `ext.runPlatform`
    if ((0, bas_utils_1.shouldRunCtlServer)()) {
        (0, logger_1.getLogger)().debug("starting basctl server");
        (0, basctlServer_1.startBasctlServer)();
    }
    controller_1.ActionsController.loadContributedActions();
    controller_1.ActionsController.performScheduledActions();
    void controller_1.ActionsController.performActionsFromURL();
    const workspaceAPI = (0, workspace_instance_1.initWorkspaceAPI)(context);
    const basToolkitAPI = (0, create_bas_toolkit_api_1.createBasToolkitAPI)(workspaceAPI, base_bas_api_1.baseBasToolkitAPI);
    (0, instance_1.initBasRemoteExplorer)(context);
    const logger = (0, logger_1.getLogger)().getChildLogger({ label: "activate" });
    logger.info("The App-Studio-Toolkit Extension is active.");
    return basToolkitAPI;
}
exports.activate = activate;
function deactivate() {
    (0, basctlServer_1.closeBasctlServer)();
    void (0, instance_1.deactivateBasRemoteExplorer)();
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map