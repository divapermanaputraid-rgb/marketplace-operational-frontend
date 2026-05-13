export interface CredentialResponse {
  id: string;
  store_id: string;
  marketplace: string;
  connection_status: 'not_configured' | 'pending_authorization' | 'connected' | 'expired' | 'failed' | 'disconnected';
  app_id?: string;
  has_access_token: boolean;
  has_refresh_token: boolean;
  access_token_expires_at?: string;
  refresh_token_expires_at?: string;
  scopes?: string;
  last_connected_at?: string;
  last_refreshed_at?: string;
  last_err?: string;
  created_at: string;
  updated_at: string;
}

export interface StoreIntegration {
  store_id: string;
  store_name: string;
  marketplace: string;
  integration: CredentialResponse | null;
}

export interface SupportedMarketplace {
  id: string;
  name: string;
  description: string;
}

export interface IntegrationInitiateResponse {
  message: string;
  authorization_url?: string;
}

export interface IntegrationTestResponse {
  success: boolean;
  message: string;
}

export interface PullOrdersResponse {
  status: 'success' | 'partial' | 'failed' | 'not_implemented' | 'unsupported';
  message: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  unmapped_items_count: number;
  sync_log_id?: string;
  errors?: string[];
}

