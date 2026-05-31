/**
 * Admin Error Handler
 * Centralized error handling system for admin dashboard
 * Provides consistent error types, logging, and user messaging
 */

/**
 * Custom Error Classes for Admin Operations
 */
export class AdminError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = "AdminError";
  }
}

export class AuthenticationError extends AdminError {
  constructor(message: string = "Authentication failed", details?: Record<string, any>) {
    super(message, "AUTHENTICATION_ERROR", 401, details);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends AdminError {
  constructor(message: string = "Access denied", details?: Record<string, any>) {
    super(message, "AUTHORIZATION_ERROR", 403, details);
    this.name = "AuthorizationError";
  }
}

export class ValidationError extends AdminError {
  constructor(message: string, details?: Record<string, any>) {
    super(message, "VALIDATION_ERROR", 400, details);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AdminError {
  constructor(message: string = "Resource not found", details?: Record<string, any>) {
    super(message, "NOT_FOUND_ERROR", 404, details);
    this.name = "NotFoundError";
  }
}

export class DatabaseError extends AdminError {
  constructor(message: string = "Database operation failed", details?: Record<string, any>) {
    super(message, "DATABASE_ERROR", 500, details);
    this.name = "DatabaseError";
  }
}

export class ExternalServiceError extends AdminError {
  constructor(
    service: string,
    message: string = "External service failed",
    details?: Record<string, any>
  ) {
    super(`${service}: ${message}`, "EXTERNAL_SERVICE_ERROR", 502, {
      service,
      ...details,
    });
    this.name = "ExternalServiceError";
  }
}

/**
 * Error Logging Function
 * Logs errors with context for debugging
 */
export function logError(error: unknown, context: string = "Unknown"): void {
  if (error instanceof Error) {
    console.error(`[${context}]`, {
      name: error.name,
      message: error.message,
      code: (error as AdminError).code,
      statusCode: (error as AdminError).statusCode,
      details: (error as AdminError).details,
      stack: error.stack,
    });
  } else {
    console.error(`[${context}] Unknown error:`, error);
  }

  // In production, send to error tracking service
  // if (process.env.NODE_ENV === "production") {
  //   sendToErrorTracking(error, context);
  // }
}

/**
 * Handle Admin Error
 * Provides consistent error handling with user-friendly messages
 */
export function handleAdminError(error: unknown, context: string = "Operation") {
  logError(error, context);

  // Default error response
  const defaultResponse = {
    success: false,
    error: "An unexpected error occurred",
    message: "Please try again or contact support if the problem persists",
  };

  if (error instanceof AdminError) {
    return {
      ...defaultResponse,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: process.env.NODE_ENV === "development" ? error.details : undefined,
    };
  }

  if (error instanceof Error) {
    return {
      ...defaultResponse,
      error: error.message,
      statusCode: 500,
    };
  }

  return defaultResponse;
}

/**
 * Create Error Response
 * Creates a standardized error response for API routes
 */
export function createErrorResponse(
  error: unknown,
  context: string = "API Error"
): { error: string; statusCode: number; details?: any } {
  const handled = handleAdminError(error, context);

  return {
    error: handled.error || "Internal server error",
    statusCode: handled.statusCode || 500,
    ...(process.env.NODE_ENV === "development" && { details: handled.details }),
  };
}

/**
 * Wrap async function with error handling
 * Use this for API route handlers and server actions
 */
export function withErrorHandling<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context: string = "Operation"
): (...args: T) => Promise<R> {
  return async (...args: T) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(error, context);
      throw error; // Re-throw for caller to handle
    }
  };
}

/**
 * Validate Admin Access
 * Throws appropriate errors if access is denied
 */
export async function validateAdminAccess(
  session: any,
  requiredDivision?: string
): Promise<void> {
  if (!session?.user) {
    throw new AuthenticationError("No active session found");
  }

  if (session.user.role !== "admin") {
    throw new AuthorizationError("Admin access required");
  }

  if (requiredDivision && session.user.division !== requiredDivision) {
    throw new AuthorizationError(
      `Access restricted to ${requiredDivision} division`
    );
  }
}

/**
 * Safe async wrapper with fallback
 * Returns fallback value if operation fails
 */
export async function safeAsync<T>(
  operation: () => Promise<T>,
  fallback: T,
  context: string = "Operation"
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    logError(error, context);
    return fallback;
  }
}
