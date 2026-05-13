import { fetchApi } from './client';
import type { 
  StoreIntegration, 
  SupportedMarketplace, 
  CredentialResponse,
  IntegrationInitiateResponse,
  IntegrationTestResponse
} from '@/types/integration';

export const integrationsApi = {
  listIntegrations: () => {
    return fetchApi<StoreIntegration[]>('/integrations');
  },
  
  getStoreIntegration: (storeId: string) => {
    return fetchApi<CredentialResponse>(`/stores/${storeId}/integration`);
  },

  listSupportedMarketplaces: () => {
    return fetchApi<SupportedMarketplace[]>('/integrations/marketplaces');
  },

  initiateStoreIntegration: (storeId: string) => {
    return fetchApi<IntegrationInitiateResponse>(`/stores/${storeId}/integration/initiate`, {
      method: 'POST',
    });
  },

  testStoreIntegration: (storeId: string) => {
    return fetchApi<IntegrationTestResponse>(`/stores/${storeId}/integration/test`, {
      method: 'POST',
    });
  },

  disconnectStoreIntegration: (storeId: string) => {
    return fetchApi<{ message: string }>(`/stores/${storeId}/integration/disconnect`, {
      method: 'POST',
    });
  }
};
