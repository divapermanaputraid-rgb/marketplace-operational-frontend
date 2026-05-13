import type { Product, CreateProductRequest, UpdateProductRequest } from '@/types/product';
export declare const productsApi: {
    list: (params?: {
        status?: string;
        category?: string;
        search?: string;
        sku?: string;
    }) => Promise<Product[]>;
    get: (id: string) => Promise<Product>;
    create: (data: CreateProductRequest) => Promise<Product>;
    update: (id: string, data: UpdateProductRequest) => Promise<Product>;
    delete: (id: string) => Promise<null>;
};
