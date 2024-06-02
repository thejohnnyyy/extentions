import { BasAction } from "@sap-devx/app-studio-toolkit-types";
export declare class ActionsController {
    private static readonly actions;
    static loadContributedActions(): void;
    static getAction(id: string): BasAction | undefined;
    static performActionsFromURL(): Promise<void>;
    private static detectActionMode;
    private static performActionsByIds;
    private static perfomInlinedActions;
    static performScheduledActions(): void;
}
