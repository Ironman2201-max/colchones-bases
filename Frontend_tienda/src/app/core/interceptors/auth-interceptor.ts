import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth';
import { catchError, switchMap, throwError } from 'rxjs';
import { Router } from '@angular/router';

// Rutas que NUNCA deben llevar token (son públicas).
// OJO: solo login/register. El resto de endpoints bajo /auth/
// (upload-image, user, profile, logout) SÍ requieren el token porque
// están protegidos con auth:api en el backend.
const PUBLIC_AUTH_PATHS = [
  '/auth/login',
  '/auth/register',
];

// Rutas de auth que no deben disparar el flujo de refresh si fallan con 401
// (evita loops: no queremos refrescar el token al fallar el propio refresh/logout)
const AUTH_EXCLUDED_FROM_REFRESH = [
  '/auth/refresh',
  '/auth/login',
  '/auth/register',
  '/auth/logout',
];

function isPublicAuthPath(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some(path => url.includes(path));
}

function isExcludedFromRefresh(url: string): boolean {
  return AUTH_EXCLUDED_FROM_REFRESH.some(path => url.includes(path));
}

let isRefreshing = false;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  // Solo las rutas públicas (login/register) van sin token.
  // Todo lo demás, incluyendo otras rutas /auth/*, SÍ lleva el header.
  let authReq = req;
  if (token && !isPublicAuthPath(req.url)) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(authReq).pipe(
    catchError((error) => {
      // Si la petición que falló es de auth pública o de refresh/logout,
      // no intentamos refrescar el token (evita loops infinitos)
      if (error.status === 401 && isExcludedFromRefresh(req.url)) {
        return throwError(() => error);
      }

      if (error.status === 401) {
        if (isRefreshing) {
          return throwError(() => error);
        }

        isRefreshing = true;

        return authService.refreshToken().pipe(
          switchMap(() => {
            isRefreshing = false;
            const newToken = authService.token();
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`,
              },
            });
            return next(retryReq);
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            authService.clearSessionAndRedirect();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};