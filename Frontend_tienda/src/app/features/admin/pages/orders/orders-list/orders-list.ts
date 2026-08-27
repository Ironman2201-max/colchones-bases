import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeaderComponent } from '../../../components/admin-header/admin-header';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-orders-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      
      <div class="admin-content">
        <app-admin-header title="Pedidos"></app-admin-header>
        
        <div class="orders-content">
          <div class="page-header">
            <h1>📋 Gestión de Pedidos</h1>
            <span class="order-count">{{ orders().length }} pedidos</span>
          </div>
          
          <!-- Filtros -->
          <div class="filters">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="applyFilters()"
                placeholder="Buscar por número o cliente..."
                class="search-input">
            </div>
            
            <div class="filter-group">
              <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="pending">Pendiente</option>
                <option value="processing">Procesando</option>
                <option value="paid">Pagado</option>
                <option value="shipped">Enviado</option>
                <option value="delivered">Entregado</option>
                <option value="cancelled">Cancelado</option>
              </select>
              
              <select [(ngModel)]="filterPayment" (change)="applyFilters()" class="filter-select">
                <option value="">Todos los pagos</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="failed">Fallido</option>
              </select>
            </div>
          </div>
          
          <!-- Loading -->
          <div *ngIf="isLoading()" class="loading">
            <div class="spinner"></div>
            <p>Cargando pedidos...</p>
          </div>
          
          <!-- Tabla -->
          <div *ngIf="!isLoading()" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Nº Pedido</th>
                  <th>Cliente</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Pago</th>
                  <th>Fecha</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let order of orders()">
                  <td><strong>{{ order.order_number }}</strong></td>
                  <td>{{ order.user_name }}</td>
                  <td>{{ order.total | currency:'COP':'symbol':'1.0-0' }}</td>
                  <td>
                    <span class="status-badge" [class]="order.status">
                      {{ order.status }}
                    </span>
                  </td>
                  <td>
                    <span class="payment-badge" [class]="order.payment_status">
                      {{ order.payment_status }}
                    </span>
                  </td>
                  <td>{{ order.created_at | date:'short' }}</td>
                  <td>
                    <a [routerLink]="['/admin/orders', order.id]" class="btn-view">
                      Ver
                    </a>
                  </td>
                </tr>
                <tr *ngIf="orders().length === 0">
                  <td colspan="7" class="empty">No hay pedidos</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div *ngIf="!isLoading() && orders().length > 0" class="pagination">
            <button (click)="changePage(currentPage() - 1)" 
                    [disabled]="currentPage() <= 1"
                    class="page-btn">
              ◀ Anterior
            </button>
            <span class="page-info">
              Página {{ currentPage() }} de {{ lastPage() }}
            </span>
            <button (click)="changePage(currentPage() + 1)" 
                    [disabled]="currentPage() >= lastPage()"
                    class="page-btn">
              Siguiente ▶
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: #f7fafc; }
    .admin-content { flex: 1; margin-left: 250px; }
    .orders-content { padding: 24px; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .page-header h1 { margin: 0; font-size: 24px; color: #2d3748; }
    .order-count { color: #a0aec0; font-size: 14px; }
    
    .filters {
      display: flex;
      gap: 16px;
      margin-bottom: 20px;
      flex-wrap: wrap;
      background: white;
      padding: 16px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .search-box { flex: 1; min-width: 200px; }
    
    .search-input {
      width: 100%;
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    
    .filter-group { display: flex; gap: 12px; flex-wrap: wrap; }
    
    .filter-select {
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }
    
    .table-container {
      background: white;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      overflow-x: auto;
    }
    
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
      vertical-align: middle;
    }
    
    table tr:hover td { background: #f7fafc; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .status-badge.pending { background: #fef3c7; color: #92400e; }
    .status-badge.processing { background: #dbeafe; color: #1e40af; }
    .status-badge.paid { background: #d1fae5; color: #065f46; }
    .status-badge.shipped { background: #e0e7ff; color: #3730a3; }
    .status-badge.delivered { background: #d1fae5; color: #065f46; }
    .status-badge.cancelled { background: #fee2e2; color: #991b1b; }
    
    .payment-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .payment-badge.pending { background: #fef3c7; color: #92400e; }
    .payment-badge.paid { background: #d1fae5; color: #065f46; }
    .payment-badge.failed { background: #fee2e2; color: #991b1b; }
    
    .btn-view {
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      transition: all 0.3s;
    }
    
    .btn-view:hover { background: #5a67d8; }
    
    .empty { text-align: center; color: #a0aec0; padding: 40px; }
    
    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      margin-top: 20px;
    }
    
    .page-btn {
      padding: 8px 16px;
      background: white;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .page-btn:hover:not(:disabled) {
      border-color: #667eea;
      background: #f7fafc;
    }
    
    .page-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .page-info { color: #4a5568; }
    
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
      .filters { flex-direction: column; }
      .filter-group { flex-wrap: wrap; }
    }
  `]
})
export class OrdersListComponent implements OnInit {
  private adminService = inject(AdminService);
  
  orders = signal<any[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  lastPage = signal(1);
  
  searchTerm = '';
  filterStatus = '';
  filterPayment = '';
  
  ngOnInit() {
    this.loadOrders();
  }
  
  loadOrders() {
    this.isLoading.set(true);
    
    const params: any = {
      page: this.currentPage(),
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
    
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterStatus) params.status = this.filterStatus;
    if (this.filterPayment) params.payment_status = this.filterPayment;
    
    this.adminService.getOrders(params).subscribe({
      next: (response) => {
        console.log('📋 Pedidos:', response);
        this.orders.set(response.data);
        this.currentPage.set(response.meta.current_page);
        this.lastPage.set(response.meta.last_page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar pedidos:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  applyFilters() {
    this.currentPage.set(1);
    this.loadOrders();
  }
  
  changePage(page: number) {
    if (page < 1 || page > this.lastPage()) return;
    this.currentPage.set(page);
    this.loadOrders();
  }
}