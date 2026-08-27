import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { CartItemComponent } from '../../components/cart-item/cart-item';
import { CartSummaryComponent } from '../../components/cart-summary/cart-summary';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [CommonModule, RouterLink, CartItemComponent, CartSummaryComponent],
  template: `
    <div class="cart-container">
      <div class="cart-header">
        <h1>🛒 Carrito de Compras</h1>
        <p class="item-count" *ngIf="cartService.itemCount() > 0">
          {{ cartService.itemCount() }} {{ cartService.itemCount() === 1 ? 'producto' : 'productos' }}
        </p>
      </div>
      
      <!-- Loading -->
      <div *ngIf="cartService.isLoading()" class="loading-overlay">
        <div class="spinner"></div>
        <p>Cargando carrito...</p>
      </div>
      
      <!-- Mostrar items del carrito -->
      <div *ngIf="!cartService.isLoading() && cartService.items().length > 0" class="cart-content">
        <div class="cart-items">
          <div class="cart-headers">
            <span>Producto</span>
            <span>Cantidad</span>
            <span>Total</span>
            <span></span>
          </div>
          
          <app-cart-item 
            *ngFor="let item of cartService.items()"
            [item]="item"
            (update)="updateQuantity($event)"
            (remove)="removeItem($event)">
          </app-cart-item>
        </div>
        
        <div class="cart-summary">
          <app-cart-summary
            [subtotal]="cartService.subtotal()"
            [tax]="cartService.tax()"
            [shipping]="cartService.shipping()"
            [discount]="cartService.discount()"
            [total]="cartService.total()"
            [itemCount]="cartService.itemCount()"
            (checkout)="goToCheckout()">
          </app-cart-summary>
        </div>
      </div>
      
      <!-- Carrito vacío -->
      <div *ngIf="!cartService.isLoading() && cartService.items().length === 0" class="empty-cart">
        <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
          <circle cx="9" cy="21" r="1"></circle>
          <circle cx="20" cy="21" r="1"></circle>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
        </svg>
        <h2>Tu carrito está vacío</h2>
        <p>Explora nuestros productos y encuentra lo que necesitas</p>
        <a routerLink="/" class="btn-primary">Ver productos</a>
      </div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .cart-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 30px;
    }
    
    .cart-header h1 {
      font-size: 28px;
      color: #2d3748;
      margin: 0;
    }
    
    .item-count {
      color: #a0aec0;
      font-size: 16px;
    }
    
    .cart-content {
      display: grid;
      grid-template-columns: 1fr 320px;
      gap: 30px;
    }
    
    .cart-items {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .cart-headers {
      display: grid;
      grid-template-columns: 1fr auto auto auto;
      gap: 16px;
      padding: 0 16px 8px;
      font-size: 13px;
      color: #a0aec0;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .cart-headers span:last-child {
      width: 36px;
    }
    
    .cart-summary {
      position: sticky;
      top: 20px;
      height: fit-content;
    }
    
    .empty-cart {
      text-align: center;
      padding: 60px 20px;
    }
    
    .empty-cart svg {
      color: #a0aec0;
      margin-bottom: 20px;
    }
    
    .empty-cart h2 {
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .empty-cart p {
      color: #a0aec0;
      margin-bottom: 24px;
    }
    
    .btn-primary {
      display: inline-block;
      padding: 12px 32px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.3);
    }
    
    .loading-overlay {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 0;
    }
    
    .loading-overlay p {
      color: #a0aec0;
      margin-top: 16px;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 1024px) {
      .cart-content {
        grid-template-columns: 1fr;
      }
      
      .cart-summary {
        position: static;
      }
    }
    
    @media (max-width: 768px) {
      .cart-headers {
        display: none;
      }
    }
  `]
})
export class CartPageComponent implements OnInit {
  cartService = inject(CartService);
  private router = inject(Router);

  ngOnInit() {
    console.log('🔄 Cargando carrito...');
    this.cartService.loadCart();
  }

  // ✅ CORREGIDO: Método para actualizar cantidad
  updateQuantity(event: { itemId: number; quantity: number }) {
    console.log('📝 Actualizando cantidad:', event);
    this.cartService.updateQuantity(event.itemId, event.quantity);
  }

  // ✅ CORREGIDO: Método para eliminar item
  removeItem(itemId: number) {
    console.log('🗑️ Eliminando item:', itemId);
    this.cartService.removeItem(itemId).subscribe({
      next: () => {
        console.log('✅ Item eliminado correctamente');
      },
      error: (error) => {
        console.error('❌ Error al eliminar item:', error);
      }
    });
  }

  // ✅ CORREGIDO: Método para ir al checkout
  goToCheckout() {
    this.router.navigate(['/checkout']);
  }
}