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

export interface PullOrdersRequest {
  time_from: number;
  time_to: number;
  order_status?: string;
  page_size?: number;
}

export interface PullOrdersResult {
  status: 'success' | 'partial' | 'failed' | 'not_implemented' | 'unsupported' | 'expired' | 'not_configured';

  message: string;
  records_processed: number;
  records_created: number;
  records_updated: number;
  records_failed: number;
  unmapped_items_count: number;
  sync_log_id?: string;
  errors?: string[];
}

export interface ShopeeMappingCandidate {
  external_product_id: string;
  external_variant_id: string | null;
  marketplace: string;
  store_id: string;
  title: string;
  sku: string;
  variant_name?: string;
  price: number;
  stock: number;
  image_url?: string;
  mapping_status: 'mapped' | 'unmapped';
  existing_product_mapping_id?: string | null;
  internal_product_id?: string | null;
  internal_product_name?: string | null;
  internal_variant_id?: string | null;
}

export interface MappingCandidatesRequest {
  page_size?: number;
  item_status?: string;
  offset?: number;
}

export interface MappingCandidatesResult {
  status: string;
  message: string;
  records_processed: number;
  mapped_count: number;
  unmapped_count: number;
  candidates: ShopeeMappingCandidate[];
  sync_log_id?: string;
}

export interface CreateShopeeMappingRequest {
  external_product_id: string;
  external_variant_id?: string | null;
  internal_product_id: string;
  internal_variant_id?: string | null;
  external_sku?: string;
  external_name?: string;
}

export interface CreateShopeeMappingResult {
  id: string;
  product_id: string;
  product_variant_id?: string | null;
  store_id: string;
  marketplace: string;
  external_product_id: string;
  external_variant_id?: string | null;
  external_sku?: string;
  listing_name?: string;
}
