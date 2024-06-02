"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdOpenInVSCode = void 0;
const url_1 = require("url");
const vscode_1 = require("vscode");
function cmdOpenInVSCode() {
    void vscode_1.env.openExternal(vscode_1.Uri.parse(`vscode://SAPOSS.app-studio-toolkit/open?landscape=${new url_1.URL(process.env.H2O_URL || ``).hostname}&devspaceid=${(process.env.WORKSPACE_ID || ``)
        .split(`-`)
        .slice(1)
        .join(`-`)}`));
}
exports.cmdOpenInVSCode = cmdOpenInVSCode;
//# sourceMappingURL=open.js.map