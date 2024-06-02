"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBasToolkitAPI = void 0;
const create_workspace_proxy_1 = require("./create-workspace-proxy");
function createBasToolkitAPI(workspaceImpl, baseBasToolkitAPI) {
    const workspaceAPI = (0, create_workspace_proxy_1.createWorkspaceProxy)(workspaceImpl);
    const exportedBasToolkitAPI = Object.assign(Object.assign({}, baseBasToolkitAPI), { workspaceAPI });
    // "Immutability Changes Everything"
    // note we are not "deep" freezing because the usage of namespaces on the API
    // is expected to be removed.
    Object.freeze(exportedBasToolkitAPI);
    return exportedBasToolkitAPI;
}
exports.createBasToolkitAPI = createBasToolkitAPI;
//# sourceMappingURL=create-bas-toolkit-api.js.map