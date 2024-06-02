import { Disposable } from "vscode";
import type { AuthenticationProvider, AuthenticationProviderAuthenticationSessionsChangeEvent, AuthenticationSession, Event, SecretStorage } from "vscode";
export declare class BasRemoteAuthenticationProvider implements AuthenticationProvider, Disposable {
    private readonly secretStorage;
    static id: string;
    private secretKey;
    private currentToken;
    private initializedDisposable;
    private _onDidChangeSessions;
    get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent>;
    constructor(secretStorage: SecretStorage);
    dispose(): void;
    private ensureInitialized;
    private checkForUpdates;
    private cacheTokenFromStorage;
    private getTokenByScope;
    getSessions(_scopes?: string[]): Promise<readonly AuthenticationSession[]>;
    createSession(_scopes: string[]): Promise<AuthenticationSession>;
    removeSession(_sessionId: string): Promise<void>;
}
