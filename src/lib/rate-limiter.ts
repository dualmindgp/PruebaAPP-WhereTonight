/**
 * Sistema de Rate Limiting para prevenir abuso de APIs
 * Implementa límites por usuario y por endpoint
 */

interface RateLimitConfig {
  maxCalls: number;
  windowMs: number;
}

interface CallRecord {
  timestamps: number[];
  lastCleanup: number;
}

class RateLimiter {
  private calls: Map<string, CallRecord> = new Map();
  private readonly CLEANUP_INTERVAL = 60000; // Limpiar cada minuto

  constructor() {
    // Limpiar registros antiguos periódicamente
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  /**
   * Verifica si se puede hacer una llamada
   * @param key - Identificador único (ej: "userId:endpoint")
   * @param config - Configuración de límites
   * @returns true si se puede hacer la llamada, false si se excedió el límite
   */
  canMakeCall(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const record = this.calls.get(key) || { timestamps: [], lastCleanup: now };

    // Filtrar llamadas dentro de la ventana de tiempo
    const recentCalls = record.timestamps.filter(
      time => now - time < config.windowMs
    );

    // Verificar si se excedió el límite
    if (recentCalls.length >= config.maxCalls) {
      return false;
    }

    // Registrar la nueva llamada
    recentCalls.push(now);
    this.calls.set(key, {
      timestamps: recentCalls,
      lastCleanup: now
    });

    return true;
  }

  /**
   * Obtiene el tiempo restante hasta que se pueda hacer otra llamada
   * @param key - Identificador único
   * @param config - Configuración de límites
   * @returns Milisegundos hasta que se pueda hacer otra llamada, o 0 si ya se puede
   */
  getTimeUntilReset(key: string, config: RateLimitConfig): number {
    const record = this.calls.get(key);
    if (!record || record.timestamps.length === 0) {
      return 0;
    }

    const now = Date.now();
    const oldestCall = Math.min(...record.timestamps);
    const timeSinceOldest = now - oldestCall;

    if (timeSinceOldest >= config.windowMs) {
      return 0;
    }

    return config.windowMs - timeSinceOldest;
  }

  /**
   * Limpia registros antiguos para liberar memoria
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 3600000; // 1 hora

    const keysToDelete: string[] = [];
    this.calls.forEach((record, key) => {
      if (now - record.lastCleanup > maxAge) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.calls.delete(key));
  }

  /**
   * Resetea el límite para una key específica
   */
  reset(key: string): void {
    this.calls.delete(key);
  }

  /**
   * Obtiene estadísticas de uso
   */
  getStats(key: string): { callCount: number; oldestCall: number | null } {
    const record = this.calls.get(key);
    if (!record || record.timestamps.length === 0) {
      return { callCount: 0, oldestCall: null };
    }

    return {
      callCount: record.timestamps.length,
      oldestCall: Math.min(...record.timestamps)
    };
  }
}

// Instancia singleton
export const rateLimiter = new RateLimiter();

/**
 * Configuraciones predefinidas de rate limiting
 */
export const RateLimitPresets = {
  // Límites estrictos para operaciones sensibles
  STRICT: { maxCalls: 5, windowMs: 60000 }, // 5 llamadas por minuto
  
  // Límites moderados para operaciones normales
  MODERATE: { maxCalls: 20, windowMs: 60000 }, // 20 llamadas por minuto
  
  // Límites relajados para operaciones de lectura
  RELAXED: { maxCalls: 60, windowMs: 60000 }, // 60 llamadas por minuto
  
  // Para tickets (1 por día)
  TICKET_DAILY: { maxCalls: 1, windowMs: 86400000 }, // 1 llamada por día
  
  // Para búsquedas
  SEARCH: { maxCalls: 30, windowMs: 60000 }, // 30 búsquedas por minuto
  
  // Para actualizaciones de perfil
  PROFILE_UPDATE: { maxCalls: 3, windowMs: 300000 }, // 3 actualizaciones cada 5 minutos
  
  // Para social posts
  SOCIAL_POST: { maxCalls: 10, windowMs: 3600000 }, // 10 posts por hora
};

/**
 * Helper para generar keys de rate limiting
 */
export const RateLimitKeys = {
  ticket: (userId: string) => `ticket:${userId}`,
  venue: (userId: string) => `venue:${userId}`,
  search: (userId: string) => `search:${userId}`,
  profile: (userId: string) => `profile:${userId}`,
  social: (userId: string) => `social:${userId}`,
  friendship: (userId: string) => `friendship:${userId}`,
};

/**
 * Decorator para aplicar rate limiting a funciones
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  getKey: (...args: Parameters<T>) => string,
  config: RateLimitConfig
): T {
  return (async (...args: Parameters<T>) => {
    const key = getKey(...args);
    
    if (!rateLimiter.canMakeCall(key, config)) {
      const timeUntilReset = rateLimiter.getTimeUntilReset(key, config);
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(timeUntilReset / 1000)} seconds.`
      );
    }
    
    return fn(...args);
  }) as T;
}
