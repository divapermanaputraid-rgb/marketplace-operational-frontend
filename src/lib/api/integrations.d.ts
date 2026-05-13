import type { StoreIntegration, SupportedMarketplace, CredentialResponse, IntegrationInitiateResponse, IntegrationTestResponse, PullOrdersResponse } from '@/types/integration';
export declare const integrationsApi: {
    listIntegrations: () => Promise<StoreIntegration[]>;
    getStoreIntegration: (storeId: string) => Promise<CredentialResponse>;
    listSupportedMarketplaces: () => Promise<SupportedMarketplace[]>;
    initiateStoreIntegration: (storeId: string) => Promise<IntegrationInitiateResponse>;
    testStoreIntegration: (storeId: string) => Promise<IntegrationTestResponse>;
    disconnectStoreIntegration: (storeId: string) => Promise<{
        message: string;
    }>;
    pullOrders: (storeId: string, params: {
        time_from: number;
        time_to: number;
        order_status?: string;
        page_size?: number;
    }) => Promise<PullOrdersResponse>;
};
