import { Component, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="admin-header">
      <div class="header-left">
        <button class="menu-toggle" (click)="toggleSidebar()">
          ☰
        </button>
        <h1>{{ title }}</h1>
      </div>
      
      <div class="header-right">
        <span class="user-info">
          👤 {{ authService.currentUser()?.name }}
        </span>
        <button (click)="logout()" class="btn-logout">
          Cerrar sesión
        </button>
      </div>
    </header>
  `,
  styles: [`
    .admin-header {
      background: white;
      padding: 16px 24px;
      border-bottom: 2px solid #f0f0f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      position: sticky;
      top: 0;
      z-index: 99;
    }
    
    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .menu-toggle {
      display: none;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #4a5568;
    }
    
    .menu-toggle:hover {
      color: #667eea;
    }
    
    .header-left h1 {
      margin: 0;
      font-size: 20px;
      color: #2d3748;
    }
    
    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .user-info {
      color: #4a5568;
      font-size: 14px;
    }
    
    .btn-logout {
      padding: 8px 16px;
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s;
    }
    
    .btn-logout:hover {
      background: #f56565;
      transform: translateY(-2px);
    }
    
    @media (max-width: 768px) {
      .menu-toggle {
        display: block;
      }
    }
  `]
})
export class AdminHeaderComponent {
  @Input() title: string = 'Dashboard';
  
  private router = inject(Router);
  authService = inject(AuthService);
  
  toggleSidebar() {
    // Lógica para toggle sidebar en móvil
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('mobile-open');
    }
  }
  
  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}