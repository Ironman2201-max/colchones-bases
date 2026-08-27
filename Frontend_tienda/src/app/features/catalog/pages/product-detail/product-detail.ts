import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CatalogService } from '../../services/catalog';
import { Product } from '../../models/product.model';
import { ImageUrlPipe, DEFAULT_PRODUCT_IMAGE } from '../../../../shared/pipes/image-url-pipe';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ImageUrlPipe],
  template: `
    <div class="product-detail-container" *ngIf="product()">
      <div class="product-detail-grid">
        <div class="product-images">
          <div class="main-image">
            <img
              [src]="product()?.image_principal | imageUrl"
              [alt]="product()?.name"
              (error)="onImageError($event)"
            />
          </div>
          <div class="thumbnail-list">
            <div *ngFor="let image of product()?.images" class="thumbnail">
              <img [src]="image.url | imageUrl" [alt]="product()?.name" />
            </div>
          </div>

          <div class="product-info">
            <nav class="breadcrumb">
              <a routerLink="/">Inicio</a>
              <span>/</span>
              <a [routerLink]="['/categoria', product()?.category?.slug]">{{
                product()?.category?.name
              }}</a>
              <span>/</span>
              <span>{{ product()?.name }}</span>
            </nav>

            <h1 class="product-title">{{ product()?.name }}</h1>

            <div class="product-rating">
              <span class="stars">★★★★★</span>
              <span class="reviews">(0 reseñas)</span>
            </div>

            <div class="product-pricing">
              <div class="price">{{ product()?.price | currency: 'COP' : 'symbol' : '1.0-0' }}</div>
              <div class="compare-price" *ngIf="product()?.compare_price">
                {{ product()?.compare_price | currency: 'COP' : 'symbol' : '1.0-0' }}
              </div>
            </div>

            <div class="product-stock">
              <span [class.in-stock]="(product()?.stock || 0) > 0">
                {{ (product()?.stock || 0) > 0 ? '✅ En stock' : '❌ Agotado' }}
              </span>
              <span class="stock-count" *ngIf="(product()?.stock || 0) > 0">
                {{ product()?.stock }} unidades disponibles
              </span>
            </div>

            <div class="product-description">
              <h3>Descripción</h3>
              <p>{{ product()?.description }}</p>
            </div>

            <div class="product-variants" *ngIf="product()?.variants?.length">
              <h3>Variantes</h3>
              <div class="variant-options">
                <button
                  *ngFor="let variant of product()?.variants"
                  class="variant-btn"
                  [class.active]="selectedVariant === variant"
                >
                  {{ variant.name }}
                </button>
              </div>
            </div>

            <div class="product-actions">
              <div class="quantity-selector">
                <button (click)="decreaseQuantity()">-</button>
                <span>{{ quantity }}</span>
                <button (click)="increaseQuantity()">+</button>
              </div>
              <button
                class="btn-add-cart"
                [disabled]="(product()?.stock || 0) === 0"
                (click)="addToCart()"
              >
                Agregar al carrito
              </button>
            </div>

            <div class="product-meta">
              <div class="meta-item">
                <span class="meta-label">SKU:</span>
                <span class="meta-value">{{ product()?.sku }}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Categoría:</span>
                <span class="meta-value">{{ product()?.category?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="!product()" class="loading-container">
        <div class="spinner"></div>
        <p>Cargando producto...</p>
      </div>
    </div>
  `,
  styles: [
    `
      .product-detail-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 20px;
      }

      .product-detail-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 40px;
      }

      .product-images {
        position: sticky;
        top: 20px;
      }

      .main-image {
        width: 100%;
        padding-top: 100%;
        background: #f7fafc;
        border-radius: 12px;
        overflow: hidden;
        position: relative;
      }

      .main-image img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .thumbnail-list {
        display: flex;
        gap: 8px;
        margin-top: 12px;
        overflow-x: auto;
      }

      .thumbnail {
        width: 80px;
        height: 80px;
        background: #f7fafc;
        border-radius: 8px;
        overflow: hidden;
        cursor: pointer;
        flex-shrink: 0;
      }

      .thumbnail img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .breadcrumb {
        display: flex;
        gap: 8px;
        align-items: center;
        font-size: 14px;
        color: #a0aec0;
        margin-bottom: 16px;
      }

      .breadcrumb a {
        color: #667eea;
        text-decoration: none;
      }

      .breadcrumb a:hover {
        text-decoration: underline;
      }

      .product-title {
        font-size: 32px;
        color: #2d3748;
        margin: 0 0 12px 0;
      }

      .product-rating {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 16px;
      }

      .stars {
        color: #f6ad55;
        font-size: 18px;
      }

      .reviews {
        color: #a0aec0;
        font-size: 14px;
      }

      .product-pricing {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 16px;
      }

      .price {
        font-size: 32px;
        font-weight: 700;
        color: #2d3748;
      }

      .compare-price {
        font-size: 20px;
        color: #a0aec0;
        text-decoration: line-through;
      }

      .product-stock {
        margin-bottom: 20px;
        font-size: 16px;
      }

      .product-stock .in-stock {
        color: #48bb78;
      }

      .stock-count {
        color: #a0aec0;
        font-size: 14px;
        margin-left: 8px;
      }

      .product-description {
        margin-bottom: 24px;
      }

      .product-description h3 {
        font-size: 16px;
        color: #2d3748;
        margin-bottom: 8px;
      }

      .product-description p {
        color: #4a5568;
        line-height: 1.6;
      }

      .product-variants {
        margin-bottom: 24px;
      }

      .product-variants h3 {
        font-size: 16px;
        color: #2d3748;
        margin-bottom: 8px;
      }

      .variant-options {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .variant-btn {
        padding: 8px 16px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        background: white;
        cursor: pointer;
        transition: all 0.3s;
      }

      .variant-btn:hover {
        border-color: #667eea;
      }

      .variant-btn.active {
        border-color: #667eea;
        background: #667eea;
        color: white;
      }

      .product-actions {
        display: flex;
        gap: 16px;
        margin-bottom: 24px;
      }

      .quantity-selector {
        display: flex;
        align-items: center;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        overflow: hidden;
      }

      .quantity-selector button {
        width: 40px;
        height: 40px;
        border: none;
        background: #f7fafc;
        cursor: pointer;
        font-size: 18px;
        transition: all 0.3s;
      }

      .quantity-selector button:hover {
        background: #e2e8f0;
      }

      .quantity-selector span {
        width: 40px;
        text-align: center;
        font-size: 16px;
        font-weight: 500;
      }

      .btn-add-cart {
        flex: 1;
        padding: 12px 24px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-add-cart:hover:not(:disabled) {
        background: #5a67d8;
        transform: translateY(-2px);
      }

      .btn-add-cart:disabled {
        background: #a0aec0;
        cursor: not-allowed;
      }

      .product-meta {
        border-top: 1px solid #e2e8f0;
        padding-top: 16px;
      }

      .meta-item {
        display: flex;
        gap: 8px;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .meta-label {
        color: #a0aec0;
        min-width: 80px;
      }

      .meta-value {
        color: #4a5568;
      }

      .loading-container {
        text-align: center;
        padding: 60px 20px;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #e2e8f0;
        border-top-color: #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 16px;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      @media (max-width: 768px) {
        .product-detail-grid {
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .product-images {
          position: static;
        }

        .product-title {
          font-size: 24px;
        }

        .price {
          font-size: 24px;
        }

        .product-actions {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private catalogService = inject(CatalogService);

  product = signal<Product | null>(null);
  quantity = 1;
  selectedVariant: any = null;

  onImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src.startsWith('data:image/svg+xml')) return;
  img.src = DEFAULT_PRODUCT_IMAGE;
}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const slug = params['slug'];
      if (slug) {
        this.loadProduct(slug);
      }
    });
  }

  loadProduct(slug: string) {
    this.catalogService.getProductBySlug(slug).subscribe({
      next: (response) => {
        this.product.set(response.data);
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
      },
    });
  }

  increaseQuantity() {
    const maxStock = this.product()?.stock || 0;
    if (this.quantity < maxStock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    // Lógica para agregar al carrito (se implementará en el módulo 3)
    console.log('Agregar al carrito:', {
      product: this.product(),
      quantity: this.quantity,
      variant: this.selectedVariant,
    });
  }
}
