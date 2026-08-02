/**
 * Blog-specific validation and sanitization utilities
 * Following patterns from /app/actions/tag.ts
 */

import { ValidationError } from './error-handler';
import DOMPurify from 'dompurify';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FIELD_LENGTH = {
  name: 100,
  commentText: 2000,
  storyTitle: 200,
  storyText: 5000,
  videoUrl: 500,
  balikinTagId: 50,
  shippingAddress: 500,
  blogTitle: 200,
  blogSummary: 500,
  blogContent: 50000,
  slug: 100,
} as const;

const VALID_JACKET_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;
type JacketSize = typeof VALID_JACKET_SIZES[number];

// DOMPurify configuration for blog content
const PURIFY_CONFIG = {
  ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre', 'img', 'div', 'span'],
  ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'rel', 'target'],
  ALLOW_DATA_ATTR: false,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  ADD_ATTR: ['rel'], // For security: add noopener to links
  FORBID_TAGS: ['script', 'style', 'iframe', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
};

// ============================================================================
// SANITIZATION
// ============================================================================

/**
 * Sanitize user input by removing potentially dangerous characters
 * Follows pattern from /app/actions/tag.ts
 */
export function sanitizeInput(input: string, maxLength: number): string {
  if (!input) return '';

  const trimmed = input.trim();

  if (trimmed.length > maxLength) {
    throw new ValidationError(
      `Input terlalu panjang (maksimal ${maxLength} karakter)`
    );
  }

  // Remove control characters and normalize
  const sanitized = trimmed.replace(/[\x00-\x1F\x7F]/g, '');

  return sanitized;
}

/**
 * Sanitize HTML content for blog posts using DOMPurify
 * Provides comprehensive XSS protection
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return '';

  const clean = DOMPurify.sanitize(html, {
    ...PURIFY_CONFIG,
    // Add noopener/noreferrer to all links for security
    TRANSFORM_URL: (url) => {
      // Only allow http/https protocols
      if (!/^https?:\/\//i.test(url)) {
        return '#';
      }
      return url;
    },
  });

  return clean;
}

/**
 * Sanitize and secure links in HTML
 * Adds security attributes to all links
 */
export function secureLinks(html: string): string {
  return html.replace(/<a\s+(.+?)>/gi, (match, attrs) => {
    // Add rel="noopener noreferrer" if not present
    if (!attrs.includes('rel=')) {
      return `<a ${attrs} rel="noopener noreferrer">`;
    }
    return match;
  });
}

/**
 * Escape special characters for safe display in HTML
 */
export function escapeHtml(unsafe: string): string {
  if (!unsafe) return '';

  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate WhatsApp number format
 * Follows pattern from /app/actions/tag.ts
 */
export function validateWhatsAppNumber(phone: string): string {
  if (!phone || phone.trim().length === 0) {
    throw new ValidationError('Nomor WhatsApp wajib diisi');
  }

  const cleaned = phone.replace(/[\s\-]/g, '');
  const phoneRegex = /^(\+62|62|0)[0-9]{9,12}$/;

  if (!phoneRegex.test(cleaned)) {
    throw new ValidationError(
      'Format nomor WhatsApp tidak valid. Gunakan format: 08123456789 atau +628123456789'
    );
  }

  return cleaned;
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, allowedSchemes: string[] = ['http', 'https', '']): string {
  if (!url || url.trim().length === 0) {
    throw new ValidationError('URL wajib diisi');
  }

  const trimmed = url.trim();

  try {
    const parsed = new URL(trimmed);

    if (allowedSchemes.length > 0 && !allowedSchemes.includes(parsed.protocol.replace(':', ''))) {
      throw new ValidationError(`URL harus menggunakan scheme: ${allowedSchemes.join(', ')}`);
    }

    return trimmed;
  } catch {
    throw new ValidationError('Format URL tidak valid');
  }
}

/**
 * Validate Balikin Tag ID format
 */
export function validateBalikinTagId(tagId: string): string {
  if (!tagId || tagId.trim().length === 0) {
    throw new ValidationError('ID Tag BALIKIN wajib diisi');
  }

  const trimmed = tagId.trim().toUpperCase();

  // BLK-XXXXX format or similar
  const tagIdRegex = /^BLK[-_]?[A-Z0-9]+$/;

  if (!tagIdRegex.test(trimmed)) {
    throw new ValidationError(
      'Format ID Tag tidak valid. Contoh: BLK-12345 atau BLK-ABC12'
    );
  }

  return trimmed;
}

/**
 * Validate jacket size
 */
export function validateJacketSize(size: string): JacketSize {
  if (!size) {
    throw new ValidationError('Ukuran jaket wajib dipilih');
  }

  const upperSize = size.toUpperCase() as JacketSize;

  if (!VALID_JACKET_SIZES.includes(upperSize)) {
    throw new ValidationError(
      `Ukuran jaket tidak valid. Pilihan: ${VALID_JACKET_SIZES.join(', ')}`
    );
  }

  return upperSize;
}

/**
 * Validate quiz score range
 */
export function validateScore(score: number): number {
  if (typeof score !== 'number' || isNaN(score)) {
    throw new ValidationError('Skor harus berupa angka');
  }

  if (score < 0 || score > 100) {
    throw new ValidationError('Skor harus antara 0-100');
  }

  return Math.round(score);
}

/**
 * Validate blog post slug format
 */
export function validateSlug(slug: string): string {
  if (!slug || slug.trim().length === 0) {
    throw new ValidationError('Slug wajib diisi');
  }

  const trimmed = slug.trim().toLowerCase();

  // Only allow alphanumeric, hyphens, and underscores
  const slugRegex = /^[a-z0-9-_]+$/;

  if (!slugRegex.test(trimmed)) {
    throw new ValidationError(
      'Slug hanya boleh mengandung huruf kecil, angka, tanda hubung (-), dan underscore (_)'
    );
  }

  if (trimmed.length > MAX_FIELD_LENGTH.slug) {
    throw new ValidationError(`Slug maksimal ${MAX_FIELD_LENGTH.slug} karakter`);
  }

  return trimmed;
}

/**
 * Validate comment text length and content
 */
export function validateCommentText(text: string): string {
  const sanitized = sanitizeInput(text, MAX_FIELD_LENGTH.commentText);

  if (sanitized.length < 3) {
    throw new ValidationError('Komentar minimal 3 karakter');
  }

  return sanitized;
}

/**
 * Validate story title and text
 */
export function validateStorySubmission(title: string, text: string): { title: string; text: string } {
  const sanitizedTitle = sanitizeInput(title, MAX_FIELD_LENGTH.storyTitle);
  const sanitizedText = sanitizeInput(text, MAX_FIELD_LENGTH.storyText);

  if (sanitizedTitle.length < 10) {
    throw new ValidationError('Judul kisah minimal 10 karakter');
  }

  if (sanitizedText.length < 50) {
    throw new ValidationError('Cerita kisah minimal 50 karakter');
  }

  return { title: sanitizedTitle, text: sanitizedText };
}

/**
 * Validate shipping address
 */
export function validateShippingAddress(address: string): string {
  const sanitized = sanitizeInput(address, MAX_FIELD_LENGTH.shippingAddress);

  if (sanitized.length < 20) {
    throw new ValidationError('Alamat lengkap minimal 20 karakter');
  }

  return sanitized;
}

/**
 * Validate blog post content
 */
export function validateBlogPostContent(title: string, summary: string, content: string): {
  title: string;
  summary: string;
  content: string;
} {
  const sanitizedTitle = sanitizeInput(title, MAX_FIELD_LENGTH.blogTitle);
  const sanitizedSummary = sanitizeInput(summary, MAX_FIELD_LENGTH.blogSummary);
  const sanitizedContent = sanitizeHtmlContent(content);

  if (sanitizedTitle.length < 5) {
    throw new ValidationError('Judul artikel minimal 5 karakter');
  }

  if (sanitizedSummary.length < 50) {
    throw new ValidationError('Ringkasan artikel minimal 50 karakter');
  }

  if (sanitizedContent.length < 100) {
    throw new ValidationError('Konten artikel minimal 100 karakter');
  }

  return {
    title: sanitizedTitle,
    summary: sanitizedSummary,
    content: sanitizedContent,
  };
}
