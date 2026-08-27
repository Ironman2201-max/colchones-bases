import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CheckoutService } from '../../services/checkout';
import { AddressFormComponent } from '../../components/address-form/address-form';
import { PaymentMethodComponent } from '../../components/payment-method/payment-method';
import { OrderSummaryComponent } from '../../components/order-summary/order-summary';
import { CartService } from '../../../cart/services/cart';
import { AuthService } from '../../../auth/services/auth';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [
    CommonModule, 
    AddressFormComponent, 
    PaymentMethodComponent, 
    OrderSummaryComponent
  ],
  template: `
    <div class="checkout-container">
      <h1>💳 Checkout</h1>
      <p class="subtitle">Completa tus datos para finalizar la compra</p>
      
      <!-- ✅ Verificar autenticación - SIN paréntesis -->
      <div *ngIf="!authService.isAuthenticated" class="auth-warning">
        <p>⚠️ Debes iniciar sesión para continuar</p>
        <a routerLink="/auth/login" class="btn-login">Iniciar sesión</a>
      </div>
      
      <!-- ✅ Verificar carrito vacío -->
      <div *ngIf="authService.isAuthenticated() && cartService.items().length === 0" class="auth-warning">
        <p>🛒 Tu carrito está vacío</p>
        <a routerLink="/" class="btn-login">Ver productos</a>
      </div>
      
      <!-- ✅ Checkout visible cuando hay productos -->
      <div *ngIf="authService.isAuthenticated() && cartService.items().length > 0" class="checkout-content">
        <div class="checkout-forms">
          <app-address-form (addressSubmit)="onAddressSubmit($event)">
          </app-address-form>
          
          <app-payment-method 
            *ngIf="addressSubmitted()"
            (paymentSubmit)="onPaymentSubmit($event)">
          </app-payment-method>
        </div>
        
        <div class="checkout-summary">
          <app-order-summary></app-order-summary>
        </div>
      </div>
      
      <!-- Loading -->
      <div *ngIf="isLoading()" class="loading-overlay">
        <div class="spinner"></div>
        <p>Procesando tu pedido...</p>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .checkout-container h1 {
      font-size: 28px;
      color: #2d3748;
      margin-bottom: 8px;
    }
    
    .subtitle {
      color: #a0aec0;
      margin-bottom: 30px;
    }
    
    .auth-warning {
      text-align: center;
      padding: 40px;
      background: #fff5f5;
      border-radius: 12px;
      border: 2px solid #fc8181;
    }
    
    .auth-warning p {
      color: #c53030;
      font-size: 18px;
      margin-bottom: 16px;
    }
    
    .btn-login {
      display: inline-block;
      padding: 12px 32px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
    }
    
    .btn-login:hover {
      background: #5a67d8;
    }
    
    .checkout-content {
      display: grid;
      grid-template-columns: 1fr 380px;
      gap: 30px;
    }
    
    .checkout-forms {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 999;
    }
    
    .spinner {
      width: 48px;
      height: 48px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    .loading-overlay p {
      margin-top: 16px;
      color: #4a5568;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    @media (max-width: 1024px) {
      .checkout-content {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class CheckoutPageComponent implements OnInit {
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);
  cartService = inject(CartService);
  authService = inject(AuthService);
  
  addressSubmitted = signal(false);
  isLoading = signal(false);
  
  private addressData: any = null;
  private paymentData: any = null;
  
  ngOnInit() {
    console.log('🔍 Verificando autenticación...');
    console.log('🔐 ¿Autenticado?', this.authService.isAuthenticated);
    console.log('📦 Items en carrito:', this.cartService.items().length);
    
    // ✅ Cargar el carrito
    this.cartService.loadCart();
    
    if (!this.authService.isAuthenticated) {
      console.log('❌ No autenticado, redirigiendo a login...');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    if (this.cartService.items().length === 0) {
      console.log('❌ Carrito vacío, redirigiendo...');
      this.router.navigate(['/cart']);
      return;
    }
    
    console.log('✅ Todo listo para checkout');
  }
  
  onAddressSubmit(data: any) {
    this.addressData = data;
    this.addressSubmitted.set(true);
    console.log('📦 Dirección guardada:', data);
  }
  
  onPaymentSubmit(event: any) {
    this.paymentData = event;
    console.log('💳 Datos de pago:', event);
    this.processCheckout();
  }
  
  processCheckout() {
    if (!this.authService.isAuthenticated) {
      alert('⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
      this.router.navigate(['/auth/login']);
      return;
    }
    
    this.isLoading.set(true);
    
    const checkoutData = {
      ...this.addressData,
      payment_method: this.paymentData.method,
      payment_data: this.paymentData.data
    };
    
    console.log('📦 Enviando checkout:', checkoutData);
    
    this.checkoutService.processCheckout(checkoutData).subscribe({
      next: (response) => {
        console.log('✅ Pedido creado:', response);
        this.isLoading.set(false);
        this.router.navigate(['/checkout/success', response.data.order.id]);
      },
      error: (error) => {
        console.error('❌ Error al procesar checkout:', error);
        this.isLoading.set(false);
        
        if (error.status === 401) {
          alert('⚠️ Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
          this.authService.logout();
          this.router.navigate(['/auth/login']);
        } else if (error.status === 422) {
          alert('❌ Datos inválidos. Verifica tu información.');
          console.log('📋 Errores de validación:', error.error?.errors);
        } else {
          alert('❌ Error al procesar el pedido. Intenta nuevamente.');
        }
      }
    });
  }
}