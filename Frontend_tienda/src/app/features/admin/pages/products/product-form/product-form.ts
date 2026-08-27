import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AdminService } from '../../../../admin/services/admin';
import { AdminSidebarComponent } from '../../../../admin/components/admin-sidebar/admin-sidebar';
import { AdminHeaderComponent } from '../../../../admin/components/admin-header/admin-header';
import { ImageUploadComponent } from '../../../../../shared/components/image-upload/image-upload';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    AdminSidebarComponent,
    AdminHeaderComponent,
    ImageUploadComponent,
    
  ],
  template: `
    <div class="admin-layout">
      <app-admin-sidebar></app-admin-sidebar>

      <div class="admin-content">
        <app-admin-header
          [title]="isEditMode() ? 'Editar Producto' : 'Nuevo Producto'"
        ></app-admin-header>

        <div class="form-content">
          <div class="form-card">
            <h1>{{ isEditMode() ? '✏️ Editar Producto' : '➕ Nuevo Producto' }}</h1>

            <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
              <!-- Nombre -->
              <div class="form-group">
                <label for="name">Nombre *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  placeholder="Nombre del producto"
                />
                <small
                  *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched"
                  class="error"
                >
                  El nombre es requerido
                </small>
              </div>

              <!-- Descripción -->
              <div class="form-group">
                <label for="description">Descripción</label>
                <textarea
                  id="description"
                  formControlName="description"
                  rows="4"
                  placeholder="Descripción del producto"
                ></textarea>
              </div>

              <div class="form-row">
                <!-- Categoría -->
                <div class="form-group">
                  <label for="category_id">Categoría</label>
                  <select id="category_id" formControlName="category_id">
                    <option value="">Sin categoría</option>
                    <option *ngFor="let category of categories()" [value]="category.id">
                      {{ category.name }}
                    </option>
                  </select>
                </div>

                <!-- SKU -->
                <div class="form-group">
                  <label for="sku">SKU</label>
                  <input type="text" id="sku" formControlName="sku" placeholder="PRD000001" />
                </div>
              </div>

              <div class="form-row">
                <!-- Precio -->
                <div class="form-group">
                  <label for="price">Precio *</label>
                  <input type="number" id="price" formControlName="price" placeholder="0" />
                  <small
                    *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched"
                    class="error"
                  >
                    El precio es requerido y debe ser mayor a 0
                  </small>
                </div>

                <!-- Precio comparativo -->
                <div class="form-group">
                  <label for="compare_price">Precio comparativo</label>
                  <input
                    type="number"
                    id="compare_price"
                    formControlName="compare_price"
                    placeholder="0"
                  />
                </div>
              </div>

              <div class="form-row">
                <!-- Stock -->
                <div class="form-group">
                  <label for="stock">Stock *</label>
                  <input type="number" id="stock" formControlName="stock" placeholder="0" />
                  <small
                    *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched"
                    class="error"
                  >
                    El stock es requerido
                  </small>
                </div>

                <!-- Estado del stock -->
                <div class="form-group">
                  <label for="stock_status">Estado del stock</label>
                  <select id="stock_status" formControlName="stock_status">
                    <option value="in_stock">En stock</option>
                    <option value="out_of_stock">Agotado</option>
                    <option value="backorder">Reserva</option>
                  </select>
                </div>
              </div>

             

              <!-- Subida de imagen -->
              <div class="form-group">
                <label>🖼️ Imagen del producto</label>
                <app-image-upload
                  label="Imagen del producto"
                  altText="{{ productForm.get('name')?.value || 'Producto' }}"
                  (imageSelected)="onImageSelected($event)"
                  (imageRemoved)="onImageRemoved()"
                >
                </app-image-upload>
              </div>

              <!-- Opciones -->
              <div class="form-row options">
                <div class="form-group checkbox">
                  <label>
                    <input type="checkbox" formControlName="is_featured" />
                    Destacar producto
                  </label>
                </div>

                <div class="form-group checkbox">
                  <label>
                    <input type="checkbox" formControlName="is_active" />
                    Activo
                  </label>
                </div>
              </div>

              <!-- Botones -->
              <div class="form-actions">
                <button
                  type="submit"
                  class="btn-save"
                  [disabled]="productForm.invalid || isSaving()"
                >
                  {{ isSaving() ? 'Guardando...' : isEditMode() ? 'Actualizar' : 'Crear' }}
                </button>
                <a routerLink="/admin/products" class="btn-cancel">Cancelar</a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-layout {
        display: flex;
        min-height: 100vh;
        background: #f7fafc;
      }
      .admin-content {
        flex: 1;
        margin-left: 250px;
      }
      .form-content {
        padding: 24px;
        max-width: 800px;
        margin: 0 auto;
      }

      .form-card {
        background: white;
        padding: 32px;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      }

      .form-card h1 {
        margin: 0 0 24px 0;
        font-size: 24px;
        color: #2d3748;
      }

      .form-group {
        margin-bottom: 16px;
      }

      .form-group label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #2d3748;
        font-size: 14px;
      }

      .form-group input,
      .form-group select,
      .form-group textarea {
        width: 100%;
        padding: 10px 14px;
        border: 2px solid #e2e8f0;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.3s;
      }

      .form-group input:focus,
      .form-group select:focus,
      .form-group textarea:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .form-group textarea {
        resize: vertical;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
      }

      .form-row.options {
        grid-template-columns: 1fr 1fr;
        margin-top: 8px;
      }

      .checkbox label {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        font-weight: 400;
      }

      .checkbox input[type='checkbox'] {
        width: 18px;
        height: 18px;
        cursor: pointer;
      }

      .error {
        color: #fc8181;
        font-size: 12px;
        margin-top: 4px;
        display: block;
      }

      .form-actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
        padding-top: 20px;
        border-top: 2px solid #f0f0f0;
      }

      .btn-save {
        padding: 12px 32px;
        background: #667eea;
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }

      .btn-save:hover:not(:disabled) {
        background: #5a67d8;
        transform: translateY(-2px);
      }

      .btn-save:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      .btn-cancel {
        padding: 12px 32px;
        background: #e2e8f0;
        color: #4a5568;
        border: none;
        border-radius: 8px;
        text-decoration: none;
        font-size: 16px;
        font-weight: 600;
        transition: all 0.3s;
        display: inline-flex;
        align-items: center;
      }

      .btn-cancel:hover {
        background: #cbd5e0;
      }

      @media (max-width: 768px) {
        .admin-content {
          margin-left: 0;
        }
        .form-row {
          grid-template-columns: 1fr;
        }
        .form-row.options {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private adminService = inject(AdminService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productForm: FormGroup = this.fb.group({
    name: ['', [Validators.required]],
    description: [''],
    category_id: [''],
    sku: [''],
    price: ['', [Validators.required, Validators.min(0)]],
    compare_price: [''],
    stock: ['', [Validators.required, Validators.min(0)]],
    stock_status: ['in_stock'],
    image_principal: [''],
    is_featured: [false],
    is_active: [true],
  });

  isEditMode = signal(false);
  isSaving = signal(false);
  categories = signal<any[]>([]);
  productId = signal<number | null>(null);

  ngOnInit() {
    this.loadCategories();
    this.checkEditMode();
  }

  onImageSelected(url: string) {
  console.log('🖼️ Imagen recibida en el form:', url); // 👈 temporal, para debug
  this.productForm.patchValue({ image_principal: url });
}

  onImageRemoved() {
    this.productForm.patchValue({ image_principal: '' });
  }

  checkEditMode() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode.set(true);
      this.productId.set(id);
      this.loadProduct(id);
    }
  }

  loadCategories() {
    this.adminService.getCategories().subscribe({
      next: (response) => {
        this.categories.set(response.data);
      },
      error: (error) => {
        console.error('Error al cargar categorías:', error);
      },
    });
  }

  loadProduct(id: number) {
    this.adminService.getProduct(id).subscribe({
      next: (response) => {
        const product = response.data;
        this.productForm.patchValue({
          name: product.name,
          description: product.description,
          category_id: product.category_id,
          sku: product.sku,
          price: product.price,
          compare_price: product.compare_price,
          stock: product.stock,
          stock_status: product.stock_status,
          image_principal: product.image_principal,
          is_featured: product.is_featured,
          is_active: product.is_active,
        });
      },
      error: (error) => {
        console.error('Error al cargar producto:', error);
        alert('Error al cargar el producto');
        this.router.navigate(['/admin/products']);
      },
    });
  }

  onSubmit() {
    if (this.productForm.invalid) return;

    this.isSaving.set(true);
    const data = this.productForm.value;

    if (this.isEditMode() && this.productId()) {
      this.adminService.updateProduct(this.productId()!, data).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('✅ Producto actualizado correctamente');
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.isSaving.set(false);
          console.error('Error al actualizar:', error);
          // alert eliminado a propósito, ver nota abajo
        },
      });
    } else {
      this.adminService.createProduct(data).subscribe({
        next: () => {
          this.isSaving.set(false);
          alert('✅ Producto creado correctamente');
          this.router.navigate(['/admin/products']);
        },
        error: (error) => {
          this.isSaving.set(false);
          console.error('Error al crear:', error);
          // alert eliminado a propósito, ver nota abajo
        },
      });
    }
  }
}