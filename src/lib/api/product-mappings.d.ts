import type { ProductMapping, CreateProductMappingRequest, UpdateProductMappingRequest, ProductMappingFilters } from '@/types/product-mapping';
export declare const productMappingsApi: {
    list: (params?: ProductMappingFilters) => Promise<ProductMapping[]>;
    get: (id: string) => Promise<ProductMapping>;
    create: (data: CreateProductMappingRequest) => Promise<ProductMapping>;
    update: (id: string, data: UpdateProductMappingRequest) => Promise<ProductMapping>;
    delete: (id: string) => Promise<null>;
    listByProduct: (productId: string) => Promise<ProductMapping[]>;
    listByStore: (storeId: string) => Promise<ProductMapping[]>;
};
