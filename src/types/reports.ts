import type { Order } from './order';
import type { InventoryItem } from './inventory';
import type { Product } from './product';
import type { SyncLog } from './sync';

export interface OrdersReport {
  order_status_counts: Record<string, number>;
  payment_status_counts: Record<string, number>;
  total_orders: number;
  total_sales_amount: number;
  sales_by_marketplace: Record<string, number>;
  recent_orders: Order[];
}

export interface InventoryReport {
  low_stock_items: InventoryItem[];
  total_available_quantity: number;
  total_reserved_quantity: number;
  total_damaged_quantity: number;
}

export interface ProductsReport {
  product_status_counts: Record<string, number>;
  mapping_coverage: number;
  mapped_products_count: number;
  unmapped_products_count: number;
  unmapped_products: Product[];
  mappings_by_marketplace: Record<string, number>;
  total_mappings: number;
}

export interface SyncReport {
  sync_job_status_counts: Record<string, number>;
  sync_log_status_counts: Record<string, number>;
  latest_logs: SyncLog[];
}
