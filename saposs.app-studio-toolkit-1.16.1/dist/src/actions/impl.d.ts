/// <reference types="vscode" />
import { ICommandAction, IExecuteAction, IFileAction, ISnippetAction } from "@sap-devx/app-studio-toolkit-types";
/** Specific action classes */
export declare class ExecuteAction implements IExecuteAction {
    id?: string;
    actionType: "EXECUTE";
    executeAction: (params?: any[]) => Thenable<any>;
    params?: any[];
    constructor();
}
export declare class CommandAction implements ICommandAction {
    id?: string;
    actionType: "COMMAND";
    name: string;
    params?: any[];
    constructor();
}
export declare class SnippetAction implements ISnippetAction {
    id?: string;
    actionType: "SNIPPET";
    contributorId: string;
    snippetName: string;
    context: any;
    isNonInteractive?: boolean;
    constructor();
}
export declare class FileAction implements IFileAction {
    id?: string;
    actionType: "FILE";
    uri: IFileAction["uri"];
    constructor();
}
