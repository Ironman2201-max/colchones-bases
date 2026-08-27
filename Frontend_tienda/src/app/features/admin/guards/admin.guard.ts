import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth';

export const adminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // ✅ CORRECTO: isAuthenticated e isAdmin son getters (sin paréntesis)
  if (!authService.isAuthenticated) {
    return router.parseUrl('/auth/login');
  }

  if (!authService.isAdmin) {
    return router.parseUrl('/');
  }

  return true;
};