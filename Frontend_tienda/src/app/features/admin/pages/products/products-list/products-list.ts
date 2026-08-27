import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminService } from '../../../services/admin'; // ✅ Asegurar la extensión
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar'; // ✅ Asegurar la extensión
import { AdminHeaderComponent } from '../../../components/admin-header/admin-header'; // ✅ Asegurar la extensión
import { FormsModule } from '@angular/forms';
import { ImageUrlPipe } from '../../../../../shared/pipes/image-url-pipe'; // ✅ Ruta corregida

@Component({
  selector: 'app-products-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterLink, 
    FormsModule, 
    AdminSidebarComponent, 
    AdminHeaderComponent, 
    ImageUrlPipe // ✅ Importado correctamente
  ],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      
      <div class="admin-content">
        <app-admin-header title="Productos"></app-admin-header>
        
        <div class="products-content">
          <!-- Header -->
          <div class="page-header">
            <h1>📦 Gestión de Productos</h1>
            <a routerLink="/admin/products/new" class="btn-primary">
              + Nuevo Producto
            </a>
          </div>
          
          <!-- Filtros -->
          <div class="filters">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="applyFilters()"
                placeholder="Buscar productos..."
                class="search-input">
            </div>
            
            <div class="filter-group">
              <select [(ngModel)]="filterStatus" (change)="applyFilters()" class="filter-select">
                <option value="">Todos los estados</option>
                <option value="1">Activos</option>
                <option value="0">Inactivos</option>
              </select>
              
              <select [(ngModel)]="filterStock" (change)="applyFilters()" class="filter-select">
                <option value="">Todos los stocks</option>
                <option value="in_stock">En stock</option>
                <option value="out_of_stock">Agotados</option>
                <option value="backorder">Reserva</option>
              </select>
            </div>
          </div>
          
          <!-- Loading -->
          <div *ngIf="isLoading()" class="loading">
            <div class="spinner"></div>
            <p>Cargando productos...</p>
          </div>
          
          <!-- Tabla -->
          <div *ngIf="!isLoading()" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Precio</th>
                  <th>Stock</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let product of products()">
                  <td>#{{ product.id }}</td>
                  <td>
                    <div class="product-cell">
                      <!-- ✅ Usando el pipe correctamente -->
                      <img [src]="product.image_principal | imageUrl" 
                           [alt]="product.name" 
                           class="product-thumb">
                      <span class="product-name">{{ product.name }}</span>
                    </div>
                  </td>
                  <td><code>{{ product.sku }}</code></td>
                  <td>{{ product.price | currency:'COP':'symbol':'1.0-0' }}</td>
                  <td>
                    <span [class]="product.stock > 0 ? 'stock-ok' : 'stock-empty'">
                      {{ product.stock }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" [class]="product.is_active ? 'active' : 'inactive'">
                      {{ product.is_active ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>
                    <div class="actions">
                      <button (click)="toggleStatus(product)" 
                              class="btn-toggle" 
                              [title]="product.is_active ? 'Desactivar' : 'Activar'">
                        {{ product.is_active ? '🔴' : '🟢' }}
                      </button>
                      <a [routerLink]="['/admin/products/edit', product.id]" class="btn-edit">✏️</a>
                      <button (click)="deleteProduct(product.id)" class="btn-delete">🗑️</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div *ngIf="!isLoading() && products().length > 0" class="pagination">
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
    .products-content { padding: 24px; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .page-header h1 { margin: 0; font-size: 24px; color: #2d3748; }
    
    .btn-primary {
      padding: 10px 20px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.3s;
    }
    
    .btn-primary:hover { background: #5a67d8; transform: translateY(-2px); }
    
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
    
    .filter-group { display: flex; gap: 12px; }
    
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
    
    .product-cell {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .product-thumb {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      object-fit: cover;
      background: #f7fafc;
    }
    
    .product-name { font-weight: 500; }
    
    .stock-ok { color: #48bb78; font-weight: 600; }
    .stock-empty { color: #fc8181; font-weight: 600; }
    
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
    }
    
    .status-badge.active { background: #d1fae5; color: #065f46; }
    .status-badge.inactive { background: #fee2e2; color: #991b1b; }
    
    .actions {
      display: flex;
      gap: 8px;
    }
    
    .actions button, .actions a {
      padding: 6px 10px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-size: 16px;
      transition: all 0.3s;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-toggle { background: #e2e8f0; }
    .btn-toggle:hover { background: #cbd5e0; }
    .btn-edit { background: #dbeafe; color: #1e40af; }
    .btn-edit:hover { background: #bfdbfe; }
    .btn-delete { background: #fee2e2; color: #991b1b; }
    .btn-delete:hover { background: #fecaca; }
    
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
export class ProductsListComponent implements OnInit {
  private adminService = inject(AdminService);
  
  products = signal<any[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  lastPage = signal(1);
  
  searchTerm = '';
  filterStatus = '';
  filterStock = '';
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.isLoading.set(true);
    
    const params: any = {
      page: this.currentPage(),
      sort_field: 'id',
      sort_direction: 'desc'
    };
    
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterStatus !== '') params.is_active = this.filterStatus;
    if (this.filterStock) params.stock_status = this.filterStock;
    
    this.adminService.getProducts(params).subscribe({
      next: (response) => {
        console.log('📦 Productos:', response);
        this.products.set(response.data);
        this.currentPage.set(response.meta.current_page);
        this.lastPage.set(response.meta.last_page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar productos:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  applyFilters() {
    this.currentPage.set(1);
    this.loadProducts();
  }
  
  changePage(page: number) {
    if (page < 1 || page > this.lastPage()) return;
    this.currentPage.set(page);
    this.loadProducts();
  }
  
  toggleStatus(product: any) {
    if (confirm(`¿Estás seguro de ${product.is_active ? 'desactivar' : 'activar'} "${product.name}"?`)) {
      this.adminService.toggleProductStatus(product.id).subscribe({
        next: () => {
          product.is_active = !product.is_active;
        },
        error: (error) => {
          console.error('❌ Error al cambiar estado:', error);
          alert('Error al cambiar estado del producto');
        }
      });
    }
  }
  
  deleteProduct(id: number) {
    const product = this.products().find(p => p.id === id);
    if (confirm(`¿Estás seguro de eliminar "${product?.name}"? Esta acción no se puede deshacer.`)) {
      this.adminService.deleteProduct(id).subscribe({
        next: () => {
          this.products.set(this.products().filter(p => p.id !== id));
        },
        error: (error) => {
          console.error('❌ Error al eliminar producto:', error);
          alert('Error al eliminar el producto');
        }
      });
    }
  }
}