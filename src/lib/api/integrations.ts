import { fetchApi } from './client';
import type { 
  StoreIntegration, 
  SupportedMarketplace, 
  CredentialResponse,
  IntegrationInitiateResponse,
  IntegrationTestResponse,
  PullOrdersRequest,
  PullOrdersResult,
  MappingCandidatesRequest,
  MappingCandidatesResult,
  CreateShopeeMappingRequest,
  CreateShopeeMappingResult,
  PushStockRequest,
  PushStockResult
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
  },

  getShopeeMappingCandidates: (storeId: string, params: MappingCandidatesRequest) => {
    return fetchApi<MappingCandidatesResult>(`/api/stores/${storeId}/integration/products/mapping-candidates`, {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  createShopeeProductMapping: (storeId: string, payload: CreateShopeeMappingRequest) => {
    return fetchApi<CreateShopeeMappingResult>(`/api/stores/${storeId}/integration/products/mappings`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  pushStock: (storeId: string, payload: PushStockRequest) => {
    return fetchApi<PushStockResult>(`/api/stores/${storeId}/integration/stock/push`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
};
