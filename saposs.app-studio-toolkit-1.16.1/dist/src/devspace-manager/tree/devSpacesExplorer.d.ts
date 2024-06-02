import { TreeItem } from "vscode";
import type { TreeView } from "vscode";
import { DevSpaceDataProvider } from "./devSpacesProvider";
export declare class DevSpacesExplorer {
    private readonly devSpacesExplorerView;
    private readonly devSpacesExplorerProvider;
    constructor(extensionPath: string);
    refreshTree(): void;
    changeTreeToLoading(): void;
    changeTreeToLoaded(): void;
    getDevSpacesExplorerProvider(): DevSpaceDataProvider;
    getDevSpacesExplorerView(): TreeView<TreeItem>;
}
