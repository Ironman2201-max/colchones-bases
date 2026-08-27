// ===== DASHBOARD =====
export interface DashboardStats {
  total_orders: number;
  total_sales: number;
  total_products: number;
  total_users: number;
  pending_orders: number;
  recent_orders: RecentOrder[];
  top_products: TopProduct[];
  sales_by_day: SalesByDay[];
}

export interface RecentOrder {
  id: number;
  order_number: string;
  user_name: string;
  total: number;
  status: string;
  created_at: string;
}

export interface TopProduct {
  id: number;
  name: string;
  total_sold: number;
  total_revenue: number;
}

export interface SalesByDay {
  date: string;
  total: number;
  orders: number;
}

// ===== PRODUCTOS =====
export interface ProductAdmin {
  id: number;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category_id: number;
  category_name?: string;
  price: number;
  compare_price?: number;
  cost?: number;
  stock: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
  image_principal?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductFormData {
  name: string;
  description: string;
  category_id: number;
  price: number;
  compare_price?: number;
  cost?: number;
  stock: number;
  stock_status: 'in_stock' | 'out_of_stock' | 'backorder';
  image_principal?: string;
  is_featured: boolean;
  is_active: boolean;
}

// ===== PEDIDOS =====
export interface OrderAdmin {
  id: number;
  order_number: string;
  user_id: number;
  user_name: string;
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

// ===== USUARIOS =====
export interface UserAdmin {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  role: 'admin' | 'seller' | 'client';
  created_at: string;
  updated_at: string;
}