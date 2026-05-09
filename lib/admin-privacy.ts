/**
 * Privacy Masking System for Admin Dashboard
 * Protects sensitive user data while allowing authorized access
 */

import { Division, hasPermission } from './admin-divisions';

/**
 * Mask phone number to show only last 4 digits
 * @param phone - Full phone number
 * @returns Masked phone number (e.g., "•••• •••• 1234")
 */
export function maskPhone(phone: string | null | undefined): string {
  if (!phone) return 'N/A';

  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length < 4) return phone;

  const last4 = cleaned.slice(-4);
  const maskedLength = cleaned.length - 4;

  // Format with spaces for readability
  if (cleaned.length <= 8) {
    return `•••• ${last4}`;
  } else if (cleaned.length <= 12) {
    return `•••• •••• ${last4}`;
  } else {
    return `•••• •••• •••• ${last4}`;
  }
}

/**
 * Mask email address
 * Shows first 2 characters and domain
 * @param email - Email address
 * @returns Masked email (e.g., "ab***@example.com")
 */
export function maskEmail(email: string | null | undefined): string {
  if (!email) return 'N/A';

  const [local, domain] = email.split('@');
  if (!local || !domain) return email;

  if (local.length <= 2) {
    return `${local}@${domain}`;
  }

  const maskedLocal = local.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask full name
 * Shows first name and last initial
 * @param name - Full name
 * @returns Masked name (e.g., "John D.")
 */
export function maskName(name: string | null | undefined): string {
  if (!name) return 'N/A';

  const parts = name.trim().split(/\s+/);
  if (parts.length === 0) return 'N/A';
  if (parts.length === 1) return parts[0];

  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1]?.charAt(0).toUpperCase();

  return `${firstName} ${lastInitial}.`;
}

/**
 * Check if user can unmask sensitive data
 * @param userDivision - User's division
 * @returns true if user can unmask data
 */
export function canUnmaskData(userDivision: string | null | undefined): boolean {
  if (!userDivision) return false;

  // CS division and Admin can unmask data
  return userDivision === Division.CUSTOMER_SERVICE || userDivision === Division.ADMIN;
}

/**
 * Check if user can access full phone number
 * @param userDivision - User's division
 * @returns true if user can see full phone number
 */
export function canViewPhone(userDivision: string | null | undefined): boolean {
  return canUnmaskData(userDivision);
}

/**
 * Check if user can access full email
 * @param userDivision - User's division
 * @returns true if user can see full email
 */
export function canViewEmail(userDivision: string | null | undefined): boolean {
  return canUnmaskData(userDivision);
}

/**
 * Format phone number for display based on user permissions
 * @param phone - Full phone number
 * @param userDivision - User's division
 * @returns Formatted phone number (masked or full)
 */
export function formatPhoneForUser(
  phone: string | null | undefined,
  userDivision: string | null | undefined
): string {
  if (!phone) return 'N/A';

  if (canViewPhone(userDivision)) {
    return phone;
  }

  return maskPhone(phone);
}

/**
 * Format email for display based on user permissions
 * @param email - Email address
 * @param userDivision - User's division
 * @returns Formatted email (masked or full)
 */
export function formatEmailForUser(
  email: string | null | undefined,
  userDivision: string | null | undefined
): string {
  if (!email) return 'N/A';

  if (canViewEmail(userDivision)) {
    return email;
  }

  return maskEmail(email);
}

/**
 * Get privacy mask info for UI display
 * Returns information about what data is masked and why
 */
export function getPrivacyMaskInfo(userDivision: string | null | undefined) {
  return {
    isMasked: !canUnmaskData(userDivision),
    canUnmask: canUnmaskData(userDivision),
    division: userDivision,
    message: !canUnmaskData(userDivision)
      ? 'Sensitive data is masked. Contact administrator for full access.'
      : 'You have full access to sensitive data.',
  };
}

/**
 * Audit log entry for privacy access
 * Call this when a user unmasks or accesses sensitive data
 */
export interface PrivacyAccessLog {
  userId: string;
  division: string;
  action: 'unmask_phone' | 'unmask_email' | 'view_full_data';
  targetId: string; // ID of the user whose data was accessed
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Create a privacy access log entry
 * This should be called whenever sensitive data is unmasked
 */
export function createPrivacyAccessLog(
  userId: string,
  division: string,
  action: PrivacyAccessLog['action'],
  targetId: string,
  ipAddress?: string,
  userAgent?: string
): PrivacyAccessLog {
  return {
    userId,
    division,
    action,
    targetId,
    timestamp: new Date(),
    ipAddress,
    userAgent,
  };
}

/**
 * Validate if a privacy action is allowed
 * @param userDivision - User's division
 * @param action - Privacy action to perform
 * @returns true if action is allowed
 */
export function canPerformPrivacyAction(
  userDivision: string | null | undefined,
  action: 'unmask_phone' | 'unmask_email' | 'view_full_data'
): boolean {
  return canUnmaskData(userDivision);
}

/**
 * Privacy-consent check for WhatsApp integration
 * CS division can initiate WhatsApp conversations but should log the action
 */
export function canInitiateWhatsApp(userDivision: string | null | undefined): boolean {
  return userDivision === Division.CUSTOMER_SERVICE || userDivision === Division.ADMIN;
}

/**
 * Format WhatsApp link with privacy protection
 * Returns a wa.me link if user has permission, null otherwise
 */
export function formatWhatsAppLink(
  phone: string | null | undefined,
  userDivision: string | null | undefined
): string | null {
  if (!phone || !canInitiateWhatsApp(userDivision)) {
    return null;
  }

  // Clean phone number and create WhatsApp link
  const cleaned = phone.replace(/\D/g, '');
  return `https://wa.me/${cleaned}`;
}
