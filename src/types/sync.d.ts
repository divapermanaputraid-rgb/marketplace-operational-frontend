import type { Store } from './store';
export type SyncMarketplace = 'shopee' | 'tokopedia_shop' | 'tiktok_shop' | 'all';
export type SyncType = 'orders' | 'products' | 'inventory' | 'stock' | 'all';
export type SyncDirection = 'pull' | 'push' | 'bidirectional' | 'internal';
export type SyncJobStatus = 'idle' | 'running' | 'success' | 'failed' | 'skipped' | 'not_configured' | 'disabled';
export type SyncLogStatus = 'started' | 'success' | 'failed' | 'skipped' | 'not_configured';
export interface SyncJob {
    id: string;
    store_id?: string;
    marketplace: SyncMarketplace;
    sync_type: SyncType;
    sync_direction: SyncDirection;
    job_name: string;
    status: SyncJobStatus;
    is_active: boolean;
    schedule_enabled: boolean;
    schedule_interval_minutes?: number;
    last_run_at?: string;
    next_run_at?: string;
    last_success_at?: string;
    last_error?: string;
    created_at: string;
    updated_at: string;
    store?: Store;
}
export interface SyncLog {
    id: string;
    sync_job_id?: string;
    store_id?: string;
    marketplace: SyncMarketplace;
    sync_type: SyncType;
    sync_direction: SyncDirection;
    status: SyncLogStatus;
    message?: string;
    records_processed: number;
    records_created: number;
    records_updated: number;
    records_failed: number;
    error_message?: string;
    started_at?: string;
    finished_at?: string;
    duration_ms?: number;
    raw_summary?: string;
    created_at: string;
    store?: Store;
    sync_job?: SyncJob;
}
export interface CreateSyncJobRequest {
    store_id?: string;
    marketplace: SyncMarketplace;
    sync_type: SyncType;
    sync_direction: SyncDirection;
    job_name: string;
    is_active?: boolean;
    schedule_enabled?: boolean;
    schedule_interval_minutes?: number;
}
export interface UpdateSyncJobRequest {
    job_name?: string;
    status?: SyncJobStatus;
    is_active?: boolean;
    schedule_enabled?: boolean;
    schedule_interval_minutes?: number;
}
export interface SyncJobFilters {
    store_id?: string;
    marketplace?: string;
    sync_type?: string;
    status?: string;
}
export interface SyncLogFilters {
    sync_job_id?: string;
    store_id?: string;
    marketplace?: string;
    sync_type?: string;
    status?: string;
    date_from?: string;
    date_to?: string;
}
