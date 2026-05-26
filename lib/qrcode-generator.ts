/**
 * QR Code Generator Utility
 * Generates QR codes as data URLs or SVG for web pages
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

export interface QRCodeGenerationError extends Error {
  code: 'INVALID_INPUT' | 'GENERATION_FAILED';
}

class QRCodeError extends Error implements QRCodeGenerationError {
  code: QRCodeGenerationError['code'];

  constructor(message: string, code: QRCodeGenerationError['code']) {
    super(message);
    this.name = 'QRCodeError';
    this.code = code;
  }
}

/**
 * Validate QR code input
 */
function validateInput(data: string, options: QRCodeOptions): void {
  if (!data || typeof data !== 'string') {
    throw new QRCodeError('Data input tidak valid', 'INVALID_INPUT');
  }

  if (data.length > 2000) {
    throw new QRCodeError('Data input terlalu panjang (maksimal 2000 karakter)', 'INVALID_INPUT');
  }

  if (options.size && (options.size < 50 || options.size > 1000)) {
    throw new QRCodeError('Ukuran QR code harus antara 50-1000px', 'INVALID_INPUT');
  }

  if (options.margin && (options.margin < 0 || options.margin > 10)) {
    throw new QRCodeError('Margin QR code harus antara 0-10', 'INVALID_INPUT');
  }
}

/**
 * Generate QR code as data URL (base64 PNG)
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

  validateInput(data, { size, margin, color });

  try {
    const dataURL = await QRCode.toDataURL(data, {
      width: size,
      margin,
      color,
      errorCorrectionLevel: 'M',
    });

    return dataURL;
  } catch (error) {
    throw new QRCodeError('Gagal membuat QR code', 'GENERATION_FAILED');
  }
}

/**
 * Generate QR code as SVG string (recommended for better caching)
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

  validateInput(data, { size, margin, color });

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
    throw new QRCodeError('Gagal membuat QR code SVG', 'GENERATION_FAILED');
  }
}

/**
 * Check if error is a QRCodeError
 */
export function isQRCodeError(error: unknown): error is QRCodeError {
  return error instanceof QRCodeError;
}