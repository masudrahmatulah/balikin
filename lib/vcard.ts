/**
 * vCard Utility Functions
 * Handles vCard 3.0 format generation and validation
 */

import { z } from 'zod';

/**
 * vCard 3.0 format specification
 * https://www.ietf.org/rfc/rfc2426.txt
 */

export const vCardSchema = z.object({
  fullName: z.string().min(1).max(100),
  title: z.string().max(100).optional(),
  email: z.string().email().max(255).optional(),
  phone: z.string().regex(/^[\d\s\+\-\(\)]+$/).max(20).optional(),
  linkedinUrl: z.string().url().max(500).optional(),
  portfolioUrl: z.string().url().max(500).optional(),
  githubUrl: z.string().url().max(500).optional(),
  bio: z.string().max(500).optional(),
});

export type VCardData = z.infer<typeof vCardSchema>;

/**
 * Generate vCard 3.0 string for download
 */
export function generateVCardString(data: VCardData): string {
  const lines: string[] = [];

  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  lines.push(`FN:${escapeVCardField(data.fullName)}`);

  if (data.title) {
    lines.push(`TITLE:${escapeVCardField(data.title)}`);
  }

  if (data.email) {
    lines.push(`EMAIL;TYPE=WORK:${escapeVCardField(data.email)}`);
  }

  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${escapeVCardField(data.phone)}`);
  }

  if (data.linkedinUrl) {
    lines.push(`URL;TYPE=LinkedIn:${escapeVCardField(data.linkedinUrl)}`);
  }

  if (data.portfolioUrl) {
    lines.push(`URL;TYPE=Portfolio:${escapeVCardField(data.portfolioUrl)}`);
  }

  if (data.githubUrl) {
    lines.push(`URL;TYPE=GitHub:${escapeVCardField(data.githubUrl)}`);
  }

  if (data.bio) {
    const truncatedBio = data.bio.length > 200
      ? data.bio.substring(0, 197) + '...'
      : data.bio;
    lines.push(`NOTE:${escapeVCardField(truncatedBio)}`);
  }

  lines.push('END:VCARD');

  return lines.join('\n');
}

/**
 * Escape special characters in vCard fields
 * https://www.ietf.org/rfc/rfc2426.txt section 5.8.4
 */
function escapeVCardField(value: string): string {
  return value
    .replace(/\\/g, '\\\\') // Backslash must be escaped first
    .replace(/;/g, '\\;')    // Semicolon is a delimiter
    .replace(/,/g, '\\,')    // Comma is a delimiter
    .replace(/\n/g, '\\n')   // Newline
    .replace(/\r/g, '');     // Remove carriage return
}

/**
 * Sanitize vCard data for display (prevent XSS)
 */
export function sanitizeVCardForDisplay(data: VCardData): VCardData {
  const sanitized = { ...data };

  // Sanitize text fields to prevent XSS
  const sanitizeText = (text?: string): string | undefined => {
    if (!text) return undefined;
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  };

  sanitized.fullName = sanitizeText(data.fullName) || '';
  sanitized.title = sanitizeText(data.title);
  sanitized.email = sanitizeText(data.email);
  sanitized.phone = sanitizeText(data.phone);
  sanitized.bio = sanitizeText(data.bio);
  // URLs are rendered as href, so no additional sanitization needed

  return sanitized;
}

/**
 * Generate safe filename for vCard download
 */
export function generateVCardFilename(fullName: string): string {
  return fullName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Validate URLs are safe (no javascript: or data: protocols)
 */
export function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}