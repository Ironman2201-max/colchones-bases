import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CatalogService } from '../../services/catalog';
import { ProductCardComponent } from '../../components/product-card/product-card';
import { FiltersComponent } from '../../components/filters/filters';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent, FiltersComponent],
  template: `
    <div class="catalog-container">
      <div class="catalog-header">
        <h1>Catálogo de Productos</h1>
        <div class="catalog-controls">
          <div class="search-box">
            <input type="text" 
                   [(ngModel)]="searchQuery" 
                   (input)="onSearch()"
                   placeholder="Buscar productos..."
                   class="search-input">
          </div>
          <select [(ngModel)]="sortBy" (change)="applyFilters()" class="sort-select">
            <option value="name_asc">Nombre (A-Z)</option>
            <option value="name_desc">Nombre (Z-A)</option>
            <option value="price_asc">Precio (menor a mayor)</option>
            <option value="price_desc">Precio (mayor a menor)</option>
            <option value="newest">Más nuevos</option>
          </select>
        </div>
      </div>
      
      <div class="catalog-content">
        <div class="filters-sidebar">
          <app-filters (filterChange)="onFilterChange($event)"></app-filters>
        </div>
        
        <div class="products-grid">
          <div *ngIf="isLoading()" class="loading-spinner">
            <div class="spinner"></div>
            <p>Cargando productos...</p>
          </div>
          
          <div *ngIf="!isLoading() && products().length === 0" class="empty-state">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
            <h3>No se encontraron productos</h3>
            <p>Prueba ajustando los filtros o buscando con otros términos</p>
          </div>
          
          <app-product-card *ngFor="let product of products()" 
                            [product]="product">
          </app-product-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .catalog-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 20px;
    }
    
    .catalog-header {
      margin-bottom: 30px;
    }
    
    .catalog-header h1 {
      font-size: 32px;
      color: #2d3748;
      margin-bottom: 20px;
    }
    
    .catalog-controls {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    
    .search-box {
      flex: 1;
      min-width: 200px;
    }
    
    .search-input {
      width: 100%;
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .search-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }
    
    .sort-select {
      padding: 10px 16px;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 14px;
      background: white;
      cursor: pointer;
    }
    
    .catalog-content {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 30px;
    }
    
    .filters-sidebar {
      position: sticky;
      top: 20px;
      height: fit-content;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 24px;
    }
    
    .loading-spinner {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 0;
    }
    
    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #e2e8f0;
      border-top-color: #667eea;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 16px;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .empty-state {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: #a0aec0;
    }
    
    .empty-state svg {
      margin-bottom: 16px;
      color: #a0aec0;
    }
    
    .empty-state h3 {
      color: #4a5568;
      margin-bottom: 8px;
    }
    
    @media (max-width: 768px) {
      .catalog-content {
        grid-template-columns: 1fr;
      }
      
      .filters-sidebar {
        position: static;
      }
      
      .catalog-controls {
        flex-direction: column;
      }
      
      .products-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }
    }
  `]
})
export class ProductListComponent implements OnInit {
  private catalogService = inject(CatalogService);
  
  products = signal<Product[]>([]);
  isLoading = signal(false);
  searchQuery = '';
  sortBy = 'newest';
  currentFilters: any = {};
  
  ngOnInit() {
    this.loadProducts();
  }
  
  loadProducts() {
    this.isLoading.set(true);
    const params = {
      ...this.currentFilters,
      sort: this.sortBy,
      search: this.searchQuery
    };
    
    this.catalogService.getProducts(params).subscribe({
      next: (response) => {
        this.products.set(response.data || []);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar productos:', error);
        this.isLoading.set(false);
      }
    });
  }
  
  onFilterChange(filters: any) {
    this.currentFilters = filters;
    this.loadProducts();
  }
  
  onSearch() {
    this.loadProducts();
  }
  
  applyFilters() {
    this.loadProducts();
  }
}