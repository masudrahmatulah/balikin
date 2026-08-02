/**
 * Vercel Blob storage utilities for blog images
 * With enhanced security and validation
 */

import { put } from '@vercel/blob';

export interface BlobUploadResult {
  url: string;
  downloadUrl: string;
  size: number;
  uploadedAt: Date;
  contentType: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
] as const;

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MIN_DIMENSIONS = 100; // 100px
const MAX_DIMENSIONS = 4096; // 4096px

type AllowedImageType = typeof ALLOWED_IMAGE_TYPES[number];

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Validate image file type
 */
function isValidImageType(contentType: string): contentType is AllowedImageType {
  return ALLOWED_IMAGE_TYPES.includes(contentType as AllowedImageType);
}

/**
 * Validate file size
 */
function isValidFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

/**
 * Validate file extension matches content type
 */
function validateExtensionMatch(filename: string, contentType: string): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();

  const extensionMap: Record<string, string[]> = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
  };

  const validExtensions = extensionMap[contentType];
  return validExtensions?.includes(extension || '') || false;
}

/**
 * Detect if file content matches declared type (basic check)
 * This prevents file type spoofing attacks
 */
async function validateFileContent(file: Buffer | ArrayBuffer, contentType: string): Promise<boolean> {
  const bytes = file instanceof ArrayBuffer ?
    new Uint8Array(file.slice(0, 12)) :
    file.slice(0, 12);

  // Check magic bytes for common image formats
  const jpeg = [0xFF, 0xD8, 0xFF];
  const png = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
  const webp = [0x52, 0x49, 0x46, 0x46]; // RIFF

  const matches = (pattern: number[]) =>
    pattern.every((byte, i) => bytes[i] === byte);

  switch (contentType) {
    case 'image/jpeg':
    case 'image/jpg':
      return matches(jpeg);
    case 'image/png':
      return matches(png);
    case 'image/webp':
      return matches(webp);
    default:
      return false;
  }
}

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Upload blog image with validation
 * @throws {Error} If validation fails or upload fails
 */
export async function uploadBlogImage(
  file: File | Buffer,
  filename: string,
  contentType: string
): Promise<BlobUploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
  }

  // Validate content type
  if (!isValidImageType(contentType)) {
    throw new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.');
  }

  // Get file size and buffer
  let buffer: Buffer;
  let size: number;

  if (file instanceof File) {
    size = file.size;
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    size = file.length;
    buffer = file;
  }

  // Validate file size
  if (!isValidFileSize(size)) {
    throw new Error(`File size must be between 1 byte and ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
  }

  // Validate extension matches content type
  if (!validateExtensionMatch(filename, contentType)) {
    throw new Error('File extension does not match the declared content type.');
  }

  // Validate file content (magic bytes check)
  const contentValid = await validateFileContent(buffer, contentType);
  if (!contentValid) {
    throw new Error('File content does not match the declared type. Possible file type spoofing detected.');
  }

  try {
    const blob = await put(filename, buffer, {
      access: 'public',
      contentType,
      token,
    });

    return {
      url: blob.url,
      downloadUrl: blob.downloadUrl,
      size: blob.size,
      uploadedAt: new Date(blob.uploadedAt),
      contentType: blob.contentType,
    };
  } catch (error) {
    console.error('Failed to upload image to blob storage:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
}

/**
 * Delete blob from storage
 */
export async function deleteBlob(url: string): Promise<void> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN environment variable is not set');
  }

  try {
    await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error('Failed to delete blob:', error);
    throw new Error('Failed to delete image. Please try again.');
  }
}

/**
 * Generate unique filename for blog images
 */
export function generateBlogImageFilename(
  type: 'cover' | 'gallery' | 'author',
  extension: string
): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `blog/${type}/${timestamp}-${random}.${extension}`;
}

/**
 * Get file extension from content type
 */
export function getImageExtension(contentType: AllowedImageType): string {
  const extensions: Record<AllowedImageType, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  };

  return extensions[contentType] || 'jpg';
}

/**
 * Comprehensive file validation for image upload
 * Use this before calling uploadBlogImage
 */
export function isValidImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  if (!isValidImageType(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`
    };
  }

  if (!isValidFileSize(file.size)) {
    return {
      valid: false,
      error: `File size must be between 1 byte and ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    };
  }

  if (!validateExtensionMatch(file.name, file.type)) {
    return {
      valid: false,
      error: 'File extension does not match the file type.'
    };
  }

  return { valid: true };
}
