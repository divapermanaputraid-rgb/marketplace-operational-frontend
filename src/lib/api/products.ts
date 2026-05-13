import { fetchApi } from './client';
import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product';

export const productsApi = {
  list: (params?: { status?: string; category?: string; search?: string; sku?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sku) searchParams.append('sku', params.sku);
    
    const qs = searchParams.toString();
    return fetchApi<Product[]>(`/api/products${qs ? `?${qs}` : ''}`);
  },
  
  get: (id: string) => 
    fetchApi<Product>(`/api/products/${id}`),
    
  create: (data: CreateProductRequest) => 
    fetchApi<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) }),
    
  update: (id: string, data: UpdateProductRequest) => 
    fetchApi<Product>(`/api/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: (id: string) => 
    fetchApi<null>(`/api/products/${id}`, { method: 'DELETE' }),
};
