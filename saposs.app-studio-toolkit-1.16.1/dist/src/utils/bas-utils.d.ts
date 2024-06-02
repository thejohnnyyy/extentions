export declare enum ExtensionRunMode {
    desktop = "desktop",
    basRemote = "bas-remote",
    basWorkspace = "bas-workspace",
    basUi = "bas-ui",
    wsl = "wsl",
    unexpected = "unexpected"
}
export declare function shouldRunCtlServer(): boolean;
