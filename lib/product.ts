export type ProductType = 'free' | 'sticker' | 'acrylic';

type ProductTagLike = {
  productType?: string | null;
  tier?: string | null;
};

export function getTagProductType(tag: ProductTagLike): ProductType {
  if (tag.productType === 'sticker' || tag.productType === 'acrylic') {
    return tag.productType;
  }

  if (tag.tier === 'premium') {
    return 'acrylic';
  }

  return 'free';
}

export function isFreeProduct(tag: ProductTagLike): boolean {
  return getTagProductType(tag) === 'free';
}

export function isStickerProduct(tag: ProductTagLike): boolean {
  return getTagProductType(tag) === 'sticker';
}

export function isAcrylicProduct(tag: ProductTagLike): boolean {
  return getTagProductType(tag) === 'acrylic';
}

export function isPremiumPhysicalProduct(tag: ProductTagLike): boolean {
  const type = getTagProductType(tag);
  return type === 'sticker' || type === 'acrylic';
}

export function getTagProductLabel(tag: ProductTagLike): string {
  const type = getTagProductType(tag);
  if (type === 'sticker') {
    return 'Sticker Vinyl';
  }
  if (type === 'acrylic') {
    return 'Acrylic Premium';
  }
  return 'Digital Tag Free';
}
