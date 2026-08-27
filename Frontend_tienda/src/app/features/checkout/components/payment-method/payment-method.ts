import { Component, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-payment-method',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="payment-method">
      <h3>💳 Método de pago</h3>
      
      <div class="payment-options">
        <!-- Tarjeta de crédito -->
        <div class="payment-option" 
             [class.selected]="selectedMethod() === 'credit_card'"
             (click)="selectMethod('credit_card')">
          <div class="option-icon">💳</div>
          <div class="option-info">
            <h4>Tarjeta de crédito</h4>
            <p>Visa, MasterCard, American Express</p>
          </div>
          <div class="option-check" *ngIf="selectedMethod() === 'credit_card'">✓</div>
        </div>
        
        <!-- Nequi -->
        <div class="payment-option" 
             [class.selected]="selectedMethod() === 'nequi'"
             (click)="selectMethod('nequi')">
          <div class="option-icon">📱</div>
          <div class="option-info">
            <h4>Nequi</h4>
            <p>Paga con tu cuenta Nequi</p>
          </div>
          <div class="option-check" *ngIf="selectedMethod() === 'nequi'">✓</div>
        </div>
        
        <!-- PayPal -->
        <div class="payment-option" 
             [class.selected]="selectedMethod() === 'paypal'"
             (click)="selectMethod('paypal')">
          <div class="option-icon">🅿️</div>
          <div class="option-info">
            <h4>PayPal</h4>
            <p>Paga con tu cuenta PayPal</p>
          </div>
          <div class="option-check" *ngIf="selectedMethod() === 'paypal'">✓</div>
        </div>
        
        <!-- Mercado Pago -->
        <div class="payment-option" 
             [class.selected]="selectedMethod() === 'mercado_pago'"
             (click)="selectMethod('mercado_pago')">
          <div class="option-icon">🟡</div>
          <div class="option-info">
            <h4>Mercado Pago</h4>
            <p>Paga con Mercado Pago</p>
          </div>
          <div class="option-check" *ngIf="selectedMethod() === 'mercado_pago'">✓</div>
        </div>
      </div>
      
      <!-- Formulario Nequi -->
      <div *ngIf="selectedMethod() === 'nequi'" class="nequi-form">
        <h4>📱 Datos para pago con Nequi</h4>
        <p class="nequi-info">
          Te enviaremos un mensaje de texto a tu número Nequi para confirmar el pago.
        </p>
        
        <form [formGroup]="nequiForm" (ngSubmit)="submitNequi()">
          <div class="form-group">
            <label for="nequi_phone">Número de teléfono Nequi *</label>
            <input type="tel" id="nequi_phone" formControlName="phone_number" 
                   placeholder="3001234567" class="nequi-input">
            <small *ngIf="nequiForm.get('phone_number')?.invalid && nequiForm.get('phone_number')?.touched" 
                   class="error">
              Ingresa un número de teléfono válido (10 dígitos)
            </small>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="document_type">Tipo de documento</label>
              <select id="document_type" formControlName="document_type" class="nequi-input">
                <option value="cedula">Cédula de ciudadanía</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="nit">NIT</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="document_number">Número de documento</label>
              <input type="text" id="document_number" formControlName="document_number" 
                     placeholder="123456789" class="nequi-input">
            </div>
          </div>
          
          <button type="submit" class="btn-nequi-pay" [disabled]="nequiForm.invalid">
            Pagar con Nequi
          </button>
        </form>
      </div>
      
      <!-- Botón de pago general -->
      <div class="payment-actions" *ngIf="selectedMethod() && selectedMethod() !== 'nequi'">
        <button class="btn-pay" [disabled]="!selectedMethod()" (click)="submitPayment()">
          Pagar ahora con {{ getMethodName() }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .payment-method {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .payment-method h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #2d3748;
    }
    
    .payment-options {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    
    .payment-option {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 16px;
      align-items: center;
      padding: 16px;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .payment-option:hover {
      border-color: #667eea;
      background: #f7fafc;
    }
    
    .payment-option.selected {
      border-color: #667eea;
      background: #ebf0ff;
    }
    
    .option-icon {
      font-size: 28px;
    }
    
    .option-info h4 {
      margin: 0;
      font-size: 16px;
      color: #2d3748;
    }
    
    .option-info p {
      margin: 4px 0 0 0;
      font-size: 13px;
      color: #a0aec0;
    }
    
    .option-check {
      width: 28px;
      height: 28px;
      background: #667eea;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
    }
    
    .nequi-form {
      margin-top: 20px;
      padding: 20px;
      background: #f0f9ff;
      border-radius: 12px;
      border: 2px solid #667eea;
    }
    
    .nequi-form h4 {
      margin: 0 0 8px 0;
      color: #2d3748;
    }
    
    .nequi-info {
      color: #4a5568;
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .form-group {
      margin-bottom: 12px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 4px;
      font-weight: 500;
      color: #2d3748;
      font-size: 14px;
    }
    
    .nequi-input {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
      background: white;
    }
    
    .nequi-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    
    .nequi-input.ng-invalid.ng-touched {
      border-color: #fc8181;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
    }
    
    .error {
      color: #fc8181;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }
    
    .btn-nequi-pay {
      width: 100%;
      padding: 14px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
    }
    
    .btn-nequi-pay:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.3);
    }
    
    .btn-nequi-pay:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }
    
    .payment-actions {
      margin-top: 20px;
    }
    
    .btn-pay {
      width: 100%;
      padding: 16px;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
    }
    
    .btn-pay:hover:not(:disabled) {
      background: #38a169;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(72,187,120,0.3);
    }
    
    .btn-pay:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }
    
    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PaymentMethodComponent {
  @Output() paymentSubmit = new EventEmitter<any>();
  
  private fb = inject(FormBuilder);
  
  selectedMethod = signal<string>('');
  
  nequiForm: FormGroup = this.fb.group({
    phone_number: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    document_type: ['cedula'],
    document_number: ['']
  });
  
  selectMethod(method: string) {
    this.selectedMethod.set(method);
    if (method !== 'nequi') {
      this.submitPayment();
    }
  }
  
  submitPayment() {
    if (this.selectedMethod()) {
      this.paymentSubmit.emit({
        method: this.selectedMethod(),
        data: null
      });
    }
  }
  
  submitNequi() {
    if (this.nequiForm.valid) {
      this.paymentSubmit.emit({
        method: 'nequi',
        data: this.nequiForm.value
      });
    }
  }
  
  getMethodName(): string {
    const methods: { [key: string]: string } = {
      'credit_card': 'Tarjeta de crédito',
      'paypal': 'PayPal',
      'mercado_pago': 'Mercado Pago',
      'nequi': 'Nequi'
    };
    return methods[this.selectedMethod()] || '';
  }
}