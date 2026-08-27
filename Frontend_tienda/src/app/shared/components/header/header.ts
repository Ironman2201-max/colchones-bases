import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../../features/cart/services/cart';
import { AuthService } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="header">
      <div class="header-container">
        <div class="logo">
          <a routerLink="/">🛏️ Colchones & Bases</a>
        </div>
        
        <nav class="nav-menu">
          <a routerLink="/" class="nav-link">Inicio</a>
          <a routerLink="/" class="nav-link">Catálogo</a>
          <a *ngIf="authService.isAdmin()" routerLink="/admin" class="nav-link admin-link">
            👑 Admin
          </a>
        </nav>
        
        <div class="header-actions">
          <a routerLink="/cart" class="cart-icon">
            🛒
            <span class="cart-badge" *ngIf="cartService.itemCount() > 0">
              {{ cartService.itemCount() }}
            </span>
          </a>
          
          <!-- Usuario NO autenticado -->
          <ng-container *ngIf="!authService.isAuthenticated()">
            <a routerLink="/auth/login" class="btn-login">Iniciar sesión</a>
          </ng-container>

          <!-- Usuario autenticado -->
          <ng-container *ngIf="authService.isAuthenticated()">
            <a routerLink="/auth/profile" class="btn-profile">
              👤 {{ authService.currentUser()?.name }}
            </a>
            <button (click)="logout()" class="btn-logout">Cerrar sesión</button>
          </ng-container>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
    }
    
    .header-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .logo a {
      font-size: 22px;
      font-weight: 700;
      color: #2d3748;
      text-decoration: none;
    }
    
    .logo a:hover {
      color: #667eea;
    }
    
    .nav-menu {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    
    .nav-link {
      color: #4a5568;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }
    
    .nav-link:hover {
      color: #667eea;
    }
    
    .admin-link {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white !important;
      padding: 6px 16px;
      border-radius: 20px;
      font-weight: 600;
    }
    
    .admin-link:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.4);
    }
    
    .header-actions {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .cart-icon {
      position: relative;
      font-size: 24px;
      color: #4a5568;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .cart-icon:hover {
      color: #667eea;
    }
    
    .cart-badge {
      position: absolute;
      top: -8px;
      right: -10px;
      background: #fc8181;
      color: white;
      font-size: 11px;
      font-weight: 700;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .btn-login {
      padding: 8px 16px;
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      border: 2px solid #667eea;
      border-radius: 8px;
      transition: all 0.3s;
    }
    
    .btn-login:hover {
      background: #667eea;
      color: white;
    }
    
    .btn-profile {
      padding: 8px 16px;
      background: #667eea;
      color: white;
      text-decoration: none;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.3s;
    }
    
    .btn-profile:hover {
      background: #5a67d8;
    }
    
    .btn-logout {
      padding: 8px 16px;
      background: none;
      border: 2px solid #fc8181;
      border-radius: 8px;
      color: #fc8181;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }
    
    .btn-logout:hover {
      background: #fc8181;
      color: white;
    }
    
    @media (max-width: 768px) {
      .nav-menu {
        display: none;
      }
    }
  `]
})
export class HeaderComponent {
  cartService = inject(CartService);
  authService = inject(AuthService);

  logout() {
    this.authService.logout();
  }
}