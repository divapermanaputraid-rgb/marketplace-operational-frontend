import { fetchApi } from './client';
import type { 
  OrdersReport, 
  InventoryReport, 
  ProductsReport, 
  SyncReport 
} from '@/types/reports';

export const reportsApi = {
  getOrders: () => fetchApi<OrdersReport>('/api/reports/orders'),
  getInventory: () => fetchApi<InventoryReport>('/api/reports/inventory'),
  getProducts: () => fetchApi<ProductsReport>('/api/reports/products'),
  getSync: () => fetchApi<SyncReport>('/api/reports/sync'),
};
