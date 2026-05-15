import { fetchApi } from './client';
import type { DashboardSummary, ShopeeOperationsSummary } from '@/types/dashboard';

export const dashboardApi = {
  getSummary: () => fetchApi<DashboardSummary>('/api/dashboard/summary'),
  getShopeeOperations: () => fetchApi<ShopeeOperationsSummary>('/api/dashboard/shopee-operations'),
};
