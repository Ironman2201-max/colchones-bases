// src/app/features/auth/pages/login/login.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Iniciar Sesión</h1>
        <p class="subtitle">Bienvenido a Colchones & Bases</p>
        
        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input 
              type="email" 
              id="email" 
              formControlName="email"
              placeholder="tu@email.com"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
            >
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <small class="error-message">
                @if (loginForm.get('email')?.errors?.['required']) {
                  El email es requerido
                }
                @if (loginForm.get('email')?.errors?.['email']) {
                  Ingresa un email válido
                }
              </small>
            }
          </div>

          <div class="form-group">
            <label for="password">Contraseña</label>
            <input 
              type="password" 
              id="password" 
              formControlName="password"
              placeholder="••••••••"
              [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
            >
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <small class="error-message">
                @if (loginForm.get('password')?.errors?.['required']) {
                  La contraseña es requerida
                }
                @if (loginForm.get('password')?.errors?.['minlength']) {
                  Mínimo 8 caracteres
                }
              </small>
            }
          </div>

          @if (errorMessage()) {
            <div class="alert alert-danger">
              {{ errorMessage() }}
            </div>
          }

          <button 
            type="submit" 
            [disabled]="loginForm.invalid || isLoading()"
            class="btn-primary"
          >
            @if (isLoading()) {
              <span class="spinner"></span>
              Cargando...
            } @else {
              Iniciar Sesión
            }
          </button>

          <div class="login-footer">
            <a routerLink="/auth/register" class="register-link">
              ¿No tienes cuenta? Regístrate
            </a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 48px 40px;
      width: 100%;
      max-width: 420px;
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
      margin-bottom: 32px;
      font-size: 14px;
    }

    .form-group {
      margin-bottom: 20px;
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
      margin-bottom: 20px;
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

    .login-footer {
      margin-top: 24px;
      text-align: center;
    }

    .register-link {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      font-size: 14px;
      transition: color 0.3s;
    }

    .register-link:hover {
      color: #5a67d8;
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  isLoading = signal(false);
  errorMessage = signal('');

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.isLoading.set(false);
        if (error.status === 401) {
          this.errorMessage.set('Email o contraseña incorrectos');
        } else {
          this.errorMessage.set('Error al iniciar sesión. Intenta nuevamente.');
        }
        console.error('Login error:', error);
      }
    });
  }
}