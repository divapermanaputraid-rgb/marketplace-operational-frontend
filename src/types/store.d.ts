export interface Store {
    id: string;
    marketplace: 'shopee' | 'tokopedia_shop' | 'tiktok_shop';
    store_name: string;
    store_url?: string;
    external_store_id?: string;
    connection_status: 'not_connected' | 'connected' | 'token_expired' | 'sync_error' | 'disabled';
    is_active: boolean;
    notes?: string;
    last_sync_at?: string;
    created_at: string;
    updated_at: string;
}
export interface CreateStoreRequest {
    marketplace: 'shopee' | 'tokopedia_shop' | 'tiktok_shop';
    store_name: string;
    store_url?: string;
    external_store_id?: string;
    notes?: string;
}
export interface UpdateStoreRequest {
    store_name?: string;
    store_url?: string;
    external_store_id?: string;
    notes?: string;
    is_active?: boolean;
}
