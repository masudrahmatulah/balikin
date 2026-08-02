// Client-side device detection utility
export function useIsMobile(): boolean {
  // Check if window object exists (client-side only)
  if (typeof window === 'undefined') return false;

  // Check viewport width
  return window.innerWidth < 768;
}

export function getCheckoutPath(productKey: string): string {
  if (typeof window === 'undefined') return `/stickers/checkout?product=${productKey}`;

  const isMobile = window.innerWidth < 768;
  const basePath = isMobile ? '/mobile/stickers/checkout' : '/stickers/checkout';
  return `${basePath}?product=${productKey}`;
}
