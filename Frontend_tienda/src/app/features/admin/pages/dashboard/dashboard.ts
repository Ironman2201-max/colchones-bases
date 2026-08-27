import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../services/admin';
import { AdminSidebarComponent } from '../../components/admin-sidebar/admin-sidebar';
import { AdminHeaderComponent } from '../../components/admin-header/admin-header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      
      <div class="admin-content">
        <app-admin-header title="Dashboard"></app-admin-header>
        
        <div class="dashboard-content">
          <!-- Loading -->
          <div *ngIf="isLoading()" class="loading">
            <div class="spinner"></div>
            <p>Cargando datos...</p>
          </div>
          
          <!-- Estadísticas -->
          <div *ngIf="!isLoading() && stats()" class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📦</div>
              <div class="stat-info">
                <h3>{{ stats().total_orders || 0 }}</h3>
                <p>Pedidos totales</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">💰</div>
              <div class="stat-info">
                <h3>{{ (stats().total_sales || 0) | currency:'COP':'symbol':'1.0-0' }}</h3>
                <p>Ventas totales</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">🛍️</div>
              <div class="stat-info">
                <h3>{{ stats().total_products || 0 }}</h3>
                <p>Productos</p>
              </div>
            </div>
            
            <div class="stat-card">
              <div class="stat-icon">👤</div>
              <div class="stat-info">
                <h3>{{ stats().total_users || 0 }}</h3>
                <p>Usuarios</p>
              </div>
            </div>
            
            <div class="stat-card warning">
              <div class="stat-icon">⏳</div>
              <div class="stat-info">
                <h3>{{ stats().pending_orders || 0 }}</h3>
                <p>Pedidos pendientes</p>
              </div>
            </div>
          </div>
          
          <!-- Pedidos recientes -->
          <div *ngIf="!isLoading() && stats()?.recent_orders?.length > 0" class="recent-orders">
            <h2>📋 Pedidos recientes</h2>
            <div class="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Nº Pedido</th>
                    <th>Cliente</th>
                    <th>Total</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of stats().recent_orders">
                    <td><strong>{{ order.order_number }}</strong></td>
                    <td>{{ order.user_name }}</td>
                    <td>{{ order.total | currency:'COP':'symbol':'1.0-0' }}</td>
                    <td><span class="status-badge" [class]="order.status">{{ order.status }}</span></td>
                    <td>{{ order.created_at | date:'short' }}</td>
                    <td>
                      <a [routerLink]="['/admin/orders', order.id]" class="btn-sm">Ver</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <!-- ✅ Mensaje cuando no hay pedidos -->
          <div *ngIf="!isLoading() && stats() && stats().recent_orders?.length === 0" class="empty-state">
            <div class="empty-icon">📭</div>
            <h3>No hay pedidos aún</h3>
            <p>Los pedidos aparecerán aquí cuando los clientes realicen compras.</p>
            <a routerLink="/admin/products" class="btn-primary">Ver productos</a>
          </div>
          
          <!-- Sin datos -->
          <div *ngIf="!isLoading() && !stats()" class="empty-state">
            <p>No hay datos disponibles</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-layout { display: flex; min-height: 100vh; background: #f7fafc; }
    .admin-content { flex: 1; margin-left: 250px; }
    .dashboard-content { padding: 24px; }
    
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
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      display: flex;
      align-items: center;
      gap: 16px;
      transition: all 0.3s;
    }
    
    .stat-card:hover { transform: translateY(-4px); box-shadow: 0 4px 20px rgba(0,0,0,0.12); }
    .stat-card.warning { border-left: 4px solid #fc8181; }
    
    .stat-icon { font-size: 32px; }
    
    .stat-info h3 {
      margin: 0;
      font-size: 24px;
      font-weight: 700;
      color: #2d3748;
    }
    
    .stat-info p {
      margin: 4px 0 0 0;
      color: #a0aec0;
      font-size: 14px;
    }
    
    .recent-orders {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .recent-orders h2 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #2d3748;
    }
    
    .table-container { overflow-x: auto; }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
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
    
    .btn-sm {
      padding: 4px 12px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      text-decoration: none;
      font-size: 12px;
      transition: all 0.3s;
    }
    
    .btn-sm:hover { background: #5a67d8; }
    
    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .empty-icon {
      font-size: 64px;
      margin-bottom: 16px;
    }
    
    .empty-state h3 {
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .empty-state p {
      color: #a0aec0;
      margin-bottom: 20px;
    }
    
    .btn-primary {
      display: inline-block;
      padding: 10px 24px;
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
    }
    
    @media (max-width: 768px) {
      .admin-content { margin-left: 0; }
      .stats-grid { grid-template-columns: 1fr 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private adminService = inject(AdminService);
  stats = signal<any>(null);
  isLoading = signal(false);
  
  ngOnInit() {
    this.loadDashboard();
  }
  
  loadDashboard() {
    this.isLoading.set(true);
    this.adminService.getDashboard().subscribe({
      next: (response) => {
        console.log('📊 Dashboard:', response);
        this.stats.set(response.data);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar dashboard:', error);
        this.isLoading.set(false);
      }
    });
  }
}