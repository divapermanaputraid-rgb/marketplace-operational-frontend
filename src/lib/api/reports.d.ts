import type { OrdersReport, InventoryReport, ProductsReport, SyncReport } from '@/types/reports';
export declare const reportsApi: {
    getOrders: () => Promise<OrdersReport>;
    getInventory: () => Promise<InventoryReport>;
    getProducts: () => Promise<ProductsReport>;
    getSync: () => Promise<SyncReport>;
};
