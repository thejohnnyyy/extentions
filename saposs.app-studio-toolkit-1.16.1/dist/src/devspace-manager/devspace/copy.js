"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cmdCopyWsId = void 0;
const vscode_1 = require("vscode");
const messages_1 = require("../common/messages");
const logger_1 = require("../../../src/logger/logger");
async function cmdCopyWsId(devSpace) {
    try {
        await vscode_1.env.clipboard.writeText(devSpace.id);
        void vscode_1.window.showInformationMessage(messages_1.messages.info_wsid_copied);
    }
    catch (err) {
        (0, logger_1.getLogger)().error(messages_1.messages.err_copy_devspace_id(err.message));
        void vscode_1.window.showErrorMessage(messages_1.messages.err_copy_devspace_id(err.message));
    }
}
exports.cmdCopyWsId = cmdCopyWsId;
//# sourceMappingURL=copy.js.map