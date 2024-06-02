export declare const SSHD_SOCKET_PORT = 33765;
export declare const SSH_SOCKET_PORT = 443;
export interface DevSpaceNode {
    label: string;
    id: string;
    landscapeUrl: string;
    wsUrl: string;
}
export interface SSHConfigInfo {
    name: string;
    port: string;
}
export declare function getPK(landscapeUrl: string, wsId: string): Promise<string>;
export declare function savePK(pk: string, urlStr: string): string;
export declare function deletePK(wsUrl: string): void;
export declare function updateSSHConfig(sshKeyFilePath: string, devSpace: DevSpaceNode): SSHConfigInfo;
export declare function removeSSHConfig(devSpace: DevSpaceNode): void;
export declare function updateRemotePlatformSetting(config: SSHConfigInfo): Promise<void>;
export declare function cleanRemotePlatformSetting(devSpace: DevSpaceNode): Promise<void>;
export declare function runChannelClient(opt: {
    host: string;
    landscape: string;
    localPort: string;
}): Promise<void>;
export declare function getRandomArbitrary(min?: number, max?: number): number;
