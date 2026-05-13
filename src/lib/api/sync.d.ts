import type { SyncJob, SyncLog, CreateSyncJobRequest, UpdateSyncJobRequest, SyncJobFilters, SyncLogFilters } from '@/types/sync';
export declare const syncApi: {
    listJobs: (params?: SyncJobFilters) => Promise<SyncJob[]>;
    getJob: (id: string) => Promise<SyncJob>;
    createJob: (data: CreateSyncJobRequest) => Promise<SyncJob>;
    updateJob: (id: string, data: UpdateSyncJobRequest) => Promise<SyncJob>;
    deleteJob: (id: string) => Promise<null>;
    runJob: (id: string) => Promise<SyncJob>;
    listLogs: (params?: SyncLogFilters) => Promise<SyncLog[]>;
    listLogsByJob: (id: string) => Promise<SyncLog[]>;
};
