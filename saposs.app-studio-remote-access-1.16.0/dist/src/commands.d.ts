import { DevSpaceNode } from "./tunnel/ssh-utils";
export declare function closeTunnel(): boolean;
export declare function cmdDevSpaceConnectNewWindow(devSpace: DevSpaceNode, folderPath: string | undefined): Promise<void>;
export declare function cleanDevspaceConfig(devSpace: DevSpaceNode): Promise<void>;
