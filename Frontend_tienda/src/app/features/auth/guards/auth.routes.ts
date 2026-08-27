// src/app/features/auth/auth.routes.ts
import { Routes } from '@angular/router';
import { publicGuard } from './public.guard';
import { authGuard } from './auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    loadComponent: () => import('../pages/login/login').then(c => c.LoginComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'register',
    loadComponent: () => import('../pages/register/register').then(c => c.RegisterComponent),
    canActivate: [publicGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('../pages/profile/profile').then(c => c.ProfileComponent),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];