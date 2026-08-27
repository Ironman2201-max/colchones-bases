import { Component, Input, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../models/product.model';
import { CartService } from '../../../cart/services/cart';
import { DEFAULT_PRODUCT_IMAGE, ImageUrlPipe } from '../../../../shared/pipes/image-url-pipe';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
  <div class="product-card" [class.out-of-stock]="product.stock === 0">
    <div class="product-image">
      <img
        [src]="product.image_principal | imageUrl"
        [alt]="product.name"
        (error)="onImageError($event)"
      />
      ...
        <div class="product-badges">
          <span *ngIf="product.is_featured" class="badge badge-featured">Destacado</span>
          <span *ngIf="product.stock === 0" class="badge badge-outstock">Agotado</span>
          <span *ngIf="product.compare_price" class="badge badge-discount">
            -{{ calculateDiscount(product.price, product.compare_price) }}%
          </span>
        </div>
      </div>

      <div class="product-info">
        <h3 class="product-name">
          <a [routerLink]="['/producto', product.slug]">{{ product.name }}</a>
        </h3>

        <div class="product-pricing">
          <span class="price">{{ product.price | currency: 'COP' : 'symbol' : '1.0-0' }}</span>
          <span *ngIf="product.compare_price" class="compare-price">
            {{ product.compare_price | currency: 'COP' : 'symbol' : '1.0-0' }}
          </span>
        </div>

        <div class="product-stock" [class.in-stock]="product.stock > 0">
          <span>{{ product.stock > 0 ? 'En stock' : 'Agotado' }}</span>
          <span class="stock-count" *ngIf="product.stock > 0">({{ product.stock }} unidades)</span>
        </div>

        <button
          class="btn-add-cart"
          [disabled]="product.stock === 0 || isAdding()"
          (click)="addToCart($event)"
        >
          <span *ngIf="!isAdding()">Agregar al carrito</span>
          <span *ngIf="isAdding()">Agregando...</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="9" cy="21" r="1"></circle>
            <circle cx="20" cy="21" r="1"></circle>
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .product-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        position: relative;
      }

      .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
      }

      .product-card.out-of-stock {
        opacity: 0.7;
      }

      .product-image {
        position: relative;
        padding-top: 75%;
        background: #f7fafc;
        overflow: hidden;
      }

      .product-image img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
        transition: transform 0.3s ease;
      }

      .product-card:hover .product-image img {
        transform: scale(1.05);
      }

      .product-badges {
        position: absolute;
        top: 12px;
        left: 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .badge {
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .badge-featured {
        background: #f6ad55;
        color: #744210;
      }

      .badge-outstock {
        background: #fc8181;
        color: #742a2a;
      }

      .badge-discount {
        background: #48bb78;
        color: #22543d;
      }

      .product-info {
        padding: 16px;
      }

      .product-name {
        margin: 0 0 10px 0;
        font-size: 16px;
        font-weight: 500;
        line-height: 1.4;
      }

      .product-name a {
        color: #2d3748;
        text-decoration: none;
        transition: color 0.3s;
      }

      .product-name a:hover {
        color: #667eea;
      }

      .product-pricing {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-bottom: 8px;
      }

      .price {
        font-size: 20px;
        font-weight: 700;
        color: #2d3748;
      }

      .compare-price {
        font-size: 14px;
        color: #a0aec0;
        text-decoration: line-through;
      }

      .product-stock {
        font-size: 13px;
        color: #a0aec0;
        margin-bottom: 12px;
      }

      .product-stock.in-stock {
        color: #48bb78;
      }

      .stock-count {
        color: #a0aec0;
      }

      .btn-add-cart {
        width: 100%;
        padding: 10px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s;
      }

      .btn-add-cart:hover:not(:disabled) {
        background: #5a67d8;
      }

      .btn-add-cart:disabled {
        background: #a0aec0;
        cursor: not-allowed;
      }
    `,
  ],
})
export class ProductCardComponent {
  @Input() product!: Product;

  private cartService = inject(CartService);
  isAdding = signal(false);

   onImageError(event: Event) {
    const img = event.target as HTMLImageElement;
    if (img.src.startsWith('data:image/svg+xml')) return; // ya está en el placeholder, no reintentar
    img.src = DEFAULT_PRODUCT_IMAGE;
  }

  calculateDiscount(price: number, comparePrice: number): number {
    return Math.round(((comparePrice - price) / comparePrice) * 100);
  }

  addToCart(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    if (this.product.stock === 0) return;

    this.isAdding.set(true);
    console.log('Agregando al carrito:', this.product);

    this.cartService.addToCart(this.product, 1).subscribe({
      next: (response) => {
        console.log('✅ Producto agregado al carrito:', response);
        this.isAdding.set(false);
        // Mostrar notificación de éxito
        alert('✅ Producto agregado al carrito');
      },
      error: (error) => {
        console.error('❌ Error al agregar al carrito:', error);
        this.isAdding.set(false);
        alert('❌ Error al agregar producto');
      },
    });
  }
}
