import { Routes } from '@angular/router';
import { authGuard } from '../auth/guards/auth.guard';

export const CATALOG_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/product-list/product-list').then(c => c.ProductListComponent)
  },
  {
    path: 'producto/:slug',
    loadComponent: () => import('./pages/product-detail/product-detail').then(c => c.ProductDetailComponent)
  },
  {
    path: 'categoria/:slug',
    loadComponent: () => import('./pages/product-list/product-list').then(c => c.ProductListComponent)
  },
  {
    path: 'buscar',
    loadComponent: () => import('./pages/product-list/product-list').then(c => c.ProductListComponent)
  }
];