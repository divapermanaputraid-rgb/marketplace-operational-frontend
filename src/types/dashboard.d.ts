import type { SyncLog } from './sync';
export interface DashboardSummary {
    stores: {
        total: number;
        active: number;
        by_marketplace: Record<string, number>;
    };
    products: {
        total: number;
        active: number;
        draft: number;
        inactive: number;
        archived: number;
    };
    product_mappings: {
        total: number;
        mapped_products: number;
        unmapped_products: number;
        coverage_percent: number;
    };
    inventory: {
        total_items: number;
        low_stock_count: number;
        total_available_quantity: number;
        total_reserved_quantity: number;
        total_damaged_quantity: number;
    };
    orders: {
        total: number;
        pending: number;
        ready_to_process: number;
        packed: number;
        shipped: number;
        completed: number;
        cancelled: number;
        returned: number;
        failed: number;
        payment_counts: Record<string, number>;
        total_sales_amount: number;
    };
    sync: {
        total_jobs: number;
        not_configured: number;
        failed: number;
        success: number;
        latest_logs: SyncLog[];
    };
}
