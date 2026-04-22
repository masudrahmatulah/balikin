/**
 * Custom error classes for better error handling
 */

export class AuthorizationError extends Error {
  constructor(message: string = 'Anda tidak memiliki akses') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ValidationError extends Error {
  constructor(public field: string, message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends Error {
  constructor(message: string = 'Resource tidak ditemukan') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class RateLimitError extends Error {
  constructor(message: string = 'Terlalu banyak permintaan, coba lagi nanti') {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Type guard to check if error is instance of our custom errors
 */
export function isCustomError(error: unknown): error is AuthorizationError | ValidationError | NotFoundError | RateLimitError {
  return (
    error instanceof AuthorizationError ||
    error instanceof ValidationError ||
    error instanceof NotFoundError ||
    error instanceof RateLimitError
  );
}

/**
 * Format error message for client consumption (safe, no sensitive data)
 */
export function formatErrorMessage(error: unknown): string {
  if (isCustomError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    // Don't expose internal error details
    return 'Terjadi kesalahan. Silakan coba lagi.';
  }

  return 'Terjadi kesalahan yang tidak diketahui.';
}
