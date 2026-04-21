/**
 * vCard Generator Utility
 * Generates .vcf (vCard) files for contact information export
 */

export interface VCardData {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  githubUrl?: string;
  bio?: string;
}

/**
 * Generate vCard 3.0 format string
 * @param data - Contact information
 * @returns string - vCard formatted string
 */
export function generateVCardString(data: VCardData): string {
  const lines: string[] = [];

  // vCard header
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');

  // Name (Required)
  lines.push(`FN:${data.fullName}`);

  // Title (Optional)
  if (data.title) {
    lines.push(`TITLE:${data.title}`);
  }

  // Email (Optional)
  if (data.email) {
    lines.push(`EMAIL;TYPE=WORK:${data.email}`);
  }

  // Phone (Optional)
  if (data.phone) {
    lines.push(`TEL;TYPE=CELL:${data.phone}`);
  }

  // URLs (Optional)
  if (data.linkedinUrl) {
    lines.push(`URL;TYPE=LinkedIn:${data.linkedinUrl}`);
  }

  if (data.portfolioUrl) {
    lines.push(`URL;TYPE=Portfolio:${data.portfolioUrl}`);
  }

  if (data.githubUrl) {
    lines.push(`URL;TYPE=GitHub:${data.githubUrl}`);
  }

  // Note/Bio (Optional)
  if (data.bio) {
    // vCard NOTE field has length limits, truncate if needed
    const truncatedBio = data.bio.length > 200 ? data.bio.substring(0, 197) + '...' : data.bio;
    lines.push(`NOTE:${truncatedBio.replace(/\n/g, '\\n')}`);
  }

  // vCard footer
  lines.push('END:VCARD');

  return lines.join('\n');
}

/**
 * Generate vCard as downloadable blob
 * @param data - Contact information
 * @returns Blob - vCard file blob
 */
export function generateVCardBlob(data: VCardData): Blob {
  const vcardString = generateVCardString(data);
  return new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
}

/**
 * Generate filename for vCard download
 * @param fullName - Contact's full name
 * @returns string - Safe filename (e.g., "john_doe.vcf")
 */
export function generateVCardFilename(fullName: string): string {
  // Remove special characters and replace spaces with underscores
  const safeName = fullName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50); // Limit length

  return `${safeName}.vcf`;
}
