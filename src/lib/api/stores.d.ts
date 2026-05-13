import type { Store, CreateStoreRequest, UpdateStoreRequest } from '@/types/store';
export declare const storesApi: {
    list: (params?: {
        marketplace?: string;
        connection_status?: string;
        search?: string;
    }) => Promise<Store[]>;
    get: (id: string) => Promise<Store>;
    create: (data: CreateStoreRequest) => Promise<Store>;
    update: (id: string, data: UpdateStoreRequest) => Promise<Store>;
    delete: (id: string) => Promise<null>;
};
