/**
 * Tests para el sistema de manejo de errores
 */

import { 
  AppError, 
  AuthError, 
  APIError, 
  ValidationError,
  RateLimitError,
  ErrorCode,
  ErrorSeverity,
  createError 
} from '../error-handler';

describe('Error Handler', () => {
  describe('AppError', () => {
    it('should create an error with correct properties', () => {
      const error = new AppError(
        'Test error',
        ErrorCode.API_ERROR,
        ErrorSeverity.HIGH,
        { userId: '123' }
      );

      expect(error.message).toBe('Test error');
      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context).toEqual({ userId: '123' });
      expect(error.timestamp).toBeInstanceOf(Date);
    });

    it('should have default values', () => {
      const error = new AppError('Test error');

      expect(error.code).toBe(ErrorCode.UNKNOWN_ERROR);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
      expect(error.context).toBeUndefined();
    });

    it('should convert to JSON correctly', () => {
      const error = new AppError(
        'Test error',
        ErrorCode.API_ERROR,
        ErrorSeverity.HIGH
      );

      const json = error.toJSON();

      expect(json.name).toBe('AppError');
      expect(json.message).toBe('Test error');
      expect(json.code).toBe(ErrorCode.API_ERROR);
      expect(json.severity).toBe(ErrorSeverity.HIGH);
      expect(json.timestamp).toBeDefined();
    });
  });

  describe('Specific Error Classes', () => {
    it('should create AuthError correctly', () => {
      const error = new AuthError('Auth failed', { reason: 'invalid_token' });

      expect(error).toBeInstanceOf(AuthError);
      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ErrorCode.AUTH_FAILED);
      expect(error.severity).toBe(ErrorSeverity.HIGH);
      expect(error.context).toEqual({ reason: 'invalid_token' });
    });

    it('should create APIError correctly', () => {
      const error = new APIError('API request failed');

      expect(error).toBeInstanceOf(APIError);
      expect(error.code).toBe(ErrorCode.API_ERROR);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });

    it('should create ValidationError correctly', () => {
      const error = new ValidationError('Invalid input');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.code).toBe(ErrorCode.VALIDATION_ERROR);
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });

    it('should create RateLimitError correctly', () => {
      const error = new RateLimitError('Rate limit exceeded');

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.code).toBe(ErrorCode.RATE_LIMIT_EXCEEDED);
      expect(error.severity).toBe(ErrorSeverity.MEDIUM);
    });
  });

  describe('createError helpers', () => {
    it('should create auth error', () => {
      const error = createError.auth('Login failed');

      expect(error).toBeInstanceOf(AuthError);
      expect(error.message).toBe('Login failed');
    });

    it('should create api error', () => {
      const error = createError.api('Request failed');

      expect(error).toBeInstanceOf(APIError);
      expect(error.message).toBe('Request failed');
    });

    it('should create validation error', () => {
      const error = createError.validation('Invalid data');

      expect(error).toBeInstanceOf(ValidationError);
      expect(error.message).toBe('Invalid data');
    });

    it('should create rate limit error', () => {
      const error = createError.rateLimit('Too many requests');

      expect(error).toBeInstanceOf(RateLimitError);
      expect(error.message).toBe('Too many requests');
    });

    it('should create custom error', () => {
      const error = createError.custom(
        'Custom error',
        ErrorCode.NOT_IMPLEMENTED,
        ErrorSeverity.LOW
      );

      expect(error).toBeInstanceOf(AppError);
      expect(error.code).toBe(ErrorCode.NOT_IMPLEMENTED);
      expect(error.severity).toBe(ErrorSeverity.LOW);
    });
  });

  describe('Error Codes', () => {
    it('should have all expected error codes', () => {
      expect(ErrorCode.AUTH_FAILED).toBe('AUTH_FAILED');
      expect(ErrorCode.API_ERROR).toBe('API_ERROR');
      expect(ErrorCode.VALIDATION_ERROR).toBe('VALIDATION_ERROR');
      expect(ErrorCode.TICKET_ALREADY_USED).toBe('TICKET_ALREADY_USED');
      expect(ErrorCode.RATE_LIMIT_EXCEEDED).toBe('RATE_LIMIT_EXCEEDED');
      expect(ErrorCode.UNKNOWN_ERROR).toBe('UNKNOWN_ERROR');
    });
  });

  describe('Error Severity', () => {
    it('should have all severity levels', () => {
      expect(ErrorSeverity.LOW).toBe('low');
      expect(ErrorSeverity.MEDIUM).toBe('medium');
      expect(ErrorSeverity.HIGH).toBe('high');
      expect(ErrorSeverity.CRITICAL).toBe('critical');
    });
  });
});
