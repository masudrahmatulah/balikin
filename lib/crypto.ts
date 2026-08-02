import { createHash, randomBytes } from 'crypto';

/**
 * Hash a value using SHA-256
 * Used for securing activation tokens and PINs before database storage
 * @param value - The string to hash
 * @returns Hexadecimal SHA-256 hash
 */
export function hashValue(value: string): string {
  return createHash('sha256')
    .update(value.trim().toUpperCase())
    .digest('hex');
}

/**
 * Generate a random activation token (16 bytes = 32 hex chars)
 * Used for QR activation codes
 * @returns 32-character hexadecimal string (uppercase)
 */
export function generateActivationToken(): string {
  return randomBytes(16).toString('hex').toUpperCase();
}

/**
 * Generate a readable PIN for manual fallback activation
 * Format: XXXX-XXXX (e.g., "A3K7-M9P2")
 * Excludes I and O to avoid confusion with 1 and 0
 * @returns 9-character PIN with dash separator
 */
export function generateActivationPin(): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const part1 = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  const part2 = Array.from({ length: 4 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
  return `${part1}-${part2}`;
}

/**
 * Generate a serial number for physical QC tracking
 * Format: B{batchNum}-{sequence} (e.g., "B01-042")
 * @param batchNumber - The batch identifier (e.g., "B01")
 * @param sequence - The sequence number within batch (padded to 3 digits)
 * @returns Serial number string
 */
export function generateSerialNumber(batchNumber: string, sequence: number): string {
  return `${batchNumber}-${sequence.toString().padStart(3, '0')}`;
}
