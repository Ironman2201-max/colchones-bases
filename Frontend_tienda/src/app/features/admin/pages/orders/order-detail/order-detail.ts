import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeaderComponent } from '../../../components/admin-header/admin-header';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      
      <div class="admin-content">
        <app-admin-header title="Detalle de Pedido"></app-admin-header>
        
        <div class="detail-content">
          <!-- Loading -->
          <div *ngIf="isLoading()" class="loading">
            <div class="spinner"></div>
            <p>Cargando pedido...</p>
          </div>
          
          <div *ngIf="!isLoading() && order()" class="detail-card">
            <!-- Header -->
            <div class="detail-header">
              <div class="header-left">
                <h1>Pedido #{{ order().order_number }}</h1>
                <span class="date">{{ order().created_at | date:'full' }}</span>
              </div>
              <div class="header-right">
                <a routerLink="/admin/orders" class="btn-back">← Volver</a>
              </div>
            </div>
            
            <!-- Estado y pago -->
            <div class="status-section">
              <div class="status-group">
                <label>Estado del pedido</label>
                <select [(ngModel)]="selectedStatus" (change)="updateStatus()" class="status-select">
                  <option value="pending">Pendiente</option>
                  <option value="processing">Procesando</option>
                  <option value="paid">Pagado</option>
                  <option value="shipped">Enviado</option>
                  <option value="delivered">Entregado</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
              
              <div class="status-group">
                <label>Estado del pago</label>
                <span class="payment-status" [class]="order().payment_status">
                  {{ order().payment_status | uppercase }}
                </span>
              </div>
              
              <div class="status-group">
                <label>Método de pago</label>
                <span class="payment-method">{{ order().payment_method | uppercase }}</span>
              </div>
            </div>
            
            <!-- Información del cliente -->
            <div class="info-grid">
              <div class="info-card">
                <h3>👤 Cliente</h3>
                <p><strong>Nombre:</strong> {{ order().shipping_name }}</p>
                <p><strong>Email:</strong> {{ order().user?.email || 'N/A' }}</p>
                <p><strong>Teléfono:</strong> {{ order().shipping_phone || 'N/A' }}</p>
              </div>
              
              <div class="info-card">
                <h3>📦 Dirección de envío</h3>
                <p>{{ order().shipping_address }}</p>
                <p>{{ order().shipping_city }}, {{ order().shipping_state }}</p>
                <p>{{ order().shipping_country }} - {{ order().shipping_postal_code || 'Sin código' }}</p>
              </div>
            </div>
            
            <!-- Productos -->
            <div class="items-section">
              <h3>🛍️ Productos</h3>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Producto</th>
                      <th>SKU</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr *ngFor="let item of order().items">
                      <td>{{ item.product_name }}</td>
                      <td><code>{{ item.product_sku }}</code></td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ item.price | currency:'COP':'symbol':'1.0-0' }}</td>
                      <td>{{ item.total | currency:'COP':'symbol':'1.0-0' }}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colspan="4" class="text-right"><strong>Subtotal:</strong></td>
                      <td>{{ order().subtotal | currency:'COP':'symbol':'1.0-0' }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-right"><strong>IVA (19%):</strong></td>
                      <td>{{ order().tax | currency:'COP':'symbol':'1.0-0' }}</td>
                    </tr>
                    <tr>
                      <td colspan="4" class="text-right"><strong>Envío:</strong></td>
                      <td>{{ order().shipping_cost | currency:'COP':'symbol':'1.0-0' }}</td>
                    </tr>
                    <tr class="total-row">
                      <td colspan="4" class="text-right"><strong>TOTAL:</strong></td>
                      <td><strong>{{ order().total | currency:'COP':'symbol':'1.0-0' }}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
            
            <!-- Notas -->
            <div class="notes-section" *ngIf="order().notes">
              <h3>📝 Notas</h3>
              <p>{{ order().notes }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: #f7fafc; }
    .admin-content { flex: 1; margin-left: 250px; }
    .detail-content { padding: 24px; max-width: 1200px; margin: 0 auto; }
    
    .detail-card {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .detail-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 2px solid #f0f0f0;
    }
    
    .detail-header h1 {
      margin: 0;
      font-size: 24px;
      color: #2d3748;
    }
    
    .date { color: #a0aec0; font-size: 14px; display: block; margin-top: 4px; }
    
    .btn-back {
      padding: 8px 16px;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .btn-back:hover { background: #cbd5e0; }
    
    .status-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .status-group label {
      display: block;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      color: #a0aec0;
      margin-bottom: 4px;
    }
    
    .status-select {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }
    
    .payment-status {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .payment-status.pending { background: #fef3c7; color: #92400e; }
    .payment-status.paid { background: #d1fae5; color: #065f46; }
    .payment-status.failed { background: #fee2e2; color: #991b1b; }
    
    .payment-method {
      display: inline-block;
      padding: 4px 12px;
      background: #e2e8f0;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 24px;
    }
    
    .info-card {
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
    }
    
    .info-card h3 {
      margin: 0 0 12px 0;
      font-size: 16px;
      color: #2d3748;
    }
    
    .info-card p {
      margin: 4px 0;
      color: #4a5568;
      font-size: 14px;
    }
    
    .items-section h3 {
      margin: 0 0 16px 0;
      font-size: 18px;
      color: #2d3748;
    }
    
    .table-container { overflow-x: auto; }
    
    table { width: 100%; border-collapse: collapse; }
    
    table th {
      text-align: left;
      padding: 12px 16px;
      background: #f7fafc;
      color: #4a5568;
      font-weight: 600;
      font-size: 13px;
      text-transform: uppercase;
    }
    
    table td {
      padding: 12px 16px;
      border-bottom: 1px solid #f0f0f0;
    }
    
    table tfoot td {
      border-bottom: none;
      padding: 8px 16px;
    }
    
    .text-right { text-align: right; }
    
    .total-row td {
      font-size: 18px;
      border-top: 2px solid #2d3748;
      padding-top: 12px;
    }
    
    .total-row strong { color: #2d3748; }
    
    .notes-section {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px solid #f0f0f0;
    }
    
    .notes-section h3 {
      margin: 0 0 8px 0;
      font-size: 16px;
      color: #2d3748;
    }
    
    .notes-section p {
      color: #4a5568;
      background: #f7fafc;
      padding: 12px;
      border-radius: 8px;
      margin: 0;
    }
    
    .loading {
      text-align: center;
      padding: 60px 0;
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
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 768px) {
      .admin-content { margin-left: 0; }
      .info-grid { grid-template-columns: 1fr; }
      .status-section { grid-template-columns: 1fr; }
    }
  `]
})
export class OrderDetailComponent implements OnInit {
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  order = signal<any>(null);
  isLoading = signal(false);
  selectedStatus = '';
  
  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadOrder(id);
    }
  }
  
  loadOrder(id: number) {
    this.isLoading.set(true);
    
    this.adminService.getOrder(id).subscribe({
      next: (response) => {
        console.log('📋 Detalle del pedido:', response);
        this.order.set(response.data);
        this.selectedStatus = response.data.status;
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar pedido:', error);
        this.isLoading.set(false);
        alert('Error al cargar el pedido');
        this.router.navigate(['/admin/orders']);
      }
    });
  }
  
  updateStatus() {
    if (this.selectedStatus === this.order().status) return;
    
    if (confirm(`¿Estás seguro de cambiar el estado a "${this.selectedStatus}"?`)) {
      this.adminService.updateOrderStatus(this.order().id, this.selectedStatus).subscribe({
        next: (response) => {
          console.log('✅ Estado actualizado:', response);
          this.order.set(response.data);
          alert('✅ Estado del pedido actualizado correctamente');
        },
        error: (error) => {
          console.error('❌ Error al actualizar estado:', error);
          alert('❌ Error al actualizar el estado');
        }
      });
    }
  }
}