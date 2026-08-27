import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../../core/models/user.model';
import { AuthResponse } from '../../../core/models/auth-response.model';
import { LoginRequest } from '../../../core/models/login-request.model';
import { RegisterRequest } from '../../../core/models/register-request.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);
  private isAuthenticatedSignal = signal<boolean>(false);

  get currentUser() {
    return this.currentUserSignal.asReadonly();
  }

  get token() {
    return this.tokenSignal.asReadonly();
  }

  get isAuthenticated() {
    return this.isAuthenticatedSignal.asReadonly();
  }

  isAdmin(): boolean {
    const user = this.currentUserSignal();
    return user?.role === 'admin';
  }

  constructor() {
    this.loadStoredSession();
  }

  private loadStoredSession() {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('auth_user');

    if (token && user) {
      this.tokenSignal.set(token);
      this.currentUserSignal.set(JSON.parse(user));
      this.isAuthenticatedSignal.set(true);
      this.validateToken();
    } else {
      this.clearSession();
    }
  }

  private validateToken(): void {
    this.http.get(`${environment.apiUrl}/auth/user`).subscribe({
      next: (response: any) => {
        if (response.user) {
          this.currentUserSignal.set(response.user);
          localStorage.setItem('auth_user', JSON.stringify(response.user));
        }
      },
      error: () => {
        this.clearSession();
        const currentUrl = this.router.url;
        if (!currentUrl.includes('/auth/')) {
          this.router.navigate(['/auth/login']);
        }
      }
    });
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/register`, data)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        }),
        catchError((error) => {
          console.error('❌ Error en registro:', error);
          return throwError(() => error);
        })
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, data)
      .pipe(
        tap(response => {
          this.handleAuthResponse(response);
        }),
        catchError((error) => {
          console.error('❌ Error en login:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Cerrar sesión - SIEMPRE limpia localmente (incluso si el token es inválido)
   */
  logout(): void {
    console.log('🔴 Cerrando sesión...');

    const token = this.tokenSignal();

    // 1. Limpiamos inmediatamente la sesión local (mejor UX)
    this.clearSession();

    // 2. Si no había token, solo redirigimos
    if (!token) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // 3. Intentamos avisar al backend (fire-and-forget)
    this.http.post(`${environment.apiUrl}/auth/logout`, {}).subscribe({
      next: () => {
        console.log('✅ Sesión cerrada correctamente en el servidor');
      },
      error: (error) => {
        console.warn('⚠️ No se pudo notificar al servidor (token inválido o expirado):', error.status);
      }
    });

    // 4. Redirigimos siempre
    this.router.navigate(['/auth/login']);
  }

  /**
   * Limpia la sesión localmente y redirige. NO hace peticiones HTTP.
   */
  clearSessionAndRedirect(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  refreshToken(): Observable<any> {
    return this.http.post(`${environment.apiUrl}/auth/refresh`, {})
      .pipe(
        tap((response: any) => {
          if (response.authorization?.token) {
            this.tokenSignal.set(response.authorization.token);
            this.isAuthenticatedSignal.set(true);
            localStorage.setItem('auth_token', response.authorization.token);
          }
        }),
        catchError((error) => {
          this.clearSessionAndRedirect();
          return throwError(() => error);
        })
      );
  }

  getUserProfile(): Observable<any> {
    return this.http.get(`${environment.apiUrl}/auth/user`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${environment.apiUrl}/auth/profile`, data)
      .pipe(
        tap((response: any) => {
          if (response.user) {
            this.currentUserSignal.set(response.user);
            localStorage.setItem('auth_user', JSON.stringify(response.user));
          }
        }),
        catchError((error) => {
          console.error('❌ Error al actualizar perfil:', error);
          return throwError(() => error);
        })
      );
  }

  private handleAuthResponse(response: AuthResponse): void {
    if (response.authorization?.token) {
      this.tokenSignal.set(response.authorization.token);
      this.isAuthenticatedSignal.set(true);
      localStorage.setItem('auth_token', response.authorization.token);
    }

    if (response.user) {
      this.currentUserSignal.set(response.user);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
    }
  }

  private clearSession(): void {
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
}