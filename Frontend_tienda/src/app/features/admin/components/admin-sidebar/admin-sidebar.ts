import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>👑 Admin</h2>
        <p>{{ authService.currentUser()?.name }}</p>
      </div>
      
      <nav class="sidebar-nav">
        <a routerLink="/admin" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">
          📊 Dashboard
        </a>
        <a routerLink="/admin/products" routerLinkActive="active">
          🛍️ Productos
        </a>
        <a routerLink="/admin/orders" routerLinkActive="active">
          📋 Pedidos
        </a>
        <a routerLink="/admin/users" routerLinkActive="active">
          👤 Usuarios
        </a>
      </nav>
      
      <div class="sidebar-footer">
        <a routerLink="/" class="btn-back">
          ← Volver a la tienda
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .admin-sidebar {
      width: 250px;
      background: #2d3748;
      color: white;
      height: 100vh;
      position: fixed;
      top: 0;
      left: 0;
      display: flex;
      flex-direction: column;
      z-index: 100;
    }
    
    .sidebar-header {
      padding: 24px 20px;
      border-bottom: 1px solid #4a5568;
    }
    
    .sidebar-header h2 {
      margin: 0;
      font-size: 20px;
    }
    
    .sidebar-header p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #a0aec0;
    }
    
    .sidebar-nav {
      flex: 1;
      padding: 20px 0;
    }
    
    .sidebar-nav a {
      display: block;
      padding: 12px 20px;
      color: #a0aec0;
      text-decoration: none;
      transition: all 0.3s;
    }
    
    .sidebar-nav a:hover {
      background: #4a5568;
      color: white;
    }
    
    .sidebar-nav a.active {
      background: #4a5568;
      color: white;
      border-left: 4px solid #667eea;
    }
    
    .sidebar-footer {
      padding: 16px 20px;
      border-top: 1px solid #4a5568;
    }
    
    .btn-back {
      display: block;
      text-align: center;
      padding: 10px;
      background: #4a5568;
      color: #a0aec0;
      text-decoration: none;
      border-radius: 8px;
      transition: all 0.3s;
    }
    
    .btn-back:hover {
      background: #667eea;
      color: white;
    }
    
    @media (max-width: 768px) {
      .admin-sidebar {
        width: 100%;
        height: auto;
        position: relative;
      }
    }
  `]
})
export class AdminSidebarComponent {
  authService = inject(AuthService);
}