import { BasAction } from "@sap-devx/app-studio-toolkit-types";
export declare class ActionsFactory {
    static createAction(jsonAction: any, fromSettings?: boolean): BasAction;
    private static handleCommandAction;
    private static handleSnippetAction;
    private static handleUriAction;
}
