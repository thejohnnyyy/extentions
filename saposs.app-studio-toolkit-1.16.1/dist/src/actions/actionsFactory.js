"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionsFactory = void 0;
const vscode_1 = require("vscode");
const impl_1 = require("./impl");
const constants_1 = require("../constants");
const getNameProp = (fromSettings) => {
    return fromSettings ? "name" : "commandName";
};
const getParamsProp = (fromSettings) => {
    return fromSettings ? "params" : "commandParams";
};
class ActionsFactory {
    static createAction(jsonAction, fromSettings = false) {
        const actionType = jsonAction["actionType"];
        if (!actionType) {
            throw new Error(`actionType is missing`);
        }
        switch (actionType) {
            case constants_1.COMMAND: {
                return ActionsFactory.handleCommandAction(jsonAction, fromSettings);
            }
            case constants_1.SNIPPET: {
                return ActionsFactory.handleSnippetAction(jsonAction);
            }
            case constants_1.URI:
            case constants_1.FILE: {
                return ActionsFactory.handleUriAction(jsonAction);
            }
            default:
                throw new Error(`Action with type "${actionType}" could not be created from json file`);
        }
    }
    static handleCommandAction(jsonAction, 
    // TODO: Coverage refactor code so coverage directive is not needed, as the default value
    //       can never actually be used...
    /* istanbul ignore next - ignoring "legacy" missing coverage to enforce all new code to be 100% */
    fromSettings = false) {
        const commandAction = new impl_1.CommandAction();
        const commandId = jsonAction["id"];
        if (commandId) {
            commandAction.id = commandId;
        }
        const nameProp = getNameProp(fromSettings);
        const commandName = jsonAction[nameProp];
        if (commandName) {
            commandAction.name = commandName;
        }
        else {
            throw new Error(`${nameProp} is missing for "COMMAND" actionType`);
        }
        const paramsProp = getParamsProp(fromSettings);
        const commandParams = jsonAction[paramsProp];
        if (commandParams) {
            commandAction.params = commandParams;
        }
        return commandAction;
    }
    static handleSnippetAction(jsonAction) {
        const snippetAction = new impl_1.SnippetAction();
        const snippetId = jsonAction["id"];
        if (snippetId) {
            snippetAction.id = snippetId;
        }
        const snippetName = jsonAction["snippetName"];
        if (snippetName) {
            snippetAction.snippetName = snippetName;
        }
        else {
            throw new Error(`snippetName is missing for "SNIPPET" actionType`);
        }
        const contributorId = jsonAction["contributorId"];
        if (contributorId) {
            snippetAction.contributorId = contributorId;
        }
        else {
            throw new Error(`contributorId is missing for "SNIPPET" actionType`);
        }
        const context = jsonAction["context"];
        if (context) {
            snippetAction.context = context;
        }
        else {
            throw new Error(`context is missing for "SNIPPET" actionType`);
        }
        const isNonInteractive = jsonAction["isNonInteractive"];
        if (isNonInteractive) {
            snippetAction.isNonInteractive = isNonInteractive;
        }
        return snippetAction;
    }
    static handleUriAction(jsonAction) {
        const fileAction = new impl_1.FileAction();
        const fileId = jsonAction["id"];
        if (fileId) {
            fileAction.id = fileId;
        }
        const uri = jsonAction["uri"];
        try {
            fileAction.uri = vscode_1.Uri.parse(uri, true);
        }
        catch (error) {
            throw new Error(`Failed to parse field uri: ${uri} for "URI" actionType: ${error.message}`);
        }
        return fileAction;
    }
}
exports.ActionsFactory = ActionsFactory;
//# sourceMappingURL=actionsFactory.js.map