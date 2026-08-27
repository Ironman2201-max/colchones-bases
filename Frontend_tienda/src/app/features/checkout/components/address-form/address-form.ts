import { Component, Output, EventEmitter, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../../../features/auth/services/auth';

@Component({
  selector: 'app-address-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="address-form">
      <h3>📦 Dirección de envío</h3>
      
      <form [formGroup]="addressForm" (ngSubmit)="onSubmit()">
        <div class="form-row">
          <div class="form-group">
            <label for="shipping_name">Nombre completo *</label>
            <input type="text" id="shipping_name" formControlName="shipping_name" 
                   placeholder="Tu nombre completo">
            <small *ngIf="addressForm.get('shipping_name')?.invalid && addressForm.get('shipping_name')?.touched" 
                   class="error">
              El nombre es requerido
            </small>
          </div>
          
          <div class="form-group">
            <label for="shipping_phone">Teléfono</label>
            <input type="tel" id="shipping_phone" formControlName="shipping_phone" 
                   placeholder="+57 300 123 4567">
          </div>
        </div>
        
        <div class="form-group">
          <label for="shipping_address">Dirección *</label>
          <input type="text" id="shipping_address" formControlName="shipping_address" 
                 placeholder="Calle 123 # 45-67">
          <small *ngIf="addressForm.get('shipping_address')?.invalid && addressForm.get('shipping_address')?.touched" 
                 class="error">
            La dirección es requerida
          </small>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="shipping_city">Ciudad *</label>
            <input type="text" id="shipping_city" formControlName="shipping_city" 
                   placeholder="Bogotá">
            <small *ngIf="addressForm.get('shipping_city')?.invalid && addressForm.get('shipping_city')?.touched" 
                   class="error">
              La ciudad es requerida
            </small>
          </div>
          
          <div class="form-group">
            <label for="shipping_state">Departamento *</label>
            <input type="text" id="shipping_state" formControlName="shipping_state" 
                   placeholder="Cundinamarca">
            <small *ngIf="addressForm.get('shipping_state')?.invalid && addressForm.get('shipping_state')?.touched" 
                   class="error">
              El departamento es requerido
            </small>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="shipping_postal_code">Código postal</label>
            <input type="text" id="shipping_postal_code" formControlName="shipping_postal_code" 
                   placeholder="110111">
          </div>
          
          <div class="form-group">
            <label for="shipping_country">País *</label>
            <input type="text" id="shipping_country" formControlName="shipping_country" 
                   placeholder="Colombia">
            <small *ngIf="addressForm.get('shipping_country')?.invalid && addressForm.get('shipping_country')?.touched" 
                   class="error">
              El país es requerido
            </small>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="submit" class="btn-next" [disabled]="addressForm.invalid">
            Continuar con el pago →
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .address-form {
      background: white;
      padding: 24px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .address-form h3 {
      margin: 0 0 20px 0;
      font-size: 18px;
      color: #2d3748;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    
    .form-group {
      margin-bottom: 16px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 6px;
      font-weight: 500;
      color: #2d3748;
      font-size: 14px;
    }
    
    .form-group input {
      width: 100%;
      padding: 10px 14px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    
    .form-group input.ng-invalid.ng-touched {
      border-color: #fc8181;
    }
    
    .error {
      color: #fc8181;
      font-size: 12px;
      margin-top: 4px;
      display: block;
    }
    
    .form-actions {
      margin-top: 20px;
    }
    
    .btn-next {
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
    }
    
    .btn-next:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.3);
    }
    
    .btn-next:disabled {
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
export class AddressFormComponent implements OnInit {
  @Output() addressSubmit = new EventEmitter<any>();
  
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  
  addressForm: FormGroup = this.fb.group({
    shipping_name: ['', [Validators.required]],
    shipping_address: ['', [Validators.required]],
    shipping_city: ['', [Validators.required]],
    shipping_state: ['', [Validators.required]],
    shipping_postal_code: [''],
    shipping_country: ['Colombia', [Validators.required]],
    shipping_phone: ['']
  });
  
  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.addressForm.patchValue({
        shipping_name: user.name || '',
        shipping_phone: user.phone || '',
        shipping_address: user.address || ''
      });
    }
  }
  
  onSubmit() {
    if (this.addressForm.valid) {
      this.addressSubmit.emit(this.addressForm.value);
    }
  }
}