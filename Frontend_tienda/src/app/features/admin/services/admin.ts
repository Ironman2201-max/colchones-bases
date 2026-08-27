import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // ===== DASHBOARD =====
  getDashboard(): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/dashboard`);
  }

  // ===== PRODUCTOS =====
  getProducts(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products`, { params });
  }

  getProduct(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/products/${id}`);
  }

  createProduct(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/admin/products`, data);
  }

  updateProduct(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/products/${id}`, data);
  }

  deleteProduct(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/admin/products/${id}`);
  }

  toggleProductStatus(id: number): Observable<any> {
    return this.http.patch(`${this.apiUrl}/admin/products/${id}/toggle-status`, {});
  }

  // ===== PEDIDOS =====
  getOrders(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders`, { params });
  }

  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/orders/${id}`);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/orders/${id}/status`, { status });
  }

  // ===== USUARIOS =====
  getUsers(params?: any): Observable<any> {
    return this.http.get(`${this.apiUrl}/admin/users`, { params });
  }

  updateUserRole(id: number, role: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/admin/users/${id}/role`, { role });
  }

  // ===== CATEGORÍAS =====
  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}/categories`);
    }


}