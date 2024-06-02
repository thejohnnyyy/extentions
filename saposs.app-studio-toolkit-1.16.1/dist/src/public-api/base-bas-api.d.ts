import { BasToolkit } from "@sap-devx/app-studio-toolkit-types";
/**
 * The BasToolkit API without the **dynamically** initialized
 * `workspaceAPI` part.
 */
export declare const baseBasToolkitAPI: Omit<BasToolkit, "workspaceAPI">;
