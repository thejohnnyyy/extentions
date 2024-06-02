"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDevSpaces = void 0;
const vscode_1 = require("vscode");
const logger_1 = require("../../logger/logger");
const messages_1 = require("../common/messages");
const sdk = __importStar(require("@sap/bas-sdk"));
const auth_utils_1 = require("../../authentication/auth-utils");
const ts_enum_util_1 = require("ts-enum-util");
function patchPack(pack) {
    // known mishmash : `SAP HANA Public` vs. `SAP Hana`
    return pack.toLowerCase().startsWith(sdk.devspace.PackName.HANA.toLowerCase())
        ? sdk.devspace.PackName.HANA
        : pack;
}
async function getDevSpaces(landscapeUrl) {
    return (0, auth_utils_1.getJwt)(landscapeUrl)
        .then((jwt) => {
        return sdk.devspace
            .getDevSpaces(landscapeUrl, jwt)
            .then((devspaces) => {
            return devspaces.reduce((acc, ds) => {
                acc.push({
                    devspaceDisplayName: ds.devspaceDisplayName,
                    devspaceOrigin: ds.devspaceOrigin,
                    pack: patchPack(ds.pack),
                    packDisplayName: ds.packDisplayName,
                    url: ds.url,
                    id: ds.id,
                    optionalExtensions: ds.optionalExtensions,
                    technicalExtensions: ds.technicalExtensions,
                    status: (0, ts_enum_util_1.$enum)(sdk.devspace.DevSpaceStatus).asKeyOrDefault(ds.status, "ERROR"),
                });
                return acc;
            }, []);
        });
    })
        .catch((e) => {
        const message = messages_1.messages.err_get_devspace(e.toString());
        (0, logger_1.getLogger)().error(message);
        void vscode_1.window.showErrorMessage(message);
    });
}
exports.getDevSpaces = getDevSpaces;
//# sourceMappingURL=devspace.js.map