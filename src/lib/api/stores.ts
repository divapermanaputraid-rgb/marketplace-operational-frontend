import { fetchApi } from './client';
import type { Store, CreateStoreRequest, UpdateStoreRequest } from '@/types/store';

export const storesApi = {
  list: (params?: { marketplace?: string; connection_status?: string; search?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.marketplace) searchParams.append('marketplace', params.marketplace);
    if (params?.connection_status) searchParams.append('connection_status', params.connection_status);
    if (params?.search) searchParams.append('search', params.search);
    
    const qs = searchParams.toString();
    return fetchApi<Store[]>(`/api/stores${qs ? `?${qs}` : ''}`);
  },
  
  get: (id: string) => 
    fetchApi<Store>(`/api/stores/${id}`),
    
  create: (data: CreateStoreRequest) => 
    fetchApi<Store>('/api/stores', { method: 'POST', body: JSON.stringify(data) }),
    
  update: (id: string, data: UpdateStoreRequest) => 
    fetchApi<Store>(`/api/stores/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: (id: string) => 
    fetchApi<null>(`/api/stores/${id}`, { method: 'DELETE' }),
};
