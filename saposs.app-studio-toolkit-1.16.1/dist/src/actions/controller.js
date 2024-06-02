"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsController = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("../logger/logger");
const performer_1 = require("./performer");
const parameters_1 = require("../apis/parameters");
const actionsFactory_1 = require("./actionsFactory");
const lodash_1 = require("lodash");
const actionsConfig = __importStar(require("./actionsConfig"));
class ActionsController {
    static loadContributedActions() {
        (0, lodash_1.forEach)(vscode_1.extensions.all, (extension) => {
            const extensionActions = (0, lodash_1.get)(extension, "packageJSON.BASContributes.actions", []);
            (0, lodash_1.forEach)(extensionActions, (actionAsJson) => {
                try {
                    const action = actionsFactory_1.ActionsFactory.createAction(actionAsJson, true);
                    ActionsController.actions.push(action);
                }
                catch (error) {
                    (0, logger_1.getLogger)().error(`Failed to create action ${JSON.stringify(actionAsJson)}: ${error}`, { method: "loadContributedActions" });
                }
            });
        });
    }
    static getAction(id) {
        return ActionsController.actions.find((action) => action.id === id);
    }
    static async performActionsFromURL() {
        const actionsParam = await (0, parameters_1.getParameter)("actions");
        /* istanbul ignore if - a test case for this single branch is not worth the cost > 50 LOC due to mocks */
        if (actionsParam === undefined) {
            // TODO: also uncertain if this branch is even needed, the `detectActionMode` should likely be changed
            //   to return "ByIDs" | "Inlined" | "N/A" and a branch could be added to the `switch(mode)` to explicitly
            //   `return in that scenario.
            return;
        }
        const decodedActionsParam = decodeURI(actionsParam);
        (0, logger_1.getLogger)().trace(`decodedActionsParam= ${decodedActionsParam}`, {
            method: "performActionsFromURL",
        });
        const mode = ActionsController.detectActionMode(decodedActionsParam);
        switch (mode) {
            case "ByIDs": {
                const actionsIds = (0, lodash_1.uniq)((0, lodash_1.compact)((0, lodash_1.split)(decodedActionsParam, ",")));
                ActionsController.performActionsByIds(actionsIds);
                break;
            }
            case "Inlined": {
                ActionsController.perfomInlinedActions(decodedActionsParam.trim());
                break;
            }
        }
    }
    static detectActionMode(decodedActionsParam) {
        try {
            /* istanbul ignore else - ignoring "legacy" missing coverage to enforce all new code to be 100% */
            if ((0, lodash_1.isArray)(JSON.parse(decodedActionsParam))) {
                // actionsInlinedMode
                // actions=[{"id":"openSettings","actionType":"COMMAND","name":"workbench.action.openSettings"},{"actionType":"FILE","uri":"https://www.google.com/"}]
                return "Inlined";
            }
        }
        catch (e) {
            // actionsByIDsMode
            //actions=openSettings,openGoogle
        }
        return "ByIDs";
    }
    static performActionsByIds(actionsIds) {
        (0, logger_1.getLogger)().trace(`actionsIds= ${actionsIds}`, {
            method: "performActionsByIds",
        });
        (0, lodash_1.forEach)(actionsIds, async (actionId) => {
            const action = ActionsController.getAction(actionId.trim());
            /* istanbul ignore else - testing logger flows not worth the cost... */
            if (action) {
                await (0, performer_1._performAction)(action);
            }
            else {
                (0, logger_1.getLogger)().error(`action ${actionId} not found`, {
                    method: "performActionsByIds",
                });
            }
        });
    }
    static perfomInlinedActions(actions) {
        const actionsArr = JSON.parse(decodeURI(actions));
        (0, logger_1.getLogger)().trace(`inlinedActions= ${JSON.stringify(actionsArr)}`, {
            method: "perfomInlinedActions",
        });
        (0, lodash_1.forEach)(actionsArr, async (actionAsJson) => {
            try {
                const action = actionsFactory_1.ActionsFactory.createAction(actionAsJson, true);
                await (0, performer_1._performAction)(action);
            }
            catch (error) {
                (0, logger_1.getLogger)().error(`Failed to create action ${JSON.stringify(actionAsJson)}: ${error}`, { method: "perfomFullActions" });
            }
        });
    }
    static performScheduledActions() {
        const actionsList = actionsConfig.get();
        (0, lodash_1.forEach)(actionsList, async (actionItem) => {
            try {
                const action = (0, lodash_1.isString)(actionItem)
                    ? ActionsController.getAction(actionItem)
                    : actionsFactory_1.ActionsFactory.createAction(actionItem, true);
                if (action) {
                    await (0, performer_1._performAction)(action);
                }
            }
            catch (error) {
                (0, logger_1.getLogger)().error(`Failed to execute scheduled action ${JSON.stringify(actionItem)}
          )}: ${error}`, { method: "performScheduledActions" });
            }
        });
        void actionsConfig.clear();
    }
}
exports.ActionsController = ActionsController;
ActionsController.actions = [];
//# sourceMappingURL=controller.js.map