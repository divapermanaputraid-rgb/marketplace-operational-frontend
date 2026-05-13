import type { Product, ProductVariant } from './product';
import type { Store } from './store';
export type ListingStatus = 'draft' | 'active' | 'inactive' | 'deleted' | 'unknown';
export interface ProductMapping {
    id: string;
    product_id: string;
    product_variant_id?: string;
    store_id: string;
    marketplace: 'shopee' | 'tokopedia_shop' | 'tiktok_shop';
    external_product_id: string;
    external_variant_id?: string;
    external_sku?: string;
    listing_name?: string;
    listing_url?: string;
    listing_status: ListingStatus;
    price?: number;
    currency: string;
    last_synced_at?: string;
    raw_payload?: string;
    created_at: string;
    updated_at: string;
    product?: Product;
    product_variant?: ProductVariant;
    store?: Store;
}
export interface CreateProductMappingRequest {
    product_id: string;
    product_variant_id?: string;
    store_id: string;
    marketplace: 'shopee' | 'tokopedia_shop' | 'tiktok_shop';
    external_product_id: string;
    external_variant_id?: string;
    external_sku?: string;
    listing_name?: string;
    listing_url?: string;
    listing_status?: ListingStatus;
    price?: number;
    currency?: string;
}
export interface UpdateProductMappingRequest {
    listing_status?: ListingStatus;
    price?: number;
    listing_name?: string;
    listing_url?: string;
    external_sku?: string;
}
export interface ProductMappingFilters {
    product_id?: string;
    store_id?: string;
    marketplace?: string;
    listing_status?: string;
    search?: string;
}
