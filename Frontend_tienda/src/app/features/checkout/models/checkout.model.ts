// ===== CHECKOUT =====
export interface ShippingAddress {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code?: string;
  shipping_country: string;
  shipping_phone?: string;
}

export interface CheckoutRequest {
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code?: string;
  shipping_country: string;
  shipping_phone?: string;
  payment_method: 'credit_card' | 'paypal' | 'mercado_pago' | 'nequi';
  notes?: string;
  payment_data?: any; // Para Nequi y otros métodos
}

export interface CheckoutResponse {
  status: string;
  message: string;
  data: {
    order: Order;
    payment_url?: string;
  };
}

// ===== ORDER =====
export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  variant_id?: number;
  product_name: string;
  product_sku: string;
  variant_name?: string;
  price: number;
  quantity: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  user_id: number;
  order_number: string;
  status: 'pending' | 'processing' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_name: string;
  shipping_address: string;
  shipping_city: string;
  shipping_state: string;
  shipping_postal_code?: string;
  shipping_country: string;
  shipping_phone?: string;
  payment_method: 'credit_card' | 'paypal' | 'mercado_pago' | 'nequi';
  payment_status: 'pending' | 'paid' | 'failed';
  payment_data?: any;
  transaction_id?: string;
  notes?: string;
  items: OrderItem[];
  created_at: string;
  updated_at: string;
}

// ===== PAYMENT =====
export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  isActive: boolean;
}

export interface NequiPaymentData {
  phone_number: string;
  document_type?: 'cedula' | 'pasaporte' | 'nit';
  document_number?: string;
}

export interface PaymentResponse {
  status: 'success' | 'pending' | 'failed';
  message: string;
  order_id?: number;
  payment_url?: string;
  transaction_id?: string;
}