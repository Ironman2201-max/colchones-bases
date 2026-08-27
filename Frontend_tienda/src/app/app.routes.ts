// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { adminGuard } from './features/auth/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./features/catalog/catalog.routes').then(m => m.CATALOG_ROUTES)
  },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/guards/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'cart',
    loadChildren: () => import('./features/cart/cart.routes').then(m => m.CART_ROUTES)
  },
  {
    path: 'checkout',
    loadChildren: () => import('./features/checkout/checkout.routes').then(m => m.CHECKOUT_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES),
    canActivate: [adminGuard]
  },
  { path: '**', redirectTo: '' }
];