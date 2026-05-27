/**
 * Error Handling & Monitoring System
 * Provides centralized error handling, structured logging, and performance monitoring
 */

// ============================================================================
// ERROR TYPES
// ============================================================================

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',

  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',

  // Not Found
  NOT_FOUND = 'NOT_FOUND',
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',

  // Rate Limiting
  RATE_LIMITED = 'RATE_LIMITED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',

  // Database
  DATABASE_ERROR = 'DATABASE_ERROR',
  QUERY_FAILED = 'QUERY_FAILED',
  CONNECTION_ERROR = 'CONNECTION_ERROR',

  // External Services
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  BLOB_UPLOAD_FAILED = 'BLOB_UPLOAD_FAILED',
  EMAIL_SEND_FAILED = 'EMAIL_SEND_FAILED',
  WHATSAPP_SEND_FAILED = 'WHATSAPP_SEND_FAILED',

  // Business Logic
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  LIMIT_REACHED = 'LIMIT_REACHED',
  INVALID_STATE = 'INVALID_STATE',

  // Generic
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  VALIDATION = 'validation',
  DATABASE = 'database',
  EXTERNAL = 'external',
  BUSINESS_LOGIC = 'business_logic',
  SYSTEM = 'system',
}

// ============================================================================
// ERROR CLASS
// ============================================================================

interface ErrorContext {
  userId?: string;
  tagId?: string;
  path?: string;
  method?: string;
  userAgent?: string;
  ipAddress?: string;
  [key: string]: unknown;
}

interface ErrorMetadata {
  code: ErrorCode;
  severity: ErrorSeverity;
  category: ErrorCategory;
  context?: ErrorContext;
  stack?: string;
  timestamp: Date;
}

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly severity: ErrorSeverity;
  public readonly category: ErrorCategory;
  public readonly context?: ErrorContext;
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly timestamp: Date;

  constructor(
    message: string,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    category: ErrorCategory = ErrorCategory.SYSTEM,
    context?: ErrorContext,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.severity = severity;
    this.category = category;
    this.context = context;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.timestamp = new Date();

    Error.captureStackTrace(this, this.constructor);
  }

  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      severity: this.severity,
      category: this.category,
      context: this.context,
      statusCode: this.statusCode,
      isOperational: this.isOperational,
      timestamp: this.timestamp.toISOString(),
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack }),
    };
  }

  toSafeJSON(): Record<string, unknown> {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

// ============================================================================
// SPECIFIC ERROR CLASSES
// ============================================================================

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required', context?: ErrorContext) {
    super(
      message,
      ErrorCode.UNAUTHORIZED,
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHENTICATION,
      context,
      401
    );
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Access denied', context?: ErrorContext) {
    super(
      message,
      ErrorCode.FORBIDDEN,
      ErrorSeverity.HIGH,
      ErrorCategory.AUTHENTICATION,
      context,
      403
    );
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, context?: ErrorContext) {
    super(
      message,
      ErrorCode.VALIDATION_ERROR,
      ErrorSeverity.LOW,
      ErrorCategory.VALIDATION,
      { ...context, field },
      400
    );
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string, context?: ErrorContext) {
    const message = identifier
      ? `${resource} with identifier "${identifier}" not found`
      : `${resource} not found`;

    super(
      message,
      ErrorCode.NOT_FOUND,
      ErrorSeverity.LOW,
      ErrorCategory.BUSINESS_LOGIC,
      { ...context, resource, identifier },
      404
    );
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Rate limit exceeded', context?: ErrorContext) {
    super(
      message,
      ErrorCode.RATE_LIMITED,
      ErrorSeverity.MEDIUM,
      ErrorCategory.SYSTEM,
      context,
      429
    );
    this.name = 'RateLimitError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, context?: ErrorContext) {
    super(
      message,
      ErrorCode.DATABASE_ERROR,
      ErrorSeverity.HIGH,
      ErrorCategory.DATABASE,
      context,
      500
    );
    this.name = 'DatabaseError';
  }
}

