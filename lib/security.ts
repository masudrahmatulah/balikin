/**
 * Security utilities for input sanitization and XSS prevention
 */

import { z } from 'zod';

/**
 * Sanitize HTML content to prevent XSS attacks
 * - Removes script tags and event handlers
 * - Escapes special characters
 */
export function sanitizeHtml(unsafe: string): string {
  if (typeof unsafe !== 'string') return '';

  return unsafe
    // Remove script tags and content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remove event handlers
    .replace(/on\w+\s*=/gi, '')
    // Remove javascript: protocol
    .replace(/javascript:/gi, '')
    // Escape HTML special chars
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize JSON data by recursively cleaning all string values
 */
export function sanitize(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeHtml(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj).reduce((acc, key) => {
      acc[key] = sanitize((obj as Record<string, unknown>)[key]);
      return acc;
    }, {} as Record<string, unknown>);
  }

  return obj;
}

/**
 * Validate and sanitize share code format
 */
export function isValidShareCode(code: string): boolean {
  const shareCodeSchema = z.string()
    .length(10, 10)
    .regex(/^[a-z0-9_-]+$/i);

  try {
    return shareCodeSchema.safeParse(code).success;
  } catch {
    return false;
  }
}

/**
 * Validate phone number format (Indonesia)
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneSchema = z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/);

  try {
    return phoneSchema.safeParse(phone).success;
  } catch {
    return false;
  }
}

/**
 * Safe JSON parse with error handling
 */
export function safeJsonParse<T = unknown>(jsonString: string, fallback: T): T {
  try {
    const parsed = JSON.parse(jsonString);
    // Sanitize to prevent XSS
    return sanitize(parsed) as T;
  } catch {
    return fallback;
  }
}
