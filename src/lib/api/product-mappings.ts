import { fetchApi } from './client';
import type { 
  ProductMapping, 
  CreateProductMappingRequest, 
  UpdateProductMappingRequest,
  ProductMappingFilters 
} from '@/types/product-mapping';

export const productMappingsApi = {
  list: (params?: ProductMappingFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.product_id) searchParams.append('product_id', params.product_id);
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.marketplace) searchParams.append('marketplace', params.marketplace);
    if (params?.listing_status) searchParams.append('listing_status', params.listing_status);
    if (params?.search) searchParams.append('search', params.search);
    
    const qs = searchParams.toString();
    return fetchApi<ProductMapping[]>(`/api/product-mappings${qs ? `?${qs}` : ''}`);
  },
  
  get: (id: string) => 
    fetchApi<ProductMapping>(`/api/product-mappings/${id}`),
    
  create: (data: CreateProductMappingRequest) => 
    fetchApi<ProductMapping>('/api/product-mappings', { method: 'POST', body: JSON.stringify(data) }),
    
  update: (id: string, data: UpdateProductMappingRequest) => 
    fetchApi<ProductMapping>(`/api/product-mappings/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: (id: string) => 
    fetchApi<null>(`/api/product-mappings/${id}`, { method: 'DELETE' }),

  listByProduct: (productId: string) =>
    fetchApi<ProductMapping[]>(`/api/products/${productId}/mappings`),

  listByStore: (storeId: string) =>
    fetchApi<ProductMapping[]>(`/api/stores/${storeId}/product-mappings`),
};
