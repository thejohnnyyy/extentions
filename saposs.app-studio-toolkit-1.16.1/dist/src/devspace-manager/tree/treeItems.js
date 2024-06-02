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
exports.LandscapeNode = exports.DevSpaceNode = exports.LoadingNode = exports.EmptyNode = exports.TreeNode = exports.getSvgIconPath = void 0;
const vscode_1 = require("vscode");
const path = __importStar(require("path"));
const messages_1 = require("../common/messages");
const sdk = __importStar(require("@sap/bas-sdk"));
const devspace_1 = require("../devspace/devspace");
const ts_enum_util_1 = require("ts-enum-util");
const lodash_1 = require("lodash");
const logger_1 = require("../../logger/logger");
function getSvgIconPath(extensionPath, iconName) {
    const icons = {
        landscape: { path: "common", name: "land.svg" },
        basic_error: { path: "devspace", name: "basic_error.svg" },
        basic_running: { path: "devspace", name: "basic_running.svg" },
        basic_not_running: { path: "devspace", name: "basic_not_running.svg" },
        basic_transitioning: { path: "devspace", name: "basic_transitioning.svg" },
        cap_error: { path: "devspace", name: "cap_error.svg" },
        cap_running: { path: "devspace", name: "cap_running.svg" },
        cap_not_running: { path: "devspace", name: "cap_not_running.svg" },
        cap_transitioning: { path: "devspace", name: "cap_transitioning.svg" },
        fiori_error: { path: "devspace", name: "fiori_error.svg" },
        fiori_running: { path: "devspace", name: "fiori_running.svg" },
        fiori_not_running: { path: "devspace", name: "fiori_not_running.svg" },
        fiori_transitioning: { path: "devspace", name: "fiori_transitioning.svg" },
        sme_error: { path: "devspace", name: "sme_error" },
        sme_running: { path: "devspace", name: "sme_running.svg" },
        sme_not_running: { path: "devspace", name: "sme_not_running.svg" },
        sme_transitioning: { path: "devspace", name: "sme_transitioning.svg" },
        mobile_error: { path: "devspace", name: "mobile_error.svg" },
        mobile_running: { path: "devspace", name: "mobile_running.svg" },
        mobile_not_running: { path: "devspace", name: "mobile_not_running.svg" },
        mobile_transitioning: {
            path: "devspace",
            name: "mobile_transitioning.svg",
        },
        hana_error: { path: "devspace", name: "hana_error.svg" },
        hana_running: { path: "devspace", name: "hana_running.svg" },
        hana_not_running: { path: "devspace", name: "hana_not_running.svg" },
        hana_transitioning: { path: "devspace", name: "hana_transitioning.svg" },
        lcap_error: { path: "devspace", name: "mobile_error.svg" },
        lcap_running: { path: "devspace", name: "cloud_running.svg" },
        lcap_not_running: { path: "devspace", name: "cloud_not_running.svg" },
        lcap_transitioning: { path: "devspace", name: "cloud_transitioning.svg" },
    };
    let iconPath = "";
    const property = (0, lodash_1.get)(icons, iconName);
    if (property) {
        iconPath = {
            light: path.join(extensionPath, "resources", property.path, "light", property.name),
            dark: path.join(extensionPath, "resources", property.path, "dark", property.name),
        };
    }
    else {
        (0, logger_1.getLogger)().error(messages_1.messages.lbl_icon_missing(iconName));
    }
    return iconPath;
}
exports.getSvgIconPath = getSvgIconPath;
class TreeNode extends vscode_1.TreeItem {
    constructor(label, collapsibleState, iconPath, parentName, contextValue, command, tooltip, description) {
        super(label, collapsibleState);
        this.label = label;
        this.collapsibleState = collapsibleState;
        this.iconPath = iconPath;
        this.parentName = parentName;
        this.contextValue = contextValue;
        this.command = command;
        this.tooltip = tooltip;
        this.description = description;
    }
}
exports.TreeNode = TreeNode;
class EmptyNode extends TreeNode {
    constructor(label, state) {
        super(label, state !== null && state !== void 0 ? state : vscode_1.TreeItemCollapsibleState.None, ``, ``);
    }
    getChildren() {
        return Promise.resolve([]);
    }
}
exports.EmptyNode = EmptyNode;
class LoadingNode extends EmptyNode {
    constructor(state) {
        super(messages_1.messages.lbl_dev_space_explorer_loading, state);
    }
}
exports.LoadingNode = LoadingNode;
class DevSpaceNode extends TreeNode {
    constructor(label, collapsibleState, iconPath, parentName, landscapeName, landscapeUrl, wsUrl, id, status, contextValue, tooltip, description) {
        super(label, collapsibleState, iconPath, parentName, contextValue, undefined, tooltip, description);
        this.landscapeName = landscapeName;
        this.landscapeUrl = landscapeUrl;
        this.wsUrl = wsUrl;
        this.id = id;
        this.status = status;
    }
    getChildren(element) {
        return Promise.resolve([]);
    }
}
exports.DevSpaceNode = DevSpaceNode;
class LandscapeNode extends TreeNode {
    constructor(extensionPath, label, collapsibleState, iconPath, parentName, tooltip, name, url, contextValue) {
        super(label, collapsibleState, iconPath, parentName, contextValue, undefined, tooltip);
        this.extensionPath = extensionPath;
        this.name = name;
        this.url = url;
    }
    getLabel(devSpace) {
        switch (devSpace.status) {
            case sdk.devspace.DevSpaceStatus.RUNNING:
            case sdk.devspace.DevSpaceStatus.STOPPED:
                return devSpace.devspaceDisplayName;
            case sdk.devspace.DevSpaceStatus.STARTING:
            case sdk.devspace.DevSpaceStatus.STOPPING:
            case sdk.devspace.DevSpaceStatus.SAFE_MODE:
            case sdk.devspace.DevSpaceStatus.ERROR:
                return `${devSpace.devspaceDisplayName} (${devSpace.status.toLowerCase()})`;
            default: {
                this.assertUnreachable(devSpace.status);
            }
        }
    }
    assertUnreachable(_x) {
        throw new Error(messages_1.messages.err_assert_unreachable);
    }
    getIconPath(devSpace) {
        const packName = (0, ts_enum_util_1.$enum)(sdk.devspace.PackName)
            .getKeyOrDefault(devSpace.pack, `BASIC`)
            .toLowerCase();
        switch (devSpace.status) {
            case sdk.devspace.DevSpaceStatus.RUNNING: {
                return getSvgIconPath(this.extensionPath, `${packName}_${messages_1.messages.lbl_devspace_status_runnig}`);
            }
            case sdk.devspace.DevSpaceStatus.STARTING:
            case sdk.devspace.DevSpaceStatus.STOPPING: {
                return getSvgIconPath(this.extensionPath, `${packName}_${messages_1.messages.lbl_devspace_status_transitioning}`);
            }
            case sdk.devspace.DevSpaceStatus.STOPPED: {
                return getSvgIconPath(this.extensionPath, `${packName}_${messages_1.messages.lbl_devspace_status_not_runnig}`);
            }
            case sdk.devspace.DevSpaceStatus.SAFE_MODE:
            case sdk.devspace.DevSpaceStatus.ERROR:
                return getSvgIconPath(this.extensionPath, `${packName}_${messages_1.messages.lbl_devspace_status_error}`);
            default:
                this.assertUnreachable(devSpace.status);
        }
    }
    getContextView(devSpace) {
        switch (devSpace.status) {
            case sdk.devspace.DevSpaceStatus.RUNNING:
                return messages_1.messages.lbl_devspace_context_runnig;
            case sdk.devspace.DevSpaceStatus.STOPPED:
                return messages_1.messages.lbl_devspace_context_stopped;
            case sdk.devspace.DevSpaceStatus.STARTING:
            case sdk.devspace.DevSpaceStatus.STOPPING:
                return messages_1.messages.lbl_devspace_context_transitioning;
            case sdk.devspace.DevSpaceStatus.SAFE_MODE:
            case sdk.devspace.DevSpaceStatus.ERROR:
                return messages_1.messages.lbl_devspace_context_error;
            default:
                this.assertUnreachable(devSpace.status);
        }
    }
    async getChildren(element) {
        var _a;
        const devSpaces = /log-in/g.test((_a = element.contextValue) !== null && _a !== void 0 ? _a : "")
            ? await (0, devspace_1.getDevSpaces)(element.url)
            : undefined;
        let devSpaceNodes;
        if (!devSpaces) {
            devSpaceNodes = [
                new EmptyNode(messages_1.messages.lbl_dev_space_explorer_authentication_failure),
            ];
        }
        else {
            devSpaceNodes = (0, lodash_1.isEmpty)(devSpaces)
                ? [new EmptyNode(messages_1.messages.lbl_dev_space_explorer_no_dev_spaces)]
                : (0, lodash_1.compact)((0, lodash_1.map)(devSpaces, (devSpace) => {
                    var _a, _b;
                    return new DevSpaceNode(this.getLabel(devSpace), vscode_1.TreeItemCollapsibleState.None, this.getIconPath(devSpace), (_a = element.label) !== null && _a !== void 0 ? _a : "", (_b = element.name) !== null && _b !== void 0 ? _b : "", element.url, devSpace.url, devSpace.id, devSpace.status, this.getContextView(devSpace), devSpace.id, devSpace.packDisplayName);
                }));
        }
        return devSpaceNodes;
    }
}
exports.LandscapeNode = LandscapeNode;
//# sourceMappingURL=treeItems.js.map