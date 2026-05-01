/**
 * QR Code branding utilities for generating branded QR codes
 */

import { BundleType, getBundleConfig } from './bundles';

export interface QRBrandConfig {
  foregroundColor: string;
  backgroundColor: string;
  cornerColor?: string;
  logoUrl?: string;
  frameColor?: string;
  frameText?: string;
}

/**
 * Get QR branding configuration for a bundle type
 */
export function getQRBrandConfig(bundleType: BundleType): QRBrandConfig {
  const config = getBundleConfig(bundleType);

  if (!config) {
    // Default branding
    return {
      foregroundColor: '#1E293B',
      backgroundColor: '#FFFFFF',
    };
  }

  return {
    foregroundColor: config.qrColor,
    backgroundColor: config.qrBgColor,
    frameColor: config.qrColor,
    frameText: config.emoji,
  };
}

/**
 * Generate QR code data URL (client-side)
 * This uses a simple implementation - for production, consider using a QR library
 */
export async function generateQRCodeDataURL(
  data: string,
  config: QRBrandConfig,
  size: number = 300
): Promise<string> {
  // For now, return a placeholder
  // In production, use a library like qrcode or qr-code-styling
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';

  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: data,
    color: config.foregroundColor.replace('#', ''),
    bgcolor: config.backgroundColor.replace('#', ''),
    qzone: '1', // Quiet zone
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * QR code frame styles for different bundle types
 */
export const QR_FRAME_STYLES = {
  student_kit: {
    gradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    textColor: '#FFFFFF',
    badgeColor: '#DBEAFE',
    badgeText: '#1E40AF',
  },
  otomotif: {
    gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
    textColor: '#FFFFFF',
    badgeColor: '#FEE2E2',
    badgeText: '#991B1B',
  },
  pertanian: {
    gradient: 'linear-gradient(135deg, #22C55E 0%, #15803D 100%)',
    textColor: '#FFFFFF',
    badgeColor: '#DCFCE7',
    badgeText: '#166534',
  },
  diklat: {
    gradient: 'linear-gradient(135deg, #A855F7 0%, #7C3AED 100%)',
    textColor: '#FFFFFF',
    badgeColor: '#F3E8FF',
    badgeText: '#6B21A8',
  },
  standard: {
    gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
    textColor: '#FFFFFF',
    badgeColor: '#F1F5F9',
    badgeText: '#334155',
  },
} as const;

/**
 * Get frame style for a bundle type
 */
export function getFrameStyle(bundleType: BundleType) {
  const config = getBundleConfig(bundleType);
  if (!config || !config.type) return QR_FRAME_STYLES.standard;
  return QR_FRAME_STYLES[config.type] || QR_FRAME_STYLES.standard;
}

/**
 * Generate a branded QR code SVG
 * This creates an SVG with the QR code and branded frame
 */
export function generateBrandedQRSVG(
  data: string,
  bundleType: BundleType,
  qrCodeUrl: string
): string {
  const config = getBundleConfig(bundleType);
  const frameStyle = getFrameStyle(bundleType);

  const size = 300;
  const padding = 20;
  const frameHeight = 60;

  return `
<svg width="${size}" height="${size + frameHeight}" viewBox="0 0 ${size} ${size + frameHeight}" xmlns="http://www.w3.org/2000/svg">
  <!-- Frame Background -->
  <rect x="0" y="0" width="${size}" height="${frameHeight}" fill="url(#gradient)" />

  <!-- Gradient Definition -->
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${config?.qrColor || '#64748B'};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(config?.qrColor || '#64748B', -20)};stop-opacity:1" />
    </linearGradient>
  </defs>

  <!-- Emoji Badge -->
  <circle cx="${size / 2}" cy="${frameHeight / 2}" r="20" fill="white" fill-opacity="0.2" />
  <text x="${size / 2}" y="${frameHeight / 2 + 8}" text-anchor="middle" font-size="24">${config?.emoji || '🔖'}</text>

  <!-- QR Code Background -->
  <rect x="${padding}" y="${frameHeight}" width="${size - padding * 2}" height="${size - padding * 2}" fill="${config?.qrBgColor || '#FFFFFF'}" rx="8" />

  <!-- QR Code (placeholder - in production, embed actual QR code) -->
  <image x="${padding + 10}" y="${frameHeight + 10}" width="${size - padding * 2 - 20}" height="${size - padding * 2 - 20}" href="${qrCodeUrl}" />

  <!-- Border -->
  <rect x="0" y="0" width="${size}" height="${size + frameHeight}" fill="none" stroke="${config?.qrColor || '#64748B'}" stroke-width="2" rx="12" />
</svg>
  `.trim();
}

/**
 * Helper function to adjust color brightness
 */
function adjustColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, Math.max(0, (num >> 16) + amount));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
