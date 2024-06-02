import * as sdk from "@sap/bas-sdk";
export interface DevSpaceInfo extends Omit<sdk.devspace.DevspaceInfo, "status"> {
    status: sdk.devspace.DevSpaceStatus;
}
export declare function getDevSpaces(landscapeUrl: string): Promise<DevSpaceInfo[] | void>;
