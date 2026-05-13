export declare const API_BASE_URL: any;
export interface APIResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: {
        code: string;
        message: string;
    };
}
export declare class APIError extends Error {
    code: string;
    constructor(message: string, code: string);
}
/**
 * Core fetch wrapper with default headers and error handling
 */
export declare function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T>;
export declare const systemApi: {
    getHealth: () => Promise<{
        status: string;
        service: string;
    }>;
    login: (data: unknown) => Promise<{
        admin: unknown;
        token: string;
    }>;
    logout: () => Promise<unknown>;
    getMe: () => Promise<{
        admin: unknown;
    }>;
    changePassword: (data: unknown) => Promise<unknown>;
};
