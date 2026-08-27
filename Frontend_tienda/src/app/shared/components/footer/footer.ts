import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../features/auth/services/auth';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="footer">
      <div class="footer-container">
        <div class="footer-section">
          <h4>🛏️ Colchones & Bases</h4>
          <p>Tu tienda de confianza para colchones y bases de calidad.</p>
        </div>
        
        <div class="footer-section">
          <h4>Enlaces rápidos</h4>
          <a routerLink="/">Inicio</a>
          <a routerLink="/">Catálogo</a>
          <a routerLink="/cart">Carrito</a>
          <!-- ✅ Enlace Admin (solo visible para admin) -->
          <a *ngIf="authService.isAdmin" routerLink="/admin" class="admin-link">
            👑 Panel de Administración
          </a>
        </div>
        
        <div class="footer-section">
          <h4>Contacto</h4>
          <p>📞 +57 300 123 4567</p>
          <p>✉️ info@colchonesybases.com</p>
        </div>
        
        <div class="footer-section">
          <h4>Síguenos</h4>
          <div class="social-links">
            <a href="#">📘</a>
            <a href="#">📸</a>
            <a href="#">🐦</a>
          </div>
        </div>
      </div>
      
      <div class="footer-bottom">
        <p>© 2026 Colchones & Bases. Todos los derechos reservados.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: #2d3748;
      color: white;
      margin-top: 40px;
    }
    
    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 40px 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 30px;
    }
    
    .footer-section h4 {
      margin-bottom: 12px;
      font-size: 16px;
    }
    
    .footer-section p {
      color: #a0aec0;
      font-size: 14px;
      margin: 4px 0;
    }
    
    .footer-section a {
      display: block;
      color: #a0aec0;
      text-decoration: none;
      font-size: 14px;
      margin: 4px 0;
      transition: color 0.3s;
    }
    
    .footer-section a:hover {
      color: white;
    }
    
    .admin-link {
      color: #f6ad55;
      font-weight: 600;
    }
    
    .admin-link:hover {
      color: #fbd38d;
    }
    
    .social-links {
      display: flex;
      gap: 12px;
    }
    
    .social-links a {
      font-size: 24px;
      color: #a0aec0;
      text-decoration: none;
      transition: color 0.3s;
    }
    
    .social-links a:hover {
      color: white;
    }
    
    .footer-bottom {
      border-top: 1px solid #4a5568;
      padding: 16px 20px;
      text-align: center;
      font-size: 14px;
      color: #a0aec0;
    }
  `]
})
export class FooterComponent {
  authService = inject(AuthService);
}