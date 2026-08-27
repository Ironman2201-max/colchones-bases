export interface Product {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  price: number;
  compare_price: number | null;
  cost: number | null;
  stock: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
  image_principal: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  images?: ProductImage[];
  variants?: ProductVariant[];
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  url: string;
  is_primary: boolean;
  order: number;
}

export interface ProductVariant {
  id: number;
  product_id: number;
  name: string;
  price_adjustment: number;
  stock: number;
}