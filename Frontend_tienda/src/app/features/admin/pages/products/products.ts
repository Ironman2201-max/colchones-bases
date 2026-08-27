import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1>📦 Gestión de Productos</h1>
      <p style="color: #666;">Módulo en construcción - Próximamente disponible</p>
    </div>
  `
})
export class ProductsComponent {}