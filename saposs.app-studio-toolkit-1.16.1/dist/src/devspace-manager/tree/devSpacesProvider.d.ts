import { EventEmitter, TreeItem } from "vscode";
import type { TreeDataProvider, Event } from "vscode";
import { TreeNode } from "./treeItems";
export declare class DevSpaceDataProvider implements TreeDataProvider<TreeItem> {
    private readonly extensionPath;
    privateOnDidChangeTreeData: EventEmitter<TreeItem | undefined>;
    readonly onDidChangeTreeData: Event<TreeItem | undefined>;
    private loading;
    constructor(extensionPath: string);
    setLoading(loading: boolean): void;
    refresh(): void;
    getTreeItem(element: TreeNode): TreeItem;
    getChildren(element?: TreeNode): Promise<TreeNode[]>;
    private getChildrenPromise;
    private getTreeTopLevelChildren;
}
