import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-admin-quick-access',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <!-- ✅ Solo visible si es admin -->
    <div *ngIf="authService.isAdmin" class="admin-quick-access">
      <a routerLink="/admin" class="admin-btn" title="Panel de Administración">
        👑
        <span class="btn-text">Admin</span>
      </a>
    </div>
  `,
  styles: [`
    .admin-quick-access {
      position: fixed;
      bottom: 30px;
      right: 30px;
      z-index: 9999;
    }
    
    .admin-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 14px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      border: none;
      cursor: pointer;
    }
    
    .admin-btn:hover {
      transform: translateY(-3px) scale(1.05);
      box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
    }
    
    .admin-btn:active {
      transform: scale(0.95);
    }
    
    .btn-text {
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .admin-quick-access {
        bottom: 20px;
        right: 20px;
      }
      
      .admin-btn {
        padding: 12px 16px;
      }
      
      .btn-text {
        display: none;
      }
    }
  `]
})
export class AdminQuickAccessComponent {
  authService = inject(AuthService);
}