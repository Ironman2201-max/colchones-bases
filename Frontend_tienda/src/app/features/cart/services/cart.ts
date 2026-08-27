import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // ✅ Agregar HttpHeaders
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  price: number;
  total: number;
  product: {
    id: number;
    name: string;
    slug: string;
    image_principal: string;
    price: number;
  };
  variant: any;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  // Estado del carrito
  private cartItemsSignal = signal<CartItem[]>([]);
  private isLoadingSignal = signal(false);

  // Getters públicos
  readonly items = this.cartItemsSignal.asReadonly();
  readonly isLoading = this.isLoadingSignal.asReadonly();

  readonly itemCount = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + item.quantity, 0);
  });

  readonly subtotal = computed(() => {
    return this.cartItemsSignal().reduce((total, item) => total + (item.price * item.quantity), 0);
  });

  readonly tax = computed(() => {
    return this.subtotal() * 0.19;
  });

  readonly shipping = computed(() => {
    const total = this.subtotal();
    if (total === 0) return 0;
    if (total > 200000) return 0;
    return 15000;
  });

  readonly discount = computed(() => 0);
  
  readonly total = computed(() => {
    return this.subtotal() + this.tax() + this.shipping() - this.discount();
  });

  constructor() {
    // Efecto para guardar en localStorage
    effect(() => {
      const items = this.cartItemsSignal();
      if (items.length > 0) {
        localStorage.setItem('cart_items', JSON.stringify(items));
      }
    });
  }

  // ===== MÉTODOS CON CREDENCIALES =====

  // Cargar carrito desde el servidor
  loadCart(): void {
    this.isLoadingSignal.set(true);
    
    // ✅ Agregar withCredentials para mantener la sesión
    this.http.get(`${this.apiUrl}/cart`, { withCredentials: true }).subscribe({
      next: (response: any) => {
        console.log('📦 Carrito cargado:', response);
        if (response.data?.items) {
          this.cartItemsSignal.set(response.data.items);
        } else {
          this.cartItemsSignal.set([]);
        }
        this.isLoadingSignal.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar carrito:', error);
        this.isLoadingSignal.set(false);
      }
    });
  }

  // Agregar al carrito
  addToCart(product: any, quantity: number = 1): Observable<any> {
    this.isLoadingSignal.set(true);

    const request = {
      product_id: product.id,
      quantity: quantity
    };

    console.log('➕ Agregando al carrito:', request);

    // ✅ Agregar withCredentials para mantener la sesión
    return this.http.post(`${this.apiUrl}/cart/add`, request, { withCredentials: true }).pipe(
      tap({
        next: (response: any) => {
          console.log('✅ Producto agregado:', response);
          if (response.data?.items) {
            this.cartItemsSignal.set(response.data.items);
          }
          this.isLoadingSignal.set(false);
        },
        error: (error) => {
          console.error('❌ Error al agregar:', error);
          this.isLoadingSignal.set(false);
        }
      })
    );
  }

  // Actualizar cantidad
  updateQuantity(itemId: number, quantity: number): void {
    this.isLoadingSignal.set(true);

    const request = { item_id: itemId, quantity: quantity };
    
    // ✅ Agregar withCredentials para mantener la sesión
    this.http.put(`${this.apiUrl}/cart/update`, request, { withCredentials: true }).subscribe({
      next: (response: any) => {
        console.log('✅ Cantidad actualizada:', response);
        if (response.data?.items) {
          this.cartItemsSignal.set(response.data.items);
        }
        this.isLoadingSignal.set(false);
      },
      error: (error) => {
        console.error('❌ Error al actualizar cantidad:', error);
        this.isLoadingSignal.set(false);
      }
    });
  }

  // Eliminar item
  removeItem(itemId: number): Observable<any> {
    this.isLoadingSignal.set(true);

    // ✅ Agregar withCredentials para mantener la sesión
    return this.http.delete(`${this.apiUrl}/cart/remove/${itemId}`, { withCredentials: true }).pipe(
      tap({
        next: (response: any) => {
          console.log('🗑️ Item eliminado:', response);
          if (response.data?.items) {
            this.cartItemsSignal.set(response.data.items);
          }
          this.isLoadingSignal.set(false);
        },
        error: (error) => {
          console.error('❌ Error al eliminar item:', error);
          this.isLoadingSignal.set(false);
        }
      })
    );
  }

  // Vaciar carrito
  clearCart(): Observable<any> {
    this.isLoadingSignal.set(true);

    // ✅ Agregar withCredentials para mantener la sesión
    return this.http.delete(`${this.apiUrl}/cart/clear`, { withCredentials: true }).pipe(
      tap({
        next: () => {
          console.log('🧹 Carrito vaciado');
          this.cartItemsSignal.set([]);
          this.isLoadingSignal.set(false);
        },
        error: (error) => {
          console.error('❌ Error al vaciar carrito:', error);
          this.isLoadingSignal.set(false);
        }
      })
    );
  }

  private saveToLocalStorage(): void {
    const items = this.cartItemsSignal();
    if (items.length > 0) {
      localStorage.setItem('cart_items', JSON.stringify(items));
    } else {
      localStorage.removeItem('cart_items');
    }
  }
}