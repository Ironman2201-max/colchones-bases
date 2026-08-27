import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="summary-container">
      <h3 class="summary-title">Resumen del pedido</h3>
      
      <div class="summary-row">
        <span>Subtotal</span>
        <span>{{ subtotal | currency:'COP':'symbol':'1.0-0' }}</span>
      </div>
      
      <div class="summary-row">
        <span>IVA (19%)</span>
        <span>{{ tax | currency:'COP':'symbol':'1.0-0' }}</span>
      </div>
      
      <div class="summary-row">
        <span>Envío</span>
        <span *ngIf="shipping === 0">Gratis</span>
        <span *ngIf="shipping > 0">{{ shipping | currency:'COP':'symbol':'1.0-0' }}</span>
      </div>
      
      <div class="summary-row" *ngIf="discount > 0">
        <span>Descuento</span>
        <span>-{{ discount | currency:'COP':'symbol':'1.0-0' }}</span>
      </div>
      
      <div class="summary-divider"></div>
      
      <div class="summary-row total">
        <span>Total</span>
        <span>{{ total | currency:'COP':'symbol':'1.0-0' }}</span>
      </div>
      
      <div class="summary-actions">
        <button (click)="onCheckout()" 
                class="btn-checkout"
                [disabled]="itemCount === 0">
          {{ buttonText }}
        </button>
        <a routerLink="/" class="btn-continue">
          Seguir comprando
        </a>
      </div>
      
      <div class="summary-shipping" *ngIf="subtotal > 0 && subtotal < 200000">
        <span>💡</span>
        <span>¡Falta {{ 200000 - subtotal | currency:'COP':'symbol':'1.0-0' }} para envío gratis!</span>
      </div>
    </div>
  `,
  styles: [`
    .summary-container {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      position: sticky;
      top: 20px;
    }
    
    .summary-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      color: #4a5568;
      font-size: 15px;
    }
    
    .summary-row.total {
      font-size: 20px;
      font-weight: 700;
      color: #2d3748;
    }
    
    .summary-divider {
      border-top: 2px solid #e2e8f0;
      margin: 12px 0;
    }
    
    .summary-actions {
      margin-top: 20px;
    }
    
    .btn-checkout {
      width: 100%;
      padding: 14px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-bottom: 10px;
    }
    
    .btn-checkout:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.3);
    }
    
    .btn-checkout:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }
    
    .btn-continue {
      display: block;
      text-align: center;
      padding: 10px;
      color: #667eea;
      text-decoration: none;
      font-size: 14px;
      font-weight: 500;
      transition: all 0.3s;
    }
    
    .btn-continue:hover {
      color: #5a67d8;
      text-decoration: underline;
    }
    
    .summary-shipping {
      margin-top: 16px;
      padding: 12px;
      background: #f0fff4;
      border-radius: 8px;
      color: #276749;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  `]
})
export class CartSummaryComponent {
  @Input() subtotal: number = 0;
  @Input() tax: number = 0;
  @Input() shipping: number = 0;
  @Input() discount: number = 0;
  @Input() total: number = 0;
  @Input() itemCount: number = 0;
  @Input() buttonText: string = 'Proceder al pago';
  @Output() checkout = new EventEmitter<void>();

  onCheckout(): void {
    this.checkout.emit();
  }
}