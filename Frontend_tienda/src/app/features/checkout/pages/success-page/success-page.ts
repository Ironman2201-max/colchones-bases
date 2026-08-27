import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CheckoutService } from '../../services/checkout';

@Component({
  selector: 'app-success-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="success-container">
      <div class="success-card">
        <div class="success-icon">✅</div>
        <h1>¡Pedido confirmado!</h1>
        <p>Tu pedido ha sido creado exitosamente</p>
        
        <div class="order-details" *ngIf="order">
          <div class="detail-row">
            <span>Número de pedido:</span>
            <strong>{{ order.order_number }}</strong>
          </div>
          <div class="detail-row">
            <span>Total:</span>
            <strong>{{ order.total | currency:'COP':'symbol':'1.0-0' }}</strong>
          </div>
          <div class="detail-row">
            <span>Estado:</span>
            <span class="status">{{ order.status }}</span>
          </div>
        </div>
        
        <div class="action-buttons">
          <a routerLink="/" class="btn-primary">Seguir comprando</a>
          <a routerLink="/profile/orders" class="btn-secondary">Ver mis pedidos</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .success-card {
      background: white;
      border-radius: 20px;
      padding: 48px 40px;
      max-width: 500px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    
    .success-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .success-card h1 {
      font-size: 28px;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .success-card p {
      color: #718096;
      margin-bottom: 24px;
    }
    
    .order-details {
      text-align: left;
      background: #f7fafc;
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 24px;
    }
    
    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    
    .detail-row:last-child {
      border-bottom: none;
    }
    
    .detail-row span {
      color: #4a5568;
    }
    
    .status {
      text-transform: capitalize;
      font-weight: 500;
      color: #48bb78;
    }
    
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .btn-primary {
      padding: 12px 24px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .btn-primary:hover {
      background: #5a67d8;
      transform: translateY(-2px);
    }
    
    .btn-secondary {
      padding: 12px 24px;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .btn-secondary:hover {
      background: #cbd5e0;
    }
  `]
})
export class SuccessPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private checkoutService = inject(CheckoutService);
  
  order: any = null;
  
  ngOnInit() {
    const orderId = this.route.snapshot.params['id'];
    if (orderId) {
      this.loadOrder(orderId);
    }
  }
  
  loadOrder(id: number) {
    this.checkoutService.getOrder(id).subscribe({
      next: (response) => {
        this.order = response.data;
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
      }
    });
  }
}