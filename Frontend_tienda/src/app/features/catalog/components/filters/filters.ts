import { Component, EventEmitter, Output, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../services/catalog';
import { Category } from '../../models/product.model';

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="filters-container">
      <h3 class="filters-title">Filtros</h3>
      
      <!-- Categorías -->
      <div class="filter-group">
        <label class="filter-label">Categorías</label>
        <div class="category-list">
          <div class="category-item">
            <input type="radio" 
                   id="all-categories" 
                   name="category" 
                   value="all"
                   [checked]="selectedCategory === 'all'"
                   (change)="onCategoryChange('all')">
            <label for="all-categories">Todas</label>
          </div>
          <div *ngFor="let category of categories" class="category-item">
            <input type="radio" 
                   [id]="'cat-' + category.id" 
                   name="category" 
                   [value]="category.slug"
                   [checked]="selectedCategory === category.slug"
                   (change)="onCategoryChange(category.slug)">
            <label [for]="'cat-' + category.id">{{ category.name }}</label>
          </div>
        </div>
      </div>
      
      <!-- Rango de precio -->
      <div class="filter-group">
        <label class="filter-label">Rango de precio</label>
        <div class="price-range">
          <input type="range" 
                 [min]="minPrice" 
                 [max]="maxPrice" 
                 [value]="currentMaxPrice"
                 (input)="onPriceChange($event)"
                 class="price-slider">
          <div class="price-values">
            <span>{{ minPrice | currency:'COP':'symbol':'1.0-0' }}</span>
            <span>{{ currentMaxPrice | currency:'COP':'symbol':'1.0-0' }}</span>
          </div>
        </div>
      </div>
      
      <!-- Estado de stock -->
      <div class="filter-group">
        <label class="filter-label">Disponibilidad</label>
        <div class="stock-options">
          <div class="stock-item">
            <input type="checkbox" 
                   id="in-stock" 
                   [(ngModel)]="showInStock"
                   (change)="applyFilters()">
            <label for="in-stock">En stock</label>
          </div>
          <div class="stock-item">
            <input type="checkbox" 
                   id="out-stock" 
                   [(ngModel)]="showOutStock"
                   (change)="applyFilters()">
            <label for="out-stock">Agotados</label>
          </div>
        </div>
      </div>
      
      <!-- Botón limpiar -->
      <button (click)="clearFilters()" class="btn-clear">
        Limpiar filtros
      </button>
    </div>
  `,
  styles: [`
    .filters-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
    }
    
    .filters-title {
      margin: 0 0 20px 0;
      font-size: 18px;
      font-weight: 600;
      color: #2d3748;
    }
    
    .filter-group {
      margin-bottom: 20px;
    }
    
    .filter-label {
      display: block;
      font-weight: 500;
      margin-bottom: 8px;
      color: #4a5568;
      font-size: 14px;
    }
    
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    
    .category-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .category-item input[type="radio"] {
      accent-color: #667eea;
    }
    
    .price-range {
      margin-top: 8px;
    }
    
    .price-slider {
      width: 100%;
      accent-color: #667eea;
    }
    
    .price-values {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
      font-size: 13px;
      color: #4a5568;
    }
    
    .stock-options {
      display: flex;
      gap: 16px;
    }
    
    .stock-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    
    .stock-item input[type="checkbox"] {
      accent-color: #667eea;
    }
    
    .btn-clear {
      width: 100%;
      padding: 8px;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.3s;
    }
    
    .btn-clear:hover {
      background: #cbd5e0;
    }
  `]
})
export class FiltersComponent implements OnInit {
  @Output() filterChange = new EventEmitter<any>();
  
  private catalogService = inject(CatalogService);
  
  categories: Category[] = [];
  selectedCategory: string = 'all';
  minPrice: number = 0;
  maxPrice: number = 10000000;
  currentMaxPrice: number = 10000000;
  showInStock: boolean = true;
  showOutStock: boolean = true;
  
  ngOnInit() {
    this.loadCategories();
    this.applyFilters();
  }
  
  loadCategories() {
    this.catalogService.getCategories().subscribe({
      next: (response) => {
        this.categories = response.data || [];
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      }
    });
  }
  
  onCategoryChange(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }
  
  onPriceChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.currentMaxPrice = parseInt(input.value);
    this.applyFilters();
  }
  
  applyFilters() {
    const filters = {
      category: this.selectedCategory,
      maxPrice: this.currentMaxPrice,
      inStock: this.showInStock,
      outStock: this.showOutStock
    };
    this.filterChange.emit(filters);
  }
  
  clearFilters() {
    this.selectedCategory = 'all';
    this.currentMaxPrice = this.maxPrice;
    this.showInStock = true;
    this.showOutStock = true;
    this.applyFilters();
  }
}