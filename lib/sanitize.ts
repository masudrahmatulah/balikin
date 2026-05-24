export function sanitizeUserInput(input: string): string {
  if (!input) return '';

  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .trim();
}

export function sanitizeText(input: string): string {
  if (!input) return '';

  // For text content, only remove HTML tags but preserve basic formatting
  return input
    .replace(/<script[^>]*>.*?<\/script>/gis, '')
    .replace(/<iframe[^>]*>.*?<\/iframe>/gis, '')
    .replace(/<object[^>]*>.*?<\/object>/gis, '')
    .replace(/<embed[^>]*>/gis, '')
    .replace(/<[^>]+>/g, '')
    .trim();
}

export function truncateText(input: string, maxLength: number): string {
  if (!input) return '';
  if (input.length <= maxLength) return input;
  return input.substring(0, maxLength).trim() + '...';
}