import type { InventoryItem, CreateInventoryItemRequest, AdjustStockRequest, UpdateInventoryMetadataRequest, InventoryMovement, InventoryFilters } from '@/types/inventory';
export declare const inventoryApi: {
    list: (params?: InventoryFilters) => Promise<InventoryItem[]>;
    get: (id: string) => Promise<InventoryItem>;
    create: (data: CreateInventoryItemRequest) => Promise<InventoryItem>;
    updateMetadata: (id: string, data: UpdateInventoryMetadataRequest) => Promise<InventoryItem>;
    delete: (id: string) => Promise<null>;
    adjustStock: (id: string, data: AdjustStockRequest) => Promise<null>;
    listMovements: (id: string) => Promise<InventoryMovement[]>;
    listAllMovements: (params?: {
        movement_type?: string;
    }) => Promise<InventoryMovement[]>;
};
