"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWorkspaceProxy = void 0;
function createWorkspaceProxy(workspaceImpl) {
    const basWsAPI = {
        getProjects: (...args) => workspaceImpl.getProjects(...args),
        getProject: (...args) => workspaceImpl.getProject(...args),
        getProjectUris: (...args) => workspaceImpl.getProjectUris(...args),
        onWorkspaceChanged: (...args) => workspaceImpl.onWorkspaceChanged(...args),
        getPluginManager: (...args) => workspaceImpl.getPluginManager(...args),
    };
    Object.freeze(basWsAPI);
    // TODO: discuss this with the @sap/artifact-management owners.
    //       could it be caused by our patches (with npm-patch-package)?
    // @ts-expect-error -- https://github.com/microsoft/TypeScript/issues/26559
    return basWsAPI;
}
exports.createWorkspaceProxy = createWorkspaceProxy;
//# sourceMappingURL=create-workspace-proxy.js.map