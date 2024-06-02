export declare const JWT_TIMEOUT: number;
export declare function timeUntilJwtExpires(jwt: string): number;
export declare function retrieveJwt(landscapeUrl: string): Promise<string | void>;
export declare function getJwt(landscapeUrl: string): Promise<string>;
export declare function hasJwt(landscapeUrl: string): Promise<boolean>;
