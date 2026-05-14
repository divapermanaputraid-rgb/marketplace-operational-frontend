import { fetchApi } from './client';
import type { 
  Order, 
  CreateOrderRequest, 
  UpdateOrderRequest,
  OrderFilters 
} from '@/types/order';
import type { InventoryReservationResult } from '@/types/inventory';

export const ordersApi = {
  list: (params?: OrderFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.marketplace) searchParams.append('marketplace', params.marketplace);
    if (params?.order_status) searchParams.append('order_status', params.order_status);
    if (params?.payment_status) searchParams.append('payment_status', params.payment_status);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    
    const qs = searchParams.toString();
    return fetchApi<Order[]>(`/api/orders${qs ? `?${qs}` : ''}`);
  },
  
  get: (id: string) => 
    fetchApi<Order>(`/api/orders/${id}`),
    
  create: (data: CreateOrderRequest) => 
    fetchApi<Order>('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
    
  update: (id: string, data: UpdateOrderRequest) => 
    fetchApi<Order>(`/api/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  delete: (id: string) => 
    fetchApi<null>(`/api/orders/${id}`, { method: 'DELETE' }),

  reserveStock: (id: string) =>
    fetchApi<InventoryReservationResult>(`/api/orders/${id}/reserve-stock`, { method: 'POST' }),

  releaseReservation: (id: string) =>
    fetchApi<InventoryReservationResult>(`/api/orders/${id}/release-reservation`, { method: 'POST' }),

  confirmSale: (id: string) =>
    fetchApi<InventoryReservationResult>(`/api/orders/${id}/confirm-sale`, { method: 'POST' }),
};

