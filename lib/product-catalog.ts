export const PRODUCT_CATALOG = {
  'armor-tag':       { name: 'Balikin Armor Tag',     price: 54000,  packSize: 1,   productType: 'acrylic' },
  'stiker-pro':      { name: 'Stiker Balikin Pro',    price: 59000,  packSize: 8,   productType: 'sticker' },
  'stiker-daily':    { name: 'Stiker Balikin Daily',  price: 59000,  packSize: 15,  productType: 'sticker' },
  'stiker-micro':    { name: 'Stiker Balikin Micro',  price: 59000,  packSize: 24,  productType: 'sticker' },
  'stiker-family':   { name: 'Stiker Balikin Family', price: 59000,  packSize: 12,  productType: 'sticker' },
  'ultimate-pack':   { name: 'Balikin Ultimate Pack', price: 89000,  packSize: 13,  productType: 'bundle'  },
  'paket-keluarga':  { name: 'Paket Keluarga',        price: 299000, packSize: 52,  productType: 'bundle'  },
  'paket-traveller': { name: 'Paket Traveller (B2B)', price: 699000, packSize: 130, productType: 'bundle'  },
} as const;

export type ProductKey = keyof typeof PRODUCT_CATALOG;
export const DEFAULT_PRODUCT_KEY: ProductKey = 'stiker-family';

export function resolveProductKey(raw: string | null | undefined): ProductKey {
  if (raw && raw in PRODUCT_CATALOG) return raw as ProductKey;
  return DEFAULT_PRODUCT_KEY;
}
