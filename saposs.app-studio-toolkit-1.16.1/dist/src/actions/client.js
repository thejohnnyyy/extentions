"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performAction = void 0;
const vscode_1 = require("vscode");
const performer_1 = require("./performer");
const logger_1 = require("../logger/logger");
const performAction = (action, options) => {
    return (options === null || options === void 0 ? void 0 : options.schedule) ? _scheduleAction(action) : (0, performer_1._performAction)(action);
};
exports.performAction = performAction;
const logger = (0, logger_1.getLogger)().getChildLogger({ label: "client" });
/** Schedule an action for execution after restart */
async function _scheduleAction(action) {
    const actionsSettings = vscode_1.workspace.getConfiguration();
    const actionsList = actionsSettings.get("actions", []);
    actionsList.push(action);
    try {
        await actionsSettings.update("actions", actionsList, vscode_1.ConfigurationTarget.Workspace);
        logger.trace(`Action '${action.id}' successfuly added to scheduled actions`);
    }
    catch (error) {
        logger.error(`Couldn't add '${action.id}' action to scheduled actions: ${error}`);
    }
}
//# sourceMappingURL=client.js.map