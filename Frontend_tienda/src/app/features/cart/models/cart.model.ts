import { Product, ProductVariant } from '../../catalog/models/product.model';

export interface CartItem {
  id: number;
  product_id: number;
  product: Product;
  variant_id?: number;
  variant?: ProductVariant;
  quantity: number;
  price: number;
  total: number;
  selected: boolean;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  item_count: number;
}

export interface AddToCartRequest {
  product_id: number;
  variant_id?: number;
  quantity: number;
}

export interface UpdateCartRequest {
  item_id: number;
  quantity: number;
}