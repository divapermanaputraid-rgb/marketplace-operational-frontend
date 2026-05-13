import type { Store } from './store';
import type { Product, ProductVariant } from './product';
import type { ProductMapping } from './product-mapping';
export type OrderStatus = 'pending' | 'ready_to_process' | 'packed' | 'shipped' | 'completed' | 'cancelled' | 'returned' | 'failed';
export type PaymentStatus = 'unpaid' | 'paid' | 'cod' | 'refunded' | 'unknown';
export interface OrderItem {
    id: string;
    order_id: string;
    product_id?: string;
    product_variant_id?: string;
    product_mapping_id?: string;
    sku?: string;
    product_name: string;
    external_product_id?: string;
    external_variant_id?: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    notes?: string;
    created_at: string;
    updated_at: string;
    product?: Product;
    product_variant?: ProductVariant;
    product_mapping?: ProductMapping;
}
export interface Order {
    id: string;
    store_id: string;
    marketplace: string;
    external_order_id?: string;
    order_number: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    order_status: OrderStatus;
    payment_status: PaymentStatus;
    subtotal_amount: number;
    shipping_fee: number;
    discount_amount: number;
    total_amount: number;
    currency: string;
    notes?: string;
    ordered_at?: string;
    paid_at?: string;
    shipped_at?: string;
    completed_at?: string;
    created_at: string;
    updated_at: string;
    store?: Store;
    items?: OrderItem[];
}
export interface CreateOrderItemRequest {
    product_id?: string;
    product_variant_id?: string;
    product_mapping_id?: string;
    sku?: string;
    product_name: string;
    external_product_id?: string;
    external_variant_id?: string;
    quantity: number;
    unit_price: number;
    notes?: string;
}
export interface CreateOrderRequest {
    store_id: string;
    marketplace: string;
    external_order_id?: string;
    order_number: string;
    customer_name?: string;
    customer_phone?: string;
    customer_address?: string;
    order_status?: OrderStatus;
    payment_status?: PaymentStatus;
    shipping_fee?: number;
    discount_amount?: number;
    currency?: string;
    notes?: string;
    ordered_at?: string;
    items: CreateOrderItemRequest[];
}
export interface UpdateOrderRequest {
    order_status?: OrderStatus;
    payment_status?: PaymentStatus;
    notes?: string;
    paid_at?: string;
    shipped_at?: string;
    completed_at?: string;
}
export interface OrderFilters {
    store_id?: string;
    marketplace?: string;
    order_status?: string;
    payment_status?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}