export class ExternalServiceError extends AppError {
  constructor(service: string, message: string, context?: ErrorContext) {
    super(
      `${service}: ${message}`,
      ErrorCode.EXTERNAL_SERVICE_ERROR,
      ErrorSeverity.HIGH,
      ErrorCategory.EXTERNAL,
      { ...context, service },
      502
    );
    this.name = 'ExternalServiceError';
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: Date;
  context?: ErrorContext;
  success: boolean;
  error?: string;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics = 1000;

  startTimer(name: string, context?: ErrorContext): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;

      this.record({
        name,
        duration,
        timestamp: new Date(),
        context,
        success: true,
      });
    };
  }

  recordError(name: string, error: Error, context?: ErrorContext): void {
    this.record({
      name,
      duration: 0,
      timestamp: new Date(),
      context,
      success: false,
      error: error.message,
    });
  }

  record(metric: PerformanceMetric): void {
    this.metrics.push(metric);

    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(name?: string, limit?: number): PerformanceMetric[] {
    let filtered = this.metrics;

    if (name) {
      filtered = filtered.filter((m) => m.name === name);
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? filtered.slice(0, limit) : filtered;
  }

  getAverageDuration(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  getSuccessRate(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const successful = metrics.filter((m) => m.success).length;
    return successful / metrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ============================================================================
// LOGGING
// ============================================================================

interface LogEntry {
  level: 'info' | 'warn' | 'error';
  message: string;
  timestamp: Date;
  context?: ErrorContext;
  metadata?: Record<string, unknown>;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 500;

  info(message: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.log('info', message, context, metadata);
  }

  warn(message: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    this.log('warn', message, context, metadata);
  }

  error(message: string, error?: Error | AppError, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    const errorMetadata: Record<string, unknown> = { ...metadata };

    if (error instanceof AppError) {
      errorMetadata.code = error.code;
      errorMetadata.severity = error.severity;
      errorMetadata.category = error.category;
    } else if (error instanceof Error) {
      errorMetadata.stack = error.stack;
    }

    this.log('error', message, context, errorMetadata);
  }

  private log(level: LogEntry['level'], message: string, context?: ErrorContext, metadata?: Record<string, unknown>): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      metadata,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // In production, send to external logging service
    // if (process.env.NODE_ENV === 'production') {
    //   sendToLogService(entry);
    // }
  }

  getLogs(level?: LogEntry['level'], limit?: number): LogEntry[] {
    let filtered = this.logs;

    if (level) {
      filtered = filtered.filter((l) => l.level === level);
    }

    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return limit ? filtered.slice(0, limit) : filtered;
  }

  clear(): void {
    this.logs = [];
  }
}

export const logger = new Logger();

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

/**
 * Convert any error to AppError
 */
export function toAppError(error: unknown, context?: ErrorContext): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      error.message,
      ErrorCode.INTERNAL_ERROR,
      ErrorSeverity.MEDIUM,
      ErrorCategory.SYSTEM,
      context,
      500
    );
  }

  return new AppError(
    'An unknown error occurred',
    ErrorCode.UNKNOWN_ERROR,
    ErrorSeverity.MEDIUM,
    ErrorCategory.SYSTEM,
    context
  );
}

/**
 * Handle error in server actions
 */
export function handleActionError(error: unknown, context?: ErrorContext): never {
  const appError = toAppError(error, context);
  logger.error(appError.message, appError, context);

  throw appError;
}

/**
 * Handle error in API routes
 */
export function handleApiError(error: unknown, context?: ErrorContext): {
  error: string;
  code: string;
  statusCode: number;
  details?: Record<string, unknown>;
} {
  const appError = toAppError(error, context);
  logger.error(appError.message, appError, context);

  return {
    error: appError.message,
    code: appError.code,
    statusCode: appError.statusCode,
    ...(process.env.NODE_ENV === 'development' && {
      details: appError.context,
    }),
  };
}

/**
 * Wrap async function with error handling and performance monitoring
 */
export function withMonitoring<T extends unknown[], R>(
  name: string,
  fn: (...args: T) => Promise<R>
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    const endTimer = performanceMonitor.startTimer(name);

    try {
      const result = await fn(...args);
      endTimer();
      return result;
    } catch (error) {
      const appError = toAppError(error);
      performanceMonitor.recordError(name, appError);
      logger.error(name, appError);
      throw appError;
    }
  };
}

/**
 * Wrap async function with fallback value
 */
export async function withFallback<T>(
  operation: () => Promise<T>,
  fallback: T,
  context?: ErrorContext
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = toAppError(error, context);
    logger.error('Operation failed, using fallback', appError, context);
    return fallback;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export { ErrorCode, ErrorSeverity, ErrorCategory };
export type { ErrorContext, ErrorMetadata, PerformanceMetric, LogEntry };