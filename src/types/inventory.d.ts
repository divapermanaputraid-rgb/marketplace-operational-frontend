import type { Product, ProductVariant } from './product';
export type MovementType = 'initial' | 'adjustment_in' | 'adjustment_out' | 'reserved' | 'reservation_released' | 'sold' | 'returned' | 'damaged' | 'manual_correction';
export interface InventoryItem {
    id: string;
    product_id: string;
    product_variant_id?: string;
    sku: string;
    location_name: string;
    available_quantity: number;
    reserved_quantity: number;
    damaged_quantity: number;
    safety_stock: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    product?: Product;
    product_variant?: ProductVariant;
    mapped_listing_count: number;
    marketplaces_mapped: string[];
    sync_status_label: string;
    is_low_stock: boolean;
}
export interface InventoryMovement {
    id: string;
    inventory_item_id: string;
    product_id: string;
    product_variant_id?: string;
    movement_type: MovementType;
    quantity_delta: number;
    quantity_before: number;
    quantity_after: number;
    reference_type?: string;
    reference_id?: string;
    notes?: string;
    created_by_admin_id?: string;
    created_at: string;
}
export interface CreateInventoryItemRequest {
    product_id: string;
    product_variant_id?: string;
    sku: string;
    location_name?: string;
    initial_quantity: number;
    safety_stock: number;
    notes?: string;
}
export interface AdjustStockRequest {
    movement_type: MovementType;
    quantity_delta: number;
    notes?: string;
    reference_type?: string;
    reference_id?: string;
}
export interface UpdateInventoryMetadataRequest {
    safety_stock?: number;
    notes?: string;
}
export interface InventoryFilters {
    product_id?: string;
    product_variant_id?: string;
    search?: string;
    location_name?: string;
    low_stock?: string;
}
