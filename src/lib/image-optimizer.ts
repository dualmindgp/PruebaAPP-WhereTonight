/**
 * Utilidades para optimizar la carga de imágenes
 * Implementa lazy loading, placeholders y compresión
 */

/**
 * Genera un placeholder blur data URL
 */
export function generateBlurPlaceholder(width: number = 10, height: number = 10): string {
  // SVG simple con blur para usar como placeholder
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
      <filter id="blur">
        <feGaussianBlur stdDeviation="2"/>
      </filter>
      <rect width="100%" height="100%" fill="#1a1a2e" filter="url(#blur)"/>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

/**
 * Genera srcset para imágenes responsive
 */
export function generateSrcSet(baseUrl: string, widths: number[]): string {
  return widths
    .map(width => {
      // Si la URL ya tiene parámetros, añadir con &, sino con ?
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}w=${width} ${width}w`;
    })
    .join(', ');
}

/**
 * Obtiene el tamaño óptimo de imagen según el viewport
 */
export function getOptimalImageSize(): number {
  if (typeof window === 'undefined') {
    return 800; // Default para SSR
  }

  const width = window.innerWidth;
  const dpr = window.devicePixelRatio || 1;

  // Calcular tamaño óptimo considerando DPR
  const optimalWidth = width * dpr;

  // Redondear al múltiplo de 100 más cercano
  return Math.ceil(optimalWidth / 100) * 100;
}

/**
 * Preload de imagen crítica
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Lazy load de múltiples imágenes
 */
export function lazyLoadImages(imageUrls: string[]): Promise<void[]> {
  return Promise.all(imageUrls.map(url => preloadImage(url)));
}

/**
 * Verifica si una imagen está en caché del navegador
 */
export function isImageCached(src: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const img = new Image();
  img.src = src;
  return img.complete && img.naturalHeight !== 0;
}

/**
 * Comprime una imagen del lado del cliente
 */
export async function compressImage(
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1920,
  quality: number = 0.8
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;

        // Calcular nuevas dimensiones manteniendo aspect ratio
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.onerror = () => reject(new Error('Image load failed'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}

/**
 * Convierte una imagen a WebP si el navegador lo soporta
 */
export function supportsWebP(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
}

/**
 * Obtiene la URL de imagen con el formato óptimo
 */
export function getOptimalImageUrl(baseUrl: string, preferWebP: boolean = true): string {
  if (!baseUrl) {
    return '';
  }

  // Si la URL ya tiene formato especificado, retornarla tal cual
  if (baseUrl.includes('format=')) {
    return baseUrl;
  }

  // Añadir parámetro de formato si el navegador soporta WebP
  if (preferWebP && supportsWebP()) {
    const separator = baseUrl.includes('?') ? '&' : '?';
    return `${baseUrl}${separator}format=webp`;
  }

  return baseUrl;
}

/**
 * Clase para manejar el lazy loading con Intersection Observer
 */
export class ImageLazyLoader {
  private observer: IntersectionObserver | null = null;
  private images: Set<HTMLImageElement> = new Set();

  constructor(options?: IntersectionObserverInit) {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          this.loadImage(img);
        }
      });
    }, options || {
      rootMargin: '50px', // Empezar a cargar 50px antes de que sea visible
      threshold: 0.01,
    });
  }

  /**
   * Observa una imagen para lazy loading
   */
  observe(img: HTMLImageElement): void {
    if (!this.observer) {
      // Fallback: cargar inmediatamente si no hay soporte
      this.loadImage(img);
      return;
    }

    this.images.add(img);
    this.observer.observe(img);
  }

  /**
   * Deja de observar una imagen
   */
  unobserve(img: HTMLImageElement): void {
    if (this.observer) {
      this.observer.unobserve(img);
    }
    this.images.delete(img);
  }

  /**
   * Carga una imagen
   */
  private loadImage(img: HTMLImageElement): void {
    const src = img.dataset.src;
    const srcset = img.dataset.srcset;

    if (src) {
      img.src = src;
    }

    if (srcset) {
      img.srcset = srcset;
    }

    img.classList.remove('lazy');
    img.classList.add('loaded');

    if (this.observer) {
      this.observer.unobserve(img);
    }
  }

  /**
   * Limpia el observer
   */
  disconnect(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.images.clear();
  }
}

/**
 * Hook para usar lazy loading en React
 */
export function useLazyImage(ref: React.RefObject<HTMLImageElement>) {
  if (typeof window === 'undefined') {
    return;
  }

  const loader = new ImageLazyLoader();

  if (ref.current) {
    loader.observe(ref.current);
  }

  return () => {
    if (ref.current) {
      loader.unobserve(ref.current);
    }
    loader.disconnect();
  };
}

/**
 * Genera un placeholder de color basado en el nombre
 */
export function generateColorPlaceholder(text: string): string {
  // Generar un color consistente basado en el texto
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  const saturation = 60 + (hash % 20);
  const lightness = 40 + (hash % 20);

  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Crea un avatar placeholder con iniciales
 */
export function generateAvatarPlaceholder(name: string, size: number = 200): string {
  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const bgColor = generateColorPlaceholder(name);
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
      <rect width="100%" height="100%" fill="${bgColor}"/>
      <text
        x="50%"
        y="50%"
        dominant-baseline="middle"
        text-anchor="middle"
        fill="white"
        font-family="Arial, sans-serif"
        font-size="${size * 0.4}"
        font-weight="bold"
      >${initials}</text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(svg)}`;
}
