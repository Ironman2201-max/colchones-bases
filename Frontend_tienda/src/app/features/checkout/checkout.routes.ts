import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const CHECKOUT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/checkout-page/checkout-page').then(c => c.CheckoutPageComponent),
    canActivate: [authGuard]
  },
  {
    path: 'success/:id',
    loadComponent: () => import('./pages/success-page/success-page').then(c => c.SuccessPageComponent),
    canActivate: [authGuard]
  }
];