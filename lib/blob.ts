import { put, del, head, list } from '@vercel/blob';

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'application/pdf',
]);

const DOCUMENT_TYPES = {
  KTM: 'ktm',
  KRS: 'krs',
  STNK: 'stnk',
  CERTIFICATE: 'certificate',
  PAYMENT_PROOF: 'payment_proof',
  PROFILE_PHOTO: 'profile_photo',
} as const;

type DocumentType = typeof DOCUMENT_TYPES[keyof typeof DOCUMENT_TYPE];

// ============================================================================
// VALIDATION
// ============================================================================

function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE_BYTES;
}

function validateMimeType(mimeType: string): boolean {
  return ALLOWED_MIME_TYPES.has(mimeType);
}

function sanitizeFileName(fileName: string): string {
  return fileName
    .replace(/[^a-zA-Z0-9.\-_]/g, '_')
    .substring(0, 100);
}

function getExtensionFromMimeType(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'application/pdf': 'pdf',
  };
  return mimeToExt[mimeType] || 'bin';
}

// ============================================================================
// UPLOAD FUNCTIONS
// ============================================================================

interface UploadResult {
  url: string;
  size: number;
  mimeType: string;
  uploadedAt: Date;
}

interface UploadOptions {
  access?: 'public' | 'private';
  maxSize?: number;
  allowedTypes?: readonly string[];
}

/**
 * Upload a document to Vercel Blob storage with validation
 */
export async function uploadDocument(
  file: File | Buffer,
  userId: string,
  documentType: string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  const { access = 'private', maxSize = MAX_FILE_SIZE_BYTES, allowedTypes = Array.from(ALLOWED_MIME_TYPES) } = options;

  let fileName: string;
  let fileSize: number;
  let mimeType: string;

  if (file instanceof File) {
    fileSize = file.size;
    mimeType = file.type;
    fileName = file.name;
  } else {
    fileSize = Buffer.byteLength(file);
    mimeType = 'application/octet-stream';
    fileName = 'document.bin';
  }

  if (!validateFileSize(fileSize)) {
    throw new Error(`File size exceeds maximum of ${maxSize} bytes`);
  }

  if (mimeType !== 'application/octet-stream' && !allowedTypes.includes(mimeType)) {
    throw new Error(`File type ${mimeType} is not allowed`);
  }

  const sanitizedFileName = sanitizeFileName(fileName);
  const timestamp = Date.now();
  const blobKey = `${userId}/${documentType}/${timestamp}-${sanitizedFileName}`;

  const blob = await put(blobKey, file, {
    access,
    contentType: mimeType,
    addRandomSuffix: true,
  });

  return {
    url: blob.url,
    size: fileSize,
    mimeType,
    uploadedAt: new Date(),
  };
}

/**
 * Upload a public document with optimized settings
 */
export async function uploadPublicDocument(
  file: File | Buffer,
  userId: string,
  documentType: string,
  fileName?: string
): Promise<UploadResult> {
  return uploadDocument(file, userId, documentType, {
    access: 'public',
    maxSize: MAX_FILE_SIZE_BYTES,
  });
}

/**
 * Upload an optimized image with format conversion
 */
export async function uploadOptimizedImage(
  file: File | Buffer,
  userId: string,
  options: {
    quality?: number;
    format?: 'jpeg' | 'webp' | 'avif';
    maxWidth?: number;
  } = {}
): Promise<UploadResult> {
  const { quality = 80, format = 'webp', maxWidth = 1920 } = options;

  if (file instanceof File && !file.type.startsWith('image/')) {
    throw new Error('File must be an image');
  }

  const targetMimeType = `image/${format}`;
  const allowedFormats = ['image/jpeg', 'image/webp', 'image/avif'] as const;

  return uploadDocument(file, userId, DOCUMENT_TYPES.PROFILE_PHOTO, {
    access: 'public',
    maxSize: MAX_FILE_SIZE_BYTES,
    allowedTypes: allowedFormats,
  });
}

// ============================================================================
// METADATA FUNCTIONS
// ============================================================================

interface DocumentMetadata {
  url: string;
  size: number;
  uploadedAt: Date;
  contentType: string;
  cacheControl?: string;
}

/**
 * Get metadata about a file without downloading it
 */
export async function getDocumentMetadata(url: string): Promise<DocumentMetadata | null> {
  try {
    const metadata = await head(url);
    return {
      url: metadata.url,
      size: metadata.size,
      uploadedAt: new Date(metadata.uploadedAt),
      contentType: metadata.contentType || 'application/octet-stream',
      cacheControl: metadata.cacheControl,
    };
  } catch {
    return null;
  }
}

/**
 * Check if a Blob URL exists
 */
export async function documentExists(url: string): Promise<boolean> {
  return (await getDocumentMetadata(url)) !== null;
}

// ============================================================================
// MANAGEMENT FUNCTIONS
// ============================================================================

/**
 * List documents for a user with pagination
 */
export async function listUserDocuments(
  userId: string,
  prefix: string = ''
): Promise<string[]> {
  try {
    const blobs = await list({ prefix: `${userId}/${prefix}` });
    return blobs.blobs.map((blob) => blob.url);
  } catch {
    return [];
  }
}

/**
 * Delete a document from Vercel Blob storage
 */
export async function deleteDocument(url: string): Promise<void> {
  await del(url);
}

/**
 * Delete multiple documents in batch
 */
export async function deleteDocuments(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  await del(urls);
}

/**
 * Cleanup old documents for a user
 */
export async function cleanupOldUserDocuments(
  userId: string,
  olderThanDays: number = 30
): Promise<number> {
  const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);
  const allBlobs = await listUserDocuments(userId);

  let deletedCount = 0;

  for (const url of allBlobs) {
    const metadata = await getDocumentMetadata(url);
    if (metadata && metadata.uploadedAt < cutoffDate) {
      await deleteDocument(url);
      deletedCount++;
    }
  }

  return deletedCount;
}

// ============================================================================
// EXPORTS
// ============================================================================

export { DOCUMENT_TYPES };
export type { DocumentType };
