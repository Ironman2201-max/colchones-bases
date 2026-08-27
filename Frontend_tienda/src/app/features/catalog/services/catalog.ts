import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Product, Category } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Obtener todos los productos con filtros
  getProducts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`, { params });
  }

  // Obtener producto por slug
  getProductBySlug(slug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${slug}`);
  }

  // Obtener producto por ID
  getProductById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/${id}`);
  }

  // Obtener categorías
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
  }

  // Buscar productos
  searchProducts(query: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/search?q=${query}`);
  }

  // Obtener productos destacados
  getFeaturedProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products/featured`);
  }

  // Obtener productos por categoría
  getProductsByCategory(categorySlug: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories/${categorySlug}/products`);
  }
}