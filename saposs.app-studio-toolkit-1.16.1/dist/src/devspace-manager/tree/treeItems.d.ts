import { TreeItemCollapsibleState, TreeItem } from "vscode";
import type { Command } from "vscode";
import * as sdk from "@sap/bas-sdk";
declare type IconPath = {
    light: string;
    dark: string;
} | string;
export declare function getSvgIconPath(extensionPath: string, iconName: string): IconPath;
export declare abstract class TreeNode extends TreeItem {
    readonly label: string;
    readonly collapsibleState: TreeItemCollapsibleState;
    readonly iconPath: IconPath;
    readonly parentName: string;
    readonly contextValue?: string | undefined;
    readonly command?: Command | undefined;
    readonly tooltip?: string | undefined;
    readonly description?: string | undefined;
    constructor(label: string, collapsibleState: TreeItemCollapsibleState, iconPath: IconPath, parentName: string, contextValue?: string | undefined, command?: Command | undefined, tooltip?: string | undefined, description?: string | undefined);
    abstract getChildren(element?: TreeNode): Thenable<TreeNode[]>;
}
export declare class EmptyNode extends TreeNode {
    constructor(label: string, state?: TreeItemCollapsibleState);
    getChildren(): Thenable<TreeNode[]>;
}
export declare class LoadingNode extends EmptyNode {
    constructor(state?: TreeItemCollapsibleState);
}
export declare class DevSpaceNode extends TreeNode {
    readonly landscapeName: string;
    readonly landscapeUrl: string;
    readonly wsUrl: string;
    readonly id: string;
    readonly status: sdk.devspace.DevSpaceStatus;
    constructor(label: string, collapsibleState: TreeItemCollapsibleState, iconPath: IconPath, parentName: string, landscapeName: string, landscapeUrl: string, wsUrl: string, id: string, status: sdk.devspace.DevSpaceStatus, contextValue?: string, tooltip?: string, description?: string);
    getChildren(element?: TreeNode): Thenable<TreeNode[]>;
}
export declare class LandscapeNode extends TreeNode {
    private readonly extensionPath;
    readonly name: string;
    readonly url: string;
    constructor(extensionPath: string, label: string, collapsibleState: TreeItemCollapsibleState, iconPath: IconPath, parentName: string, tooltip: string, name: string, url: string, contextValue?: string);
    private getLabel;
    private assertUnreachable;
    private getIconPath;
    private getContextView;
    getChildren(element: LandscapeNode): Promise<TreeNode[]>;
}
export {};
