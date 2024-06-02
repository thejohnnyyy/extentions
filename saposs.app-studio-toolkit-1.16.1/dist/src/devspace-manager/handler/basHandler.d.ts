import { EventEmitter } from "vscode";
import type { UriHandler } from "vscode";
import { DevSpaceDataProvider } from "../tree/devSpacesProvider";
export interface LoginEvent {
    jwt?: string;
}
export declare const eventEmitter: EventEmitter<LoginEvent>;
export declare function getBasUriHandler(devSpacesProvider: DevSpaceDataProvider): UriHandler;
