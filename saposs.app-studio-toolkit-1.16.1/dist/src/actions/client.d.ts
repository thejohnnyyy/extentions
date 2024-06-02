/// <reference types="vscode" />
import { BasAction } from "@sap-devx/app-studio-toolkit-types";
export declare const performAction: <T = void>(action: BasAction, options?: any) => Thenable<T>;
