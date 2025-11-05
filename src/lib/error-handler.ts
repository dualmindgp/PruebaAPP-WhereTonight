/**
 * Sistema de manejo de errores global
 * Proporciona clases de error personalizadas y handlers centralizados
 */

import { logger } from './logger';

/**
 * Severidad del error
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Códigos de error de la aplicación
 */
export enum ErrorCode {
  // Errores de autenticación
  AUTH_FAILED = 'AUTH_FAILED',
  AUTH_REQUIRED = 'AUTH_REQUIRED',
  AUTH_TOKEN_EXPIRED = 'AUTH_TOKEN_EXPIRED',
  
  // Errores de API/Base de datos
  API_ERROR = 'API_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  
  // Errores de validación
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  
  // Errores de negocio
  TICKET_ALREADY_USED = 'TICKET_ALREADY_USED',
  VENUE_NOT_FOUND = 'VENUE_NOT_FOUND',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  
  // Errores de permisos
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  LOCATION_PERMISSION_DENIED = 'LOCATION_PERMISSION_DENIED',
  CAMERA_PERMISSION_DENIED = 'CAMERA_PERMISSION_DENIED',
  
  // Errores generales
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
  NOT_IMPLEMENTED = 'NOT_IMPLEMENTED',
}

/**
 * Clase base para errores de la aplicación
 */
export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.UNKNOWN_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.severity = severity;
    this.context = context;
    this.timestamp = new Date();

    // Mantener el stack trace correcto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  /**
   * Convierte el error a un objeto plano para logging
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack,
    };
  }
}

/**
 * Error de autenticación
 */
export class AuthError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.AUTH_FAILED, ErrorSeverity.HIGH, context);
    this.name = 'AuthError';
  }
}

/**
 * Error de API
 */
export class APIError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.API_ERROR, ErrorSeverity.MEDIUM, context);
    this.name = 'APIError';
  }
}

/**
 * Error de validación
 */
export class ValidationError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.VALIDATION_ERROR, ErrorSeverity.LOW, context);
    this.name = 'ValidationError';
  }
}

/**
 * Error de rate limiting
 */
export class RateLimitError extends AppError {
  constructor(message: string, context?: Record<string, any>) {
    super(message, ErrorCode.RATE_LIMIT_EXCEEDED, ErrorSeverity.MEDIUM, context);
    this.name = 'RateLimitError';
  }
}

/**
 * Handler global de errores
 */
export class ErrorHandler {
  /**
   * Maneja un error de manera centralizada
   */
  static handle(error: unknown, context?: Record<string, any>): void {
    if (error instanceof AppError) {
      this.handleAppError(error);
    } else if (error instanceof Error) {
      this.handleGenericError(error, context);
    } else {
      this.handleUnknownError(error, context);
    }
  }

  /**
   * Maneja errores de la aplicación
   */
  private static handleAppError(error: AppError): void {
    // Log según severidad
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        logger.error(error.message, error, error.context);
        // TODO: Enviar a Sentry
        break;
      case ErrorSeverity.MEDIUM:
        logger.warn(error.message, error.context);
        break;
      case ErrorSeverity.LOW:
        logger.info(error.message, error.context);
        break;
    }

    // Mostrar mensaje al usuario si es necesario
    if (this.shouldShowToUser(error)) {
      this.showUserMessage(error);
    }
  }

  /**
   * Maneja errores genéricos de JavaScript
   */
  private static handleGenericError(error: Error, context?: Record<string, any>): void {
    logger.error(error.message, error, context);
  }

  /**
   * Maneja errores desconocidos
   */
  private static handleUnknownError(error: unknown, context?: Record<string, any>): void {
    logger.error('Unknown error occurred', new Error(String(error)), context);
  }

  /**
   * Determina si el error debe mostrarse al usuario
   */
  private static shouldShowToUser(error: AppError): boolean {
    // No mostrar errores de baja severidad o de debug
    if (error.severity === ErrorSeverity.LOW) {
      return false;
    }

    // Mostrar errores que afectan la experiencia del usuario
    const userFacingCodes = [
      ErrorCode.AUTH_FAILED,
      ErrorCode.TICKET_ALREADY_USED,
      ErrorCode.RATE_LIMIT_EXCEEDED,
      ErrorCode.PERMISSION_DENIED,
      ErrorCode.NETWORK_ERROR,
    ];

    return userFacingCodes.includes(error.code);
  }

  /**
   * Muestra un mensaje al usuario (puede integrarse con un sistema de toasts)
   */
  private static showUserMessage(error: AppError): void {
    // TODO: Integrar con sistema de toasts/notificaciones
    console.log('User message:', this.getUserFriendlyMessage(error));
  }

  /**
   * Convierte el error técnico en un mensaje amigable para el usuario
   */
  private static getUserFriendlyMessage(error: AppError): string {
    const messages: Partial<Record<ErrorCode, string>> = {
      [ErrorCode.AUTH_FAILED]: 'Error de autenticación. Por favor, inicia sesión nuevamente.',
      [ErrorCode.TICKET_ALREADY_USED]: 'Ya has usado tu ticket de hoy. ¡Vuelve mañana!',
      [ErrorCode.RATE_LIMIT_EXCEEDED]: 'Has realizado demasiadas acciones. Espera un momento.',
      [ErrorCode.NETWORK_ERROR]: 'Error de conexión. Verifica tu internet.',
      [ErrorCode.PERMISSION_DENIED]: 'Permiso denegado. Verifica la configuración de la app.',
      [ErrorCode.VENUE_NOT_FOUND]: 'No se encontró el lugar.',
    };

    return messages[error.code] || 'Ha ocurrido un error. Inténtalo de nuevo.';
  }
}

/**
 * Wrapper para funciones async con manejo de errores
 */
export async function withErrorHandler<T>(
  operation: () => Promise<T>,
  context?: Record<string, any>
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    ErrorHandler.handle(error, context);
    return null;
  }
}

/**
 * Wrapper para funciones síncronas con manejo de errores
 */
export function tryCatchWithHandler<T>(
  operation: () => T,
  context?: Record<string, any>
): T | null {
  try {
    return operation();
  } catch (error) {
    ErrorHandler.handle(error, context);
    return null;
  }
}

/**
 * Helper para crear errores de manera más concisa
 */
export const createError = {
  auth: (message: string, context?: Record<string, any>) => 
    new AuthError(message, context),
  
  api: (message: string, context?: Record<string, any>) => 
    new APIError(message, context),
  
  validation: (message: string, context?: Record<string, any>) => 
    new ValidationError(message, context),
  
  rateLimit: (message: string, context?: Record<string, any>) => 
    new RateLimitError(message, context),
  
  custom: (message: string, code: ErrorCode, severity: ErrorSeverity, context?: Record<string, any>) =>
    new AppError(message, code, severity, context),
};
