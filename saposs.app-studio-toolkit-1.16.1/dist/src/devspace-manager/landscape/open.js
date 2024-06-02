"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdLandscapeOpenDevSpaceManager = void 0;
const vscode_1 = require("vscode");
async function cmdLandscapeOpenDevSpaceManager(landscape) {
    return vscode_1.env.openExternal(vscode_1.Uri.parse(landscape.url));
}
exports.cmdLandscapeOpenDevSpaceManager = cmdLandscapeOpenDevSpaceManager;
//# sourceMappingURL=open.js.map