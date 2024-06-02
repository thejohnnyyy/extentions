"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssh = void 0;
const websocket_1 = require("websocket");
const dev_tunnels_ssh_1 = require("@microsoft/dev-tunnels-ssh");
const dev_tunnels_ssh_tcp_1 = require("@microsoft/dev-tunnels-ssh-tcp");
const logger_1 = require("../logger/logger");
const sessionMap = new Map();
/* istanbul ignore next */
class WebSocketClientStream extends dev_tunnels_ssh_1.BaseStream {
    constructor(websocket) {
        super();
        this.websocket = websocket;
        websocket.on("message", (data) => {
            if (data.type === "binary") {
                this.onData(data.binaryData);
            }
        });
        websocket.on("close", (code, reason) => {
            if (!code) {
                this.onEnd();
            }
            else {
                const error = new Error(reason);
                error.code = code;
                this.onError(error);
            }
        });
    }
    async write(data) {
        if (this.disposed) {
            throw new dev_tunnels_ssh_1.ObjectDisposedError(this);
        }
        if (!data) {
            throw new TypeError("Data is required.");
        }
        this.websocket.send(data);
        return Promise.resolve();
    }
    async close(error) {
        if (this.disposed) {
            throw new dev_tunnels_ssh_1.ObjectDisposedError(this);
        }
        if (!error) {
            this.websocket.close();
        }
        else {
            this.websocket.drop(error.code, error.message);
        }
        this.disposed = true;
        this.closedEmitter.fire({ error });
        this.onError(error || new Error("Stream closed."));
        return Promise.resolve();
    }
    dispose() {
        if (!this.disposed) {
            this.websocket.close();
        }
        super.dispose();
    }
}
/* istanbul ignore next */
async function ssh(opts) {
    const serverUri = `wss://${opts.host.url}:${opts.host.port}`;
    // close the opened session if exists
    const isContinue = new Promise((res) => {
        const session = sessionMap.get(serverUri);
        if (session) {
            void session
                .close(dev_tunnels_ssh_1.SshDisconnectReason.byApplication)
                .finally(() => res(true));
        }
        else {
            res(true);
        }
    });
    await isContinue;
    const config = new dev_tunnels_ssh_1.SshSessionConfiguration();
    config.keyExchangeAlgorithms.push(dev_tunnels_ssh_1.SshAlgorithms.keyExchange.ecdhNistp521Sha512);
    config.publicKeyAlgorithms.push(dev_tunnels_ssh_1.SshAlgorithms.publicKey.ecdsaSha2Nistp521);
    config.publicKeyAlgorithms.push(dev_tunnels_ssh_1.SshAlgorithms.publicKey.rsa2048);
    config.encryptionAlgorithms.push(dev_tunnels_ssh_1.SshAlgorithms.encryption.aes256Gcm);
    config.protocolExtensions.push(dev_tunnels_ssh_1.SshProtocolExtensionNames.sessionReconnect);
    config.protocolExtensions.push(dev_tunnels_ssh_1.SshProtocolExtensionNames.sessionLatency);
    config.addService(dev_tunnels_ssh_tcp_1.PortForwardingService);
    const wsClient = new websocket_1.client();
    wsClient.connect(serverUri, "ssh", undefined, {
        Authorization: `bearer ${opts.jwt}`,
    });
    const stream = await new Promise((resolve, reject) => {
        wsClient.on("connect", (connection) => {
            resolve(new WebSocketClientStream(connection));
        });
        wsClient.on("connectFailed", function error(e) {
            reject(new Error(`Failed to connect to server at ${serverUri}:${e}`));
        });
    });
    return new Promise((resolve, reject) => {
        const session = new dev_tunnels_ssh_1.SshClientSession(config);
        sessionMap.set(serverUri, session);
        void session
            .connect(stream)
            .then(() => {
            void session.onAuthenticating((e) => {
                // there is no authentication in this solution
                e.authenticationPromise = Promise.resolve({});
            });
            // authorise client by name 'user'
            void session.authenticateClient({
                username: opts.username,
                publicKeys: [],
            });
            const pfs = session.activateService(dev_tunnels_ssh_tcp_1.PortForwardingService);
            void pfs
                .forwardToRemotePort("127.0.0.1", parseInt(opts.client.port, 10), "127.0.0.1", 2222)
                .then(() => {
                (0, logger_1.getLogger)().debug(`ssh session connected`);
            });
        })
            .catch((e) => {
            (0, logger_1.getLogger)().error(`ssh session droped : ${e.message}`);
            reject(e);
        });
    });
}
exports.ssh = ssh;
//# sourceMappingURL=ssh.js.map