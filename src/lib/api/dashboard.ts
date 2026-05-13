import { fetchApi } from './client';
import type { DashboardSummary } from '@/types/dashboard';

export const dashboardApi = {
  getSummary: () => fetchApi<DashboardSummary>('/api/dashboard/summary'),
};
