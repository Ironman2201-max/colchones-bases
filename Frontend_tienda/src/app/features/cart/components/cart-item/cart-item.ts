import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../services/cart';
import { DEFAULT_PRODUCT_IMAGE, ImageUrlPipe } from '../../../../shared/pipes/image-url-pipe';

@Component({
  selector: 'app-cart-item',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
    <div class="cart-item">
      <div class="item-image">
        <img [src]="item.product?.image_principal | imageUrl" [alt]="item.product?.name" (error)="onImageError($event)">
      </div>
      
      <div class="item-details">
        <h3 class="item-name">
          <a [routerLink]="['/producto', item.product?.slug]">{{ item.product?.name }}</a>
        </h3>
        <p class="item-price">
          {{ item.price | currency:'COP':'symbol':'1.0-0' }}
        </p>
      </div>
      
      <div class="item-quantity">
        <button (click)="updateQuantity(item.quantity - 1)" 
                class="qty-btn"
                [disabled]="item.quantity <= 1">
          -
        </button>
        <span class="qty-value">{{ item.quantity }}</span>
        <button (click)="updateQuantity(item.quantity + 1)" 
                class="qty-btn"
                [disabled]="item.quantity >= 10">
          +
        </button>
      </div>
      
      <div class="item-total">
        {{ item.price * item.quantity | currency:'COP':'symbol':'1.0-0' }}
      </div>
      
      <button (click)="removeItem()" class="remove-btn" title="Eliminar">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .cart-item {
      display: grid;
      grid-template-columns: 80px 1fr auto auto auto;
      gap: 16px;
      align-items: center;
      padding: 16px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
      transition: all 0.3s;
    }
    
    .cart-item:hover {
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    
    .item-image {
      width: 80px;
      height: 80px;
      border-radius: 8px;
      overflow: hidden;
      background: #f7fafc;
    }
    
    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .item-details {
      min-width: 150px;
    }
    
    .item-name {
      margin: 0 0 4px 0;
      font-size: 16px;
      font-weight: 500;
    }
    
    .item-name a {
      color: #2d3748;
      text-decoration: none;
    }
    
    .item-name a:hover {
      color: #667eea;
    }
    
    .item-price {
      margin: 4px 0 0 0;
      font-size: 14px;
      color: #4a5568;
    }
    
    .item-quantity {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .qty-btn {
      width: 32px;
      height: 32px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 16px;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .qty-btn:hover:not(:disabled) {
      border-color: #667eea;
      background: #f7fafc;
    }
    
    .qty-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    
    .qty-value {
      min-width: 30px;
      text-align: center;
      font-size: 16px;
      font-weight: 500;
    }
    
    .item-total {
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
      min-width: 100px;
    }
    
    .remove-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: none;
      color: #a0aec0;
      cursor: pointer;
      border-radius: 50%;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .remove-btn:hover {
      background: #fff5f5;
      color: #fc8181;
    }
    
    @media (max-width: 768px) {
      .cart-item {
        grid-template-columns: 60px 1fr auto;
        grid-template-rows: auto auto;
        gap: 12px;
      }
      
      .item-image {
        width: 60px;
        height: 60px;
      }
      
      .item-total {
        grid-column: 2 / 4;
        text-align: right;
      }
      
      .remove-btn {
        grid-row: 1 / 3;
        grid-column: 4;
      }
    }
  `]
})
export class CartItemComponent {
  @Input() item!: CartItem;
  @Output() update = new EventEmitter<{itemId: number, quantity: number}>();
  @Output() remove = new EventEmitter<number>();

  onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src.startsWith('data:image/svg+xml')) return;
  img.src = DEFAULT_PRODUCT_IMAGE;
}

  updateQuantity(newQuantity: number): void {
    if (newQuantity < 1) return;
    this.update.emit({ itemId: this.item.id, quantity: newQuantity });
  }

  removeItem(): void {
    this.remove.emit(this.item.id);
  }
}