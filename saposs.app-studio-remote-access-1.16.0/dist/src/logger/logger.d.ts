import type { ExtensionContext } from "vscode";
import { IVSCodeExtLogger } from "@vscode-logging/types";
export declare const LOGGING_LEVEL_CONFIG_PROP = "app-studio-remote-access.logging.level";
export declare const SOURCE_TRACKING_CONFIG_PROP = "app-studio-remote-access.logging.sourceLocationTracking";
/**
 * Note the use of a getter function so the value would be lazy resolved on each use.
 * This enables concise and simple consumption of the Logger throughout our extension.
 */
export declare function getLogger(): IVSCodeExtLogger;
export declare function initLogger(context: ExtensionContext): void;
