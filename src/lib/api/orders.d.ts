import type { Order, CreateOrderRequest, UpdateOrderRequest, OrderFilters } from '@/types/order';
export declare const ordersApi: {
    list: (params?: OrderFilters) => Promise<Order[]>;
    get: (id: string) => Promise<Order>;
    create: (data: CreateOrderRequest) => Promise<Order>;
    update: (id: string, data: UpdateOrderRequest) => Promise<Order>;
    delete: (id: string) => Promise<null>;
};
