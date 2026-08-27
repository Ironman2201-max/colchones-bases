import { Component, inject, signal, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ImageUploadService } from '../../../features/catalog/services/image-upload';
import { FileSizePipe } from '../../pipes/file-size-pipe';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, FileSizePipe],
  template: `
    <div class="image-upload-container">
      <label class="upload-label">
        <span>🖼️ {{ label }}</span>
      </label>

      <!-- Opciones de carga -->
      <div class="upload-options">
        <!-- Opción 1: URL -->
        <div class="option-card">
          <h4>🔗 URL</h4>
          <p>Pega un enlace de imagen</p>
          <input
            type="text"
            [(ngModel)]="imageUrl"
            placeholder="https://ejemplo.com/imagen.jpg"
            class="url-input">
          <button (click)="loadFromUrl()" class="btn-upload" [disabled]="!imageUrl">
            Cargar desde URL
          </button>
        </div>

        <!-- Opción 2: Archivo local -->
        <div class="option-card">
          <h4>📁 Archivo local</h4>
          <p>Selecciona una imagen de tu PC</p>
          <input
            type="file"
            (change)="onFileSelected($event)"
            accept="image/*"
            #fileInput
            class="file-input">
          <div class="file-info" *ngIf="selectedFile">
            <span>{{ selectedFile.name }}</span>
            <span class="file-size">({{ selectedFile.size | fileSize }})</span>
          </div>
          <button (click)="uploadFile()" class="btn-upload" [disabled]="!selectedFile || isUploading()">
            {{ isUploading() ? 'Subiendo...' : 'Subir imagen' }}
          </button>
        </div>
      </div>

      <!-- Previsualización -->
      <div *ngIf="previewUrl()" class="preview-container">
        <h4>📸 Vista previa</h4>
        <div class="preview-wrapper">
          <img [src]="previewUrl()" [alt]="altText" class="preview-image">
          <button (click)="removeImage()" class="btn-remove">✕</button>
        </div>
        <div class="preview-actions" *ngIf="!isConfirmed()">
          <span class="confirmed-badge">✅ Imagen cargada y confirmada</span>
        </div>
        <div class="preview-actions" *ngIf="!isFromAutoUpload()">
          <button (click)="confirmImage()" class="btn-confirm">
            ✅ Usar esta imagen
          </button>
          <button (click)="removeImage()" class="btn-cancel">
            ❌ Cancelar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .image-upload-container {
      background: white;
      padding: 20px;
      border-radius: 12px;
      border: 2px dashed #e2e8f0;
      transition: all 0.3s;
    }

    .image-upload-container:hover {
      border-color: #667eea;
    }

    .upload-label {
      display: block;
      font-size: 16px;
      font-weight: 600;
      color: #2d3748;
      margin-bottom: 16px;
    }

    .upload-options {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .option-card {
      padding: 16px;
      background: #f7fafc;
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }

    .option-card h4 {
      margin: 0 0 4px 0;
      color: #2d3748;
    }

    .option-card p {
      margin: 0 0 12px 0;
      color: #a0aec0;
      font-size: 13px;
    }

    .url-input {
      width: 100%;
      padding: 8px 12px;
      border: 2px solid #e2e8f0;
      border-radius: 6px;
      font-size: 14px;
      margin-bottom: 8px;
    }

    .url-input:focus {
      outline: none;
      border-color: #667eea;
    }

    .file-input {
      display: block;
      width: 100%;
      padding: 8px 0;
      font-size: 14px;
    }

    .file-info {
      display: flex;
      gap: 8px;
      align-items: center;
      padding: 4px 0;
      font-size: 13px;
      color: #4a5568;
    }

    .file-size {
      color: #a0aec0;
    }

    .btn-upload {
      width: 100%;
      padding: 8px;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 8px;
    }

    .btn-upload:hover:not(:disabled) {
      background: #5a67d8;
    }

    .btn-upload:disabled {
      background: #a0aec0;
      cursor: not-allowed;
    }

    .preview-container {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 2px solid #e2e8f0;
    }

    .preview-container h4 {
      margin: 0 0 12px 0;
      color: #2d3748;
    }

    .preview-wrapper {
      position: relative;
      display: inline-block;
      max-width: 300px;
    }

    .preview-image {
      width: 100%;
      max-height: 200px;
      border-radius: 8px;
      object-fit: cover;
      border: 2px solid #e2e8f0;
    }

    .btn-remove {
      position: absolute;
      top: -8px;
      right: -8px;
      width: 28px;
      height: 28px;
      background: #fc8181;
      color: white;
      border: none;
      border-radius: 50%;
      cursor: pointer;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-remove:hover {
      background: #f56565;
    }

    .preview-actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
      align-items: center;
    }

    .confirmed-badge {
      font-size: 13px;
      color: #38a169;
      font-weight: 600;
    }

    .btn-confirm {
      padding: 8px 24px;
      background: #48bb78;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-confirm:hover {
      background: #38a169;
    }

    .btn-cancel {
      padding: 8px 24px;
      background: #e2e8f0;
      color: #4a5568;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .btn-cancel:hover {
      background: #cbd5e0;
    }

    @media (max-width: 768px) {
      .upload-options {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ImageUploadComponent {
  @Input() label: string = 'Imagen del producto';
  @Input() altText: string = 'Imagen';
  @Output() imageSelected = new EventEmitter<string>();
  @Output() imageRemoved = new EventEmitter<void>();

  private imageUploadService = inject(ImageUploadService);

  imageUrl = '';
  selectedFile: File | null = null;
  previewUrl = signal<string | null>(null);
  isUploading = signal(false);

  // ✅ Nuevo: indica si la imagen actual ya fue confirmada/emitida al padre.
  // Se usa para no mostrar los botones "Usar esta imagen"/"Cancelar" cuando
  // la subida de archivo ya confirmó automáticamente (evita el paso manual
  // que causaba que el producto se guardara sin image_principal).
  isConfirmed = signal(false);

  // ✅ Nuevo: distingue si la imagen actual vino de subida automática de
  // archivo (true) o de "Cargar desde URL" (false, sigue requiriendo
  // confirmación manual porque el usuario puede querer editar la URL antes).
  isFromAutoUpload = signal(false);

  /**
   * Cargar imagen desde URL
   * (flujo manual: requiere confirmación explícita, porque el usuario
   * puede estar probando distintas URLs antes de decidirse)
   */
  loadFromUrl(): void {
    if (this.imageUrl) {
      this.previewUrl.set(this.imageUrl);
      this.isConfirmed.set(false);
      this.isFromAutoUpload.set(false);
    }
  }

  /**
   * Seleccionar archivo local
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];

      // Validación básica de tipo en el frontend, para dar feedback
      // inmediato antes de gastar una petición al servidor.
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        alert('❌ Formato no soportado. Usa JPG, PNG, GIF o WEBP.');
        input.value = '';
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  /**
   * Subir archivo al servidor.
   * ✅ FIX: al terminar de subir con éxito, se emite `imageSelected`
   * automáticamente. Antes esto solo pasaba si el usuario hacía clic
   * en "✅ Usar esta imagen" después, y si se le olvidaba, el producto
   * se guardaba con image_principal en null aunque el archivo ya
   * estuviera subido en el servidor.
   */
  uploadFile(): void {
    if (!this.selectedFile) return;

    this.isUploading.set(true);
    this.imageUploadService.uploadImage(this.selectedFile).subscribe({
      next: (response) => {
        // ✅ El backend devuelve { message, path } en la raíz del JSON,
        // no anidado en "data". Antes se leía response.data?.url, que
        // siempre era undefined y por eso nunca se emitía la imagen.
        const imageUrl = response.path;
        if (imageUrl) {
          this.previewUrl.set(imageUrl);
          this.isFromAutoUpload.set(true);
          this.isConfirmed.set(true);
          this.imageSelected.emit(imageUrl); // ✅ Emitimos automáticamente
        }
        this.isUploading.set(false);
      },
      error: (error) => {
        console.error('❌ Error al subir imagen:', error);
        this.isUploading.set(false);
        alert('❌ Error al subir la imagen');
      },
    });
  }

  /**
   * Confirmar imagen (solo relevante para el flujo de "Cargar desde URL")
   */
  confirmImage(): void {
    if (this.previewUrl()) {
      this.isConfirmed.set(true);
      this.imageSelected.emit(this.previewUrl()!);
    }
  }

  /**
   * Eliminar imagen
   */
  removeImage(): void {
    this.previewUrl.set(null);
    this.imageUrl = '';
    this.selectedFile = null;
    this.isConfirmed.set(false);
    this.isFromAutoUpload.set(false);
    this.imageRemoved.emit();
    // Limpiar input file
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  }
}