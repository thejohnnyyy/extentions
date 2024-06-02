import { WorkspaceApi } from "@sap/artifact-management";
import { BasToolkit } from "@sap-devx/app-studio-toolkit-types";
export declare function createBasToolkitAPI(workspaceImpl: WorkspaceApi, baseBasToolkitAPI: Omit<BasToolkit, "workspaceAPI">): BasToolkit;
