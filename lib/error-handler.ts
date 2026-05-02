/**
 * Standardized error handling utilities for consistent error management across the app
 */

export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication failed', details?: unknown) {
    super(message, 'AUTH_ERROR', 401, details);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'You do not have permission to perform this action', details?: unknown) {
    super(message, 'AUTHORIZATION_ERROR', 403, details);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier "${identifier}" not found`
      : `${resource} not found`;
    super(message, 'NOT_FOUND', 404, { resource, identifier });
    this.name = 'NotFoundError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public field?: string, details?: unknown) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class DatabaseError extends AppError {
  constructor(message: string = 'Database operation failed', details?: unknown) {
    super(message, 'DATABASE_ERROR', 500, details);
    this.name = 'DatabaseError';
  }
}

/**
 * Log error consistently for debugging and monitoring
 */
export function logError(error: unknown, context?: string): void {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;

  console.error(`[${context || 'App'}] Error:`, {
    message: errorMessage,
    stack: errorStack,
    error,
  });
}

/**
 * Handle errors in server actions consistently
 */
export function handleActionError(error: unknown): never {
  if (error instanceof AppError) {
    logError(error, 'ServerAction');
    throw error;
  }

  if (error instanceof Error) {
    logError(error, 'ServerAction');
    throw new AppError(error.message, 'UNKNOWN_ERROR', 500, error);
  }

  logError(error, 'ServerAction');
  throw new AppError('An unexpected error occurred', 'UNKNOWN_ERROR', 500, error);
}

/**
 * Create a user-friendly error message from various error types
 */
export function getUserMessage(error: unknown): string {
  if (error instanceof AppError) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose internal error messages to users
    return 'Something went wrong. Please try again.';
  }

  return 'An unexpected error occurred. Please try again.';
}
