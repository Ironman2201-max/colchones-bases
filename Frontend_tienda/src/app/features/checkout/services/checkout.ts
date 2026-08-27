import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { CheckoutRequest, CheckoutResponse, Order } from '../models/checkout.model';

@Injectable({
  providedIn: 'root'
})
export class CheckoutService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  // Procesar checkout
  processCheckout(data: CheckoutRequest): Observable<CheckoutResponse> {
    return this.http.post<CheckoutResponse>(`${this.apiUrl}/checkout/process`, data);
  }

  // Obtener historial de pedidos
  getOrders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders`);
  }

  // Obtener pedido específico
  getOrder(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/orders/${id}`);
  }

  // Simular pago (para pruebas)
  simulatePayment(orderId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/checkout/simulate-payment/${orderId}`, {});
  }
}