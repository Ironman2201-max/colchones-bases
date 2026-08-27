import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartService } from '../../../cart/services/cart';

@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-summary">
      <h3>📋 Resumen del pedido</h3>
      
      <div class="order-items">
        <div *ngFor="let item of cartService.items()" class="order-item">
          <div class="item-info">
            <span class="item-name">{{ item.product?.name }}</span>
            <span class="item-quantity">x{{ item.quantity }}</span>
          </div>
          <span class="item-price">{{ item.price * item.quantity | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>
      </div>
      
      <div class="order-totals">
        <div class="total-row">
          <span>Subtotal</span>
          <span>{{ cartService.subtotal() | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>
        <div class="total-row">
          <span>IVA (19%)</span>
          <span>{{ cartService.tax() | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>
        <div class="total-row">
          <span>Envío</span>
          <span *ngIf="cartService.shipping() === 0">Gratis</span>
          <span *ngIf="cartService.shipping() > 0">{{ cartService.shipping() | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>
        <div class="total-row total">
          <span>Total</span>
          <span>{{ cartService.total() | currency:'COP':'symbol':'1.0-0' }}</span>
        </div>
      </div>
      
      <div class="shipping-info" *ngIf="cartService.subtotal() > 0 && cartService.subtotal() < 200000">
        <p>💡 ¡Falta {{ 200000 - cartService.subtotal() | currency:'COP':'symbol':'1.0-0' }} para envío gratis!</p>
      </div>
    </div>
  `,
  styles: [`
    .order-summary {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      position: sticky;
      top: 20px;
    }
    
    .order-summary h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #2d3748;
    }
    
    .order-items {
      border-bottom: 2px solid #f0f0f0;
      padding-bottom: 16px;
      margin-bottom: 16px;
    }
    
    .order-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
    }
    
    .item-info {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .item-name {
      color: #2d3748;
      font-size: 14px;
    }
    
    .item-quantity {
      color: #a0aec0;
      font-size: 13px;
    }
    
    .item-price {
      color: #2d3748;
      font-weight: 500;
      font-size: 14px;
    }
    
    .order-totals {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .total-row {
      display: flex;
      justify-content: space-between;
      color: #4a5568;
      font-size: 14px;
    }
    
    .total-row.total {
      font-size: 18px;
      font-weight: 700;
      color: #2d3748;
      padding-top: 12px;
      border-top: 2px solid #f0f0f0;
      margin-top: 8px;
    }
    
    .shipping-info {
      margin-top: 16px;
      padding: 12px;
      background: #f0fff4;
      border-radius: 8px;
      color: #276749;
      font-size: 14px;
    }
  `]
})
export class OrderSummaryComponent {
  cartService = inject(CartService);
}