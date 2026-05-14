import { fetchApi } from './client';
import type { 
  StoreIntegration, 
  SupportedMarketplace, 
  CredentialResponse,
  IntegrationInitiateResponse,
  IntegrationTestResponse,
  PullOrdersRequest,
  PullOrdersResult
} from '@/types/integration';

export const integrationsApi = {
  listIntegrations: () => {
    return fetchApi<StoreIntegration[]>('/api/integrations');
  },
  
  getStoreIntegration: (storeId: string) => {
    return fetchApi<CredentialResponse>(`/api/stores/${storeId}/integration`);
  },

  listSupportedMarketplaces: () => {
    return fetchApi<SupportedMarketplace[]>('/api/integrations/marketplaces');
  },

  initiateStoreIntegration: (storeId: string) => {
    return fetchApi<IntegrationInitiateResponse>(`/api/stores/${storeId}/integration/initiate`, {
      method: 'POST',
    });
  },

  testStoreIntegration: (storeId: string) => {
    return fetchApi<IntegrationTestResponse>(`/api/stores/${storeId}/integration/test`, {
      method: 'POST',
    });
  },

  disconnectStoreIntegration: (storeId: string) => {
    return fetchApi<{ message: string }>(`/api/stores/${storeId}/integration/disconnect`, {
      method: 'POST',
    });
  },

  pullShopeeOrders: (storeId: string, params: PullOrdersRequest) => {
    return fetchApi<PullOrdersResult>(`/api/stores/${storeId}/integration/orders/pull`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
};



