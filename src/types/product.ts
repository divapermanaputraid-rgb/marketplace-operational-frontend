export interface ProductImage {
  id: string;
  product_id: string;
  image_url?: string;
  storage_path?: string;
  alt_text?: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  name: string;
  option_1_name?: string;
  option_1_value?: string;
  option_2_name?: string;
  option_2_value?: string;
  cost_price?: number;
  selling_price?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug?: string;
  description?: string;
  brand?: string;
  category?: string;
  status: 'draft' | 'active' | 'inactive' | 'archived';
  cost_price?: number;
  selling_price?: number;
  currency: string;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  description?: string;
  brand?: string;
  category?: string;
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  cost_price?: number;
  selling_price?: number;
  currency?: string;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  primary_image_url?: string;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  brand?: string;
  category?: string;
  status?: 'draft' | 'active' | 'inactive' | 'archived';
  cost_price?: number;
  selling_price?: number;
  weight_grams?: number;
  length_cm?: number;
  width_cm?: number;
  height_cm?: number;
  primary_image_url?: string;
}
