import { DevSpaceNode } from "../tree/treeItems";
export declare function closeTunnel(): Promise<void>;
export declare function cmdDevSpaceConnectNewWindow(devSpace: DevSpaceNode, folderPath: string | undefined): Promise<void>;
export declare function cmdDevSpaceOpenInBAS(devSpace: DevSpaceNode): Promise<boolean>;
