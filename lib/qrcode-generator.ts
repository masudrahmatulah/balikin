/**
 * QR Code Generator Utility
 * Generates QR codes as data URLs for easy embedding in web pages
 */

import QRCode from 'qrcode';

export interface QRCodeOptions {
  size?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
}

/**
 * Generate QR code as data URL (base64)
 * @param data - URL or text to encode in QR code
 * @param options - QR code generation options
 * @returns Promise<string> - Data URL starting with 'data:image/png;base64,'
 */
export async function generateQRCodeDataURL(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 2,
    color = {
      dark: '#000000',
      light: '#FFFFFF',
    },
  } = options;

  try {
    const dataURL = await QRCode.toDataURL(data, {
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M', // Medium error correction
    });

    return dataURL;
  } catch (error) {
    console.error('[QR Code] Failed to generate QR code:', error);
    throw new Error('Gagal membuat QR code');
  }
}

/**
 * Generate QR code as SVG string
 * @param data - URL or text to encode in QR code
 * @param options - QR code generation options
 * @returns Promise<string> - SVG string
 */
export async function generateQRCodeSVG(
  data: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const {
    size = 300,
    margin = 2,
    color = {
      dark: '#000000',
      light: '#FFFFFF',
    },
  } = options;

  try {
    const svg = await QRCode.toString(data, {
      type: 'svg',
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });

    return svg;
  } catch (error) {
    console.error('[QR Code] Failed to generate QR code SVG:', error);
    throw new Error('Gagal membuat QR code SVG');
  }
}
