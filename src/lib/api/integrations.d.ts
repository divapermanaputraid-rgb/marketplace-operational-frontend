import type { StoreIntegration, SupportedMarketplace, CredentialResponse, IntegrationInitiateResponse, IntegrationTestResponse, PullOrdersRequest, PullOrdersResult } from '@/types/integration';
export declare const integrationsApi: {
    listIntegrations: () => Promise<StoreIntegration[]>;
    getStoreIntegration: (storeId: string) => Promise<CredentialResponse>;
    listSupportedMarketplaces: () => Promise<SupportedMarketplace[]>;
    initiateStoreIntegration: (storeId: string) => Promise<IntegrationInitiateResponse>;
    testStoreIntegration: (storeId: string) => Promise<IntegrationTestResponse>;
    disconnectStoreIntegration: (storeId: string) => Promise<{
        message: string;
    }>;
    pullShopeeOrders: (storeId: string, params: PullOrdersRequest) => Promise<PullOrdersResult>;
};
