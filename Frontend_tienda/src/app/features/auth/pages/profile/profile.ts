import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="profile-container">
      <div class="profile-card">
        <h1>Mi Perfil</h1>
        <p class="subtitle">Gestiona tu información personal</p>
        
        <div class="user-info">
          <div class="avatar">
            {{ userInitial() }}
          </div>
          <h2>{{ user()?.name }}</h2>
          <p class="email">{{ user()?.email }}</p>
          <span class="role">{{ user()?.role }}</span>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nombre Completo</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name"
              [class.error]="profileForm.get('name')?.invalid && profileForm.get('name')?.touched"
            >
          </div>

          <div class="form-group">
            <label for="phone">Teléfono</label>
            <input 
              type="tel" 
              id="phone" 
              formControlName="phone"
            >
          </div>

          <div class="form-group">
            <label for="address">Dirección</label>
            <input 
              type="text" 
              id="address" 
              formControlName="address"
            >
          </div>

          <div class="form-group">
            <label for="password">Nueva Contraseña (opcional)</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              placeholder="••••••••"
            >
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirmar Nueva Contraseña</label>
            <input 
              type="password" 
              id="password_confirmation" 
              formControlName="password_confirmation"
              placeholder="••••••••"
            >
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              {{ errorMessage() }}
            </div>
          }

          @if (successMessage()) {
            <div class="alert alert-success">
              {{ successMessage() }}
            </div>
          }

          <div class="button-group">
            <button 
              type="submit" 
              [disabled]="profileForm.invalid || isLoading()"
              class="btn-primary"
            >
              @if (isLoading()) {
                <span class="spinner"></span>
                Guardando...
              } @else {
                Actualizar Perfil
              }
            </button>

            <button 
              type="button" 
              (click)="logout()"
              class="btn-danger"
            >
              Cerrar Sesión
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .profile-card {
      background: white;
      border-radius: 20px;
      padding: 40px 36px;
      width: 100%;
      max-width: 500px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      animation: slideUp 0.5s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    h1 {
      font-size: 28px;
      color: #2d3748;
      margin-bottom: 8px;
      font-weight: 700;
    }

    .subtitle {
      color: #718096;
      margin-bottom: 28px;
      font-size: 14px;
    }

    .user-info {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #f0f0f0;
    }

    .avatar {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #667eea;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
      font-weight: bold;
      margin: 0 auto 12px;
    }

    .user-info h2 {
      margin: 0;
      color: #2d3748;
    }

    .email {
      color: #718096;
      margin: 4px 0;
    }

    .role {
      display: inline-block;
      background: #48bb78;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: 600;
    }

    .form-group {
      margin-bottom: 16px;
    }

    label {
      display: block;
      margin-bottom: 6px;
      color: #2d3748;
      font-weight: 500;
      font-size: 14px;
    }

    input {
      width: 100%;
      padding: 12px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
      background: #f7fafc;
    }

    input:focus {
      outline: none;
      border-color: #667eea;
      background: white;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    input.error {
      border-color: #fc8181;
    }

    .alert {
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 14px;
      margin-bottom: 16px;
    }

    .alert-danger {
      background: #fff5f5;
      color: #c53030;
      border: 1px solid #feb2b2;
    }

    .alert-success {
      background: #f0fff4;
      color: #276749;
      border: 1px solid #9ae6b4;
    }

    .button-group {
      display: flex;
      gap: 12px;
      margin-top: 8px;
    }

    .btn-primary {
      flex: 1;
      padding: 14px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5a67d8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(102,126,234,0.4);
    }

    .btn-primary:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }

    .btn-danger {
      padding: 14px 24px;
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-danger:hover {
      background: #f56565;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(252,129,129,0.4);
    }

    .spinner {
      width: 20px;
      height: 20px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.currentUser;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  profileForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    phone: [''],
    address: [''],
    password: [''],
    password_confirmation: ['']
  });

  userInitial(): string {
    const user = this.user();
    if (!user) return '?';
    return user.name.charAt(0).toUpperCase();
  }

  ngOnInit() {
    const user = this.user();
    if (user) {
      this.profileForm.patchValue({
        name: user.name,
        phone: user.phone || '',
        address: user.address || ''
      });
    }
  }

  onSubmit() {
    if (this.profileForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const formData = this.profileForm.value;
    if (!formData.password) {
      delete formData.password;
      delete formData.password_confirmation;
    }

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Perfil actualizado exitosamente');
        this.profileForm.patchValue({
          password: '',
          password_confirmation: ''
        });
        setTimeout(() => this.successMessage.set(''), 5000);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 422 && error.error?.errors) {
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          this.errorMessage.set(firstError as string);
        } else {
          this.errorMessage.set('Error al actualizar perfil');
        }
        console.error('Update error:', error);
      }
    });
  }

  logout() {
    this.authService.logout();
  }
}