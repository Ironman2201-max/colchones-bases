import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div style="padding: 40px; text-align: center;">
      <h1>📋 Gestión de Pedidos</h1>
      <p style="color: #666;">Módulo en construcción - Próximamente disponible</p>
    </div>
  `
})
export class OrdersComponent {}