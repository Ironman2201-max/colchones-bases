import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin';
import { AdminSidebarComponent } from '../../../components/admin-sidebar/admin-sidebar';
import { AdminHeaderComponent } from '../../../components/admin-header/admin-header';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminSidebarComponent, AdminHeaderComponent],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>
      
      <div class="admin-content">
        <app-admin-header title="Usuarios"></app-admin-header>
        
        <div class="users-content">
          <div class="page-header">
            <h1>👤 Gestión de Usuarios</h1>
            <span class="user-count">{{ users().length }} usuarios</span>
          </div>
          
          <!-- Filtros -->
          <div class="filters">
            <div class="search-box">
              <input 
                type="text" 
                [(ngModel)]="searchTerm" 
                (input)="applyFilters()"
                placeholder="Buscar por nombre o email..."
                class="search-input">
            </div>
            
            <div class="filter-group">
              <select [(ngModel)]="filterRole" (change)="applyFilters()" class="filter-select">
                <option value="">Todos los roles</option>
                <option value="admin">Administrador</option>
                <option value="seller">Vendedor</option>
                <option value="client">Cliente</option>
              </select>
            </div>
          </div>
          
          <!-- Loading -->
          <div *ngIf="isLoading()" class="loading">
            <div class="spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
          
          <!-- Tabla -->
          <div *ngIf="!isLoading()" class="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombre</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Rol</th>
                  <th>Fecha registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of users()">
                  <td>#{{ user.id }}</td>
                  <td><strong>{{ user.name }}</strong></td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.phone || 'N/A' }}</td>
                  <td>
                    <span class="role-badge" [class]="user.role">
                      {{ user.role }}
                    </span>
                  </td>
                  <td>{{ user.created_at | date:'short' }}</td>
                  <td>
                    <select [(ngModel)]="user.role" (change)="updateRole(user)" class="role-select">
                      <option value="admin">Admin</option>
                      <option value="seller">Vendedor</option>
                      <option value="client">Cliente</option>
                    </select>
                  </td>
                </tr>
                <tr *ngIf="users().length === 0">
                  <td colspan="7" class="empty">No hay usuarios</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Paginación -->
          <div *ngIf="!isLoading() && users().length > 0" class="pagination">
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
    .admin-layout { 
      display: flex; 
      min-height: 100vh; 
      background: #f7fafc; 
    }
    
    .admin-content { 
      flex: 1; 
      margin-left: 250px; 
    }
    
    .users-content { 
      padding: 24px; 
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    
    .page-header h1 { 
      margin: 0; 
      font-size: 24px; 
      color: #2d3748; 
    }
    
    .user-count { 
      color: #a0aec0; 
      font-size: 14px; 
    }
    
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
    
    .search-box { 
      flex: 1; 
      min-width: 200px; 
    }
    
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
      vertical-align: middle;
    }
    
    table tr:hover td { 
      background: #f7fafc; 
    }
    
    .role-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: capitalize;
    }
    
    .role-badge.admin { 
      background: #dbeafe; 
      color: #1e40af; 
    }
    
    .role-badge.seller { 
      background: #d1fae5; 
      color: #065f46; 
    }
    
    .role-badge.client { 
      background: #fef3c7; 
      color: #92400e; 
    }
    
    .role-select {
      padding: 4px 8px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 12px;
      cursor: pointer;
      background: white;
    }
    
    .role-select:focus {
      outline: none;
      border-color: #667eea;
    }
    
    .empty { 
      text-align: center; 
      color: #a0aec0; 
      padding: 40px; 
    }
    
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
    
    .page-info { 
      color: #4a5568; 
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
      .admin-content { 
        margin-left: 0; 
      }
      
      .filters { 
        flex-direction: column; 
      }
    }
  `]
})
export class UsersListComponent implements OnInit {
  private adminService = inject(AdminService);
  
  users = signal<any[]>([]);
  isLoading = signal(false);
  currentPage = signal(1);
  lastPage = signal(1);
  
  searchTerm = '';
  filterRole = '';
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.isLoading.set(true);
    
    const params: any = {
      page: this.currentPage(),
      sort_field: 'created_at',
      sort_direction: 'desc'
    };
    
    if (this.searchTerm) params.search = this.searchTerm;
    if (this.filterRole) params.role = this.filterRole;
    
    this.adminService.getUsers(params).subscribe({
      next: (response) => {
        console.log('👤 Usuarios:', response);
        this.users.set(response.data);
        this.currentPage.set(response.meta.current_page);
        this.lastPage.set(response.meta.last_page);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al cargar usuarios:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  applyFilters() {
    this.currentPage.set(1);
    this.loadUsers();
  }
  
  changePage(page: number) {
    if (page < 1 || page > this.lastPage()) return;
    this.currentPage.set(page);
    this.loadUsers();
  }
  
  updateRole(user: any) {
    if (confirm(`¿Estás seguro de cambiar el rol de "${user.name}" a "${user.role}"?`)) {
      this.adminService.updateUserRole(user.id, user.role).subscribe({
        next: () => {
          console.log('✅ Rol actualizado');
          alert('✅ Rol actualizado correctamente');
        },
        error: (error) => {
          console.error('❌ Error al actualizar rol:', error);
          alert('❌ Error al actualizar el rol');
        }
      });
    }
  }
}