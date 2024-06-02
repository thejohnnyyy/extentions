export declare function ssh(opts: {
    host: {
        url: string;
        port: string;
    };
    client: {
        port: string;
    };
    username: string;
    jwt: string;
}): Promise<void>;
