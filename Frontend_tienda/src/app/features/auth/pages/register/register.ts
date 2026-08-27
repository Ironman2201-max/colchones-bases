// src/app/features/auth/pages/register/register.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="register-container">
      <div class="register-card">
        <h1>Crear Cuenta</h1>
        <p class="subtitle">Únete a Colchones & Bases</p>
        
        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nombre Completo</label>
            <input 
              type="text" 
              id="name" 
              formControlName="name"
              placeholder="Tu nombre"
              [class.error]="registerForm.get('name')?.invalid && registerForm.get('name')?.touched"
            >
            @if (registerForm.get('name')?.invalid && registerForm.get('name')?.touched) {
              <small class="error-message">El nombre es requerido</small>
            }
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="tu@email.com"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
            >
            @if (registerForm.get('email')?.invalid && registerForm.get('email')?.touched) {
              <small class="error-message">
                @if (registerForm.get('email')?.errors?.['required']) {
                  El email es requerido
                }
                @if (registerForm.get('email')?.errors?.['email']) {
                  Ingresa un email válido
                }
              </small>
            }
          </div>

          <div class="form-group">
            <label for="phone">Teléfono (opcional)</label>
            <input 
              type="tel" 
              id="phone" 
              formControlName="phone"
              placeholder="+57 300 123 4567"
            >
          </div>

          <div class="form-group">
            <label for="address">Dirección (opcional)</label>
            <input 
              type="text" 
              id="address" 
              formControlName="address"
              placeholder="Calle 123 # 45-67"
            >
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              placeholder="••••••••"
              [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
            >
            @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
              <small class="error-message">
                @if (registerForm.get('password')?.errors?.['required']) {
                  La contraseña es requerida
                }
                @if (registerForm.get('password')?.errors?.['minlength']) {
                  Mínimo 8 caracteres
                }
              </small>
            }
          </div>

          <div class="form-group">
            <label for="password_confirmation">Confirmar Contraseña</label>
            <input 
              type="password" 
              id="password_confirmation" 
              formControlName="password_confirmation"
              placeholder="••••••••"
              [class.error]="registerForm.hasError('passwordMismatch') && registerForm.get('password_confirmation')?.touched"
            >
            @if (registerForm.hasError('passwordMismatch') && registerForm.get('password_confirmation')?.touched) {
              <small class="error-message">Las contraseñas no coinciden</small>
            }
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="registerForm.invalid || isLoading()"
            class="btn-primary"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Cargando...
            } @else {
              Crear Cuenta
            }
          </button>

          <div class="register-footer">
            <a routerLink="/auth/login" class="login-link">
              ¿Ya tienes cuenta? Inicia Sesión
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .register-card {
      background: white;
      border-radius: 20px;
      padding: 40px 36px;
      width: 100%;
      max-width: 480px;
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

    .error-message {
      color: #fc8181;
      font-size: 12px;
      margin-top: 4px;
      display: block;
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

    .btn-primary {
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-top: 8px;
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

    .register-footer {
      margin-top: 20px;
      text-align: center;
    }

    .login-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: color 0.3s;
    }

    .login-link:hover {
      color: #5a67d8;
      text-decoration: underline;
    }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    address: [''],
    password: ['', [Validators.required, Validators.minLength(8)]],
    password_confirmation: ['', [Validators.required]]
  }, {
    validators: this.passwordMatchValidator
  });

  isLoading = signal(false);
  errorMessage = signal('');

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('password_confirmation')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 422 && error.error?.errors) {
          const errors = error.error.errors;
          const firstError = Object.values(errors)[0];
          this.errorMessage.set(firstError as string);
        } else {
          this.errorMessage.set('Error al crear cuenta. Intenta nuevamente.');
        }
        console.error('Register error:', error);
      }
    });
  }
}