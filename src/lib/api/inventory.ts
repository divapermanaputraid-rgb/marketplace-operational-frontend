import { fetchApi } from './client';
import type { 
  InventoryItem, 
  CreateInventoryItemRequest, 
  AdjustStockRequest,
  UpdateInventoryMetadataRequest,
  InventoryMovement,
  InventoryFilters
} from '@/types/inventory';

export const inventoryApi = {
  list: (params?: InventoryFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.product_id) searchParams.append('product_id', params.product_id);
    if (params?.product_variant_id) searchParams.append('product_variant_id', params.product_variant_id);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.location_name) searchParams.append('location_name', params.location_name);
    if (params?.low_stock) searchParams.append('low_stock', params.low_stock);
    
    const qs = searchParams.toString();
    return fetchApi<InventoryItem[]>(`/api/inventory${qs ? `?${qs}` : ''}`);
  },
  
  get: (id: string) => 
    fetchApi<InventoryItem>(`/api/inventory/${id}`),
    
  create: (data: CreateInventoryItemRequest) => 
    fetchApi<InventoryItem>('/api/inventory', { method: 'POST', body: JSON.stringify(data) }),
    
  updateMetadata: (id: string, data: UpdateInventoryMetadataRequest) => 
    fetchApi<InventoryItem>(`/api/inventory/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: (id: string) => 
    fetchApi<null>(`/api/inventory/${id}`, { method: 'DELETE' }),

  adjustStock: (id: string, data: AdjustStockRequest) =>
    fetchApi<null>(`/api/inventory/${id}/movements`, { method: 'POST', body: JSON.stringify(data) }),

  listMovements: (id: string) =>
    fetchApi<InventoryMovement[]>(`/api/inventory/${id}/movements`),

  listAllMovements: (params?: { movement_type?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.movement_type) searchParams.append('movement_type', params.movement_type);
    const qs = searchParams.toString();
    return fetchApi<InventoryMovement[]>(`/api/inventory-movements${qs ? `?${qs}` : ''}`);
  }
};
