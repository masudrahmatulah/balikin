/**
 * QR Code Generation API Data Access Layer
 * Handles QR code generation with caching and error handling
 */

import { unstable_cache } from 'next/cache';
import { generateQRCodeSVG } from '@/lib/qrcode-generator';

const cachedQR = unstable_cache(
  async (data: string) => {
    return await generateQRCodeSVG(data, {
      size: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  },
  ['qr-generation'],
  { revalidate: 86400, tags: ['qr'] }
);

/**
 * Generate QR code as SVG with caching
 * @param data - Data to encode in QR code
 * @returns SVG string
 */
export async function generateCachedQRCode(data: string): Promise<string> {
  return cachedQR(data);
}