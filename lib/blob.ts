import { put, del, head } from '@vercel/blob';

/**
 * Upload a document to Vercel Blob storage
 * @param file - The file to upload
 * @param userId - The user ID for organizing storage
 * @param documentType - Type of document (ktm, krs, stnk, etc.)
 * @returns Object with URL and size
 */
export async function uploadDocument(
  file: File | Buffer,
  userId: string,
  documentType: string,
  fileName?: string
): Promise<{ url: string; size: number }> {
  const actualFileName =
    fileName || (typeof file === 'object' && 'name' in file ? file.name : 'document');

  // Get file size if it's a File object
  const fileSize = file instanceof File ? file.size : 0;

  const blob = await put(`${userId}/${documentType}/${Date.now()}-${actualFileName}`, file, {
    access: 'private', // Private for security - requires auth to access
  });

  return {
    url: blob.url,
    size: fileSize,
  };
}

/**
 * Upload a public document (accessible without authentication)
 * Use this for certificates or other documents that need to be publicly shareable
 */
export async function uploadPublicDocument(
  file: File | Buffer,
  userId: string,
  documentType: string,
  fileName?: string
): Promise<{ url: string; size: number }> {
  const actualFileName =
    fileName || (typeof file === 'object' && 'name' in file ? file.name : 'document');

  // Get file size if it's a File object
  const fileSize = file instanceof File ? file.size : 0;

  const blob = await put(`${userId}/${documentType}/${Date.now()}-${actualFileName}`, file, {
    access: 'public',
  });

  return {
    url: blob.url,
    size: fileSize,
  };
}

/**
 * Get metadata about a file without downloading it
 */
export async function getDocumentMetadata(url: string) {
  return await head(url);
}

/**
 * Delete a document from Vercel Blob storage
 */
export async function deleteDocument(url: string): Promise<void> {
  await del(url);
}

/**
 * Check if a Blob URL exists
 */
export async function documentExists(url: string): Promise<boolean> {
  try {
    await head(url);
    return true;
  } catch {
    return false;
  }
}
