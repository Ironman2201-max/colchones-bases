import { Pipe, PipeTransform } from '@angular/core';
import { environment } from '../../../environments/environment';

// Placeholder SVG embebido — nunca da 404 porque no es un request HTTP
const DEFAULT_PRODUCT_IMAGE =
  'data:image/svg+xml;charset=UTF-8,' +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#f7fafc"/>
      <g fill="#cbd5e0">
        <rect x="130" y="140" width="140" height="110" rx="8"/>
        <circle cx="165" cy="175" r="14" fill="#f7fafc"/>
        <path d="M130 230 L180 190 L220 220 L270 170 L270 250 L130 250 Z" fill="#a0aec0"/>
      </g>
      <text x="200" y="290" font-family="Arial, sans-serif" font-size="14" fill="#a0aec0" text-anchor="middle">
        Sin imagen
      </text>
    </svg>
  `);

@Pipe({
  name: 'imageUrl',
  standalone: true,
})
export class ImageUrlPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return DEFAULT_PRODUCT_IMAGE;
    }

    // Ya es URL completa (esto es lo normal, ya que el backend la resuelve)
    if (value.startsWith('http://') || value.startsWith('https://')) {
      return value;
    }

    // Ya es un data URI (por ejemplo, previews locales)
    if (value.startsWith('data:')) {
      return value;
    }

    if (value.startsWith('/storage')) {
      return `${environment.apiBaseUrl}${value}`;
    }

    if (value.startsWith('storage/')) {
      return `${environment.apiBaseUrl}/${value}`;
    }

    if (value.startsWith('images/')) {
      return `${environment.apiBaseUrl}/storage/${value}`;
    }

    if (!value.includes('/')) {
      return `${environment.apiBaseUrl}/storage/images/products/${value}`;
    }

    return `${environment.apiBaseUrl}/storage/${value.replace(/^\/+/, '')}`;
  }
}

export { DEFAULT_PRODUCT_IMAGE };