import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/dashboard/dashboard').then(c => c.DashboardComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'products',
    loadComponent: () => import('./pages/products/products-list/products-list').then(c => c.ProductsListComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'products/new',
    loadComponent: () => import('./pages/products/product-form/product-form').then(c => c.ProductFormComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'products/edit/:id',
    loadComponent: () => import('./pages/products/product-form/product-form').then(c => c.ProductFormComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'orders',
    loadComponent: () => import('./pages/orders/orders-list/orders-list').then(c => c.OrdersListComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'orders/:id',
    loadComponent: () => import('./pages/orders/order-detail/order-detail').then(c => c.OrderDetailComponent),
    canActivate: [adminGuard]
  },
  {
    path: 'users',
    loadComponent: () => import('./pages/users/users-list/users-list').then(c => c.UsersListComponent),
    canActivate: [adminGuard]
  }
];