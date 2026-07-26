/**
 * Premium QR Code Generator for Acrylic/Premium Tier
 * Uses qr-code-styling library for custom QR patterns and shapes
 */

import QRCodeStyling from 'qr-code-styling';
import { BundleType, getBundleConfig } from './bundles';

/**
 * Premium color schemes for different product types
 */
const PREMIUM_COLOR_SCHEMES = {
  gold_luxury: {
    name: 'Gold Luxury',
    dots: '#D4AF37',
    background: '#FFF8DC',
    cornerSquare: '#B8860B',
    cornerDot: '#D4AF37',
  },
  midnight_blue: {
    name: 'Midnight Blue',
    dots: '#0F172A',
    background: '#F8FAFC',
    cornerSquare: '#94A3B8',
    cornerDot: '#0F172A',
  },
  royal_purple: {
    name: 'Royal Purple',
    dots: '#6B21A8',
    background: '#FAF5FF',
    cornerSquare: '#A855F7',
    cornerDot: '#6B21A8',
  },
  carbon_black: {
    name: 'Carbon Black',
    dots: '#1F2937',
    background: '#FFFFFF',
    cornerSquare: '#F59E0B',
    cornerDot: '#1F2937',
  },
  standard_premium: {
    name: 'Standard Premium',
    dots: '#1E293B',
    background: '#FFFFFF',
    cornerSquare: '#475569',
    cornerDot: '#1E293B',
  },
} as const;

/**
 * Get premium color scheme for a bundle type
 */
function getPremiumColorScheme(bundleType: BundleType) {
  const config = getBundleConfig(bundleType);

  if (!config) {
    return PREMIUM_COLOR_SCHEMES.standard_premium;
  }

  // Map bundle colors to premium schemes
  const colorMap: Record<string, keyof typeof PREMIUM_COLOR_SCHEMES> = {
    '#D4AF37': 'gold_luxury',
    '#0F172A': 'midnight_blue',
    '#6B21A8': 'royal_purple',
    '#1F2937': 'carbon_black',
    '#3B82F6': 'midnight_blue',
    '#EF4444': 'carbon_black',
    '#22C55E': 'standard_premium',
    '#A855F7': 'royal_purple',
    '#64748B': 'standard_premium',
  };

  return PREMIUM_COLOR_SCHEMES[colorMap[config.qrColor] || 'standard_premium'];
}

/**
 * Generate premium QR code data URL (server-side compatible)
 * Note: qr-code-styling requires DOM, so we use a simpler approach for server-side
 */
export async function generatePremiumQRDataURL(
  data: string,
  bundleType: BundleType,
  size: number = 600
): Promise<string> {
  // For server-side, we'll use the standard qrcode library with premium colors
  // This is a fallback that maintains premium appearance without DOM dependency
  const QRCode = (await import('qrcode')).default;
  const colorScheme = getPremiumColorScheme(bundleType);

  return QRCode.toDataURL(data, {
    width: size,
    margin: 4,
    color: {
      dark: colorScheme.dots,
      light: colorScheme.background,
    },
    errorCorrectionLevel: 'H', // High for better scannability
  });
}

/**
 * Generate premium QR code using qr-code-styling (client-side only)
 * This creates fully styled QR with custom finder patterns and dot modules
 */
export function generateStyledQRCode(
  data: string,
  bundleType: BundleType,
  options?: {
    size?: number;
    margin?: number;
  }
): QRCodeStyling {
  const colorScheme = getPremiumColorScheme(bundleType);
  const size = options?.size || 600;
  const margin = options?.margin || 4;

  return new QRCodeStyling({
    width: size,
    height: size,
    type: 'png',
    data,
    margin,
    qrOptions: {
      errorCorrectionLevel: 'H', // High for custom patterns
    },
    dotsOptions: {
      color: colorScheme.dots,
      type: 'dots', // Round dots instead of squares - gives premium look
    },
    backgroundOptions: {
      color: colorScheme.background,
    },
    cornersSquareOptions: {
      color: colorScheme.cornerSquare,
      type: 'extra-rounded', // Custom finder pattern shape
    },
    cornersDotOptions: {
      color: colorScheme.cornerDot,
      type: 'dot', // Dot in center of finder pattern
    },
    image: undefined, // Logo can be added here if needed
    imageOptions: {
      margin: 0,
      imageSize: 0.4,
    },
  });
}

/**
 * Get premium QR colors for a bundle type (for UI display)
 */
export function getPremiumQRColors(bundleType: BundleType) {
  return getPremiumColorScheme(bundleType);
}

/**
 * Check if a QR should use premium styling
 */
export function shouldUsePremiumQR(tier: string, materialType: string): boolean {
  return tier === 'premium' || materialType === 'acrylic' || materialType?.startsWith('acrylic-');
}