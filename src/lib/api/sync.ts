import { fetchApi } from './client';
import type { 
  SyncJob, 
  SyncLog,
  CreateSyncJobRequest, 
  UpdateSyncJobRequest,
  SyncJobFilters,
  SyncLogFilters,
  RunJobResult
} from '@/types/sync';

export const syncApi = {
  listJobs: (params?: SyncJobFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.marketplace) searchParams.append('marketplace', params.marketplace);
    if (params?.sync_type) searchParams.append('sync_type', params.sync_type);
    if (params?.status) searchParams.append('status', params.status);
    
    const qs = searchParams.toString();
    return fetchApi<SyncJob[]>(`/api/sync/jobs${qs ? `?${qs}` : ''}`);
  },
  
  getJob: (id: string) => 
    fetchApi<SyncJob>(`/api/sync/jobs/${id}`),
    
  createJob: (data: CreateSyncJobRequest) => 
    fetchApi<SyncJob>('/api/sync/jobs', { method: 'POST', body: JSON.stringify(data) }),
    
  updateJob: (id: string, data: UpdateSyncJobRequest) => 
    fetchApi<SyncJob>(`/api/sync/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    
  deleteJob: (id: string) => 
    fetchApi<null>(`/api/sync/jobs/${id}`, { method: 'DELETE' }),

  runJob: (id: string) =>
    fetchApi<RunJobResult>(`/api/sync/jobs/${id}/run`, { method: 'POST' }),

  listLogs: (params?: SyncLogFilters) => {
    const searchParams = new URLSearchParams();
    if (params?.sync_job_id) searchParams.append('sync_job_id', params.sync_job_id);
    if (params?.store_id) searchParams.append('store_id', params.store_id);
    if (params?.marketplace) searchParams.append('marketplace', params.marketplace);
    if (params?.sync_type) searchParams.append('sync_type', params.sync_type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);

    const qs = searchParams.toString();
    return fetchApi<SyncLog[]>(`/api/sync/logs${qs ? `?${qs}` : ''}`);
  },

  listLogsByJob: (id: string) =>
    fetchApi<SyncLog[]>(`/api/sync/jobs/${id}/logs`),
};
