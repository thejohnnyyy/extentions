import { LandscapeNode } from "../tree/treeItems";
export declare function autoRefresh(refreshRate?: number, timeOut?: number): void;
export interface LandscapeInfo {
    name: string;
    url: string;
    isLoggedIn: boolean;
}
export declare function getLanscapesConfig(): string[];
export declare function updateLandscapesConfig(value: string[]): Promise<void>;
export declare function getLandscapes(): Promise<LandscapeInfo[]>;
export declare function removeLandscape(landscapeName: string): Promise<void>;
export declare function cmdLoginToLandscape(node: LandscapeNode): Promise<void>;
