/**
 * Sticker Template System
 * Defines shapes, sizes, and layout configurations for PDF generation
 */

export type StickerShape = 'circle' | 'square' | 'rectangle';
export type StickerSize = 'small' | 'medium' | 'large';
export type PaperSize = 'a3' | 'a4' | 'a5';
export type Orientation = 'landscape' | 'portrait';
export type StickerProductKey = 'stiker-pro' | 'stiker-daily' | 'stiker-micro' | 'stiker-family';

export interface StickerTemplate {
  shape: StickerShape;
  size: StickerSize;
}

// Size dimensions in mm (base size)
export const SIZE_DIMENSIONS = {
  small: 30,
  medium: 40,
  large: 50,
} as const;

// Grid layout configurations per shape/size for A3 (default)
export const GRID_CONFIGS_A3 = {
  circle: {
    small: { rows: 4, cols: 5, total: 20 },
    medium: { rows: 3, cols: 4, total: 12 },
    large: { rows: 2, cols: 3, total: 6 },
  },
  square: {
    small: { rows: 4, cols: 5, total: 20 },
    medium: { rows: 3, cols: 4, total: 12 },
    large: { rows: 2, cols: 3, total: 6 },
  },
  rectangle: {
    small: { rows: 4, cols: 4, total: 16 }, // portrait: width = height * 1.2
    medium: { rows: 3, cols: 3, total: 9 },
    large: { rows: 2, cols: 3, total: 6 },
  },
} as const;

// Grid layout configurations per shape/size for A4 (smaller paper, fewer items)
export const GRID_CONFIGS_A4 = {
  circle: {
    small: { rows: 3, cols: 4, total: 12 },
    medium: { rows: 2, cols: 3, total: 6 },
    large: { rows: 2, cols: 2, total: 4 },
  },
  square: {
    small: { rows: 3, cols: 4, total: 12 },
    medium: { rows: 2, cols: 3, total: 6 },
    large: { rows: 2, cols: 2, total: 4 },
  },
  rectangle: {
    small: { rows: 3, cols: 3, total: 9 },
    medium: { rows: 2, cols: 2, total: 4 },
    large: { rows: 1, cols: 2, total: 2 },
  },
} as const;

// "Protected By" card layout margins (shared with lib/vdp-sticker-pro.ts renderProtectedCard):
// card edge -> white QR box -> QR code, each inset by PAD_MM; text column sits GAP_MM after
// the white box and is exactly 2x its width, with RIGHT_MARGIN_MM after it to the card edge.
export const PROTECTED_CARD_PAD_MM = 2;
export const PROTECTED_CARD_GAP_MM = 4;
export const PROTECTED_CARD_RIGHT_MARGIN_MM = 2;

// Total card width for a given height so the text column ends up exactly 2x the white QR box.
export function computeProtectedCardItemWidth(heightMM: number): number {
  const whiteBoxSize = heightMM - PROTECTED_CARD_PAD_MM * 2;
  const textColumnWidth = whiteBoxSize * 2;
  return PROTECTED_CARD_PAD_MM + whiteBoxSize + PROTECTED_CARD_GAP_MM + textColumnWidth + PROTECTED_CARD_RIGHT_MARGIN_MM;
}

// Stiker Balikin Family: 1 Pro + 2 Daily + as many Micro "Protected By" cards as fit
// vertically on one A5 sheet, stacked top to bottom, largest to smallest.
const FAMILY_PRO_HEIGHT_MM = 43;
const FAMILY_DAILY_HEIGHT_MM = 33;
const FAMILY_MICRO_HEIGHT_MM = 23;
const FAMILY_DAILY_COUNT = 2;
const FAMILY_ROW_SPACING_MM = 3; // matches the 3mm row spacing used across all A5 sticker sheets
const A5_PORTRAIT_HEIGHT_MM = 210;

function computeFamilyMicroCount(): number {
  const fixedHeightMM = FAMILY_PRO_HEIGHT_MM + FAMILY_DAILY_COUNT * FAMILY_DAILY_HEIGHT_MM;
  let microCount = 0;
  while (true) {
    const rows = 1 + FAMILY_DAILY_COUNT + microCount + 1;
    const heightMM = fixedHeightMM + (microCount + 1) * FAMILY_MICRO_HEIGHT_MM + FAMILY_ROW_SPACING_MM * (rows - 1);
    if (heightMM > A5_PORTRAIT_HEIGHT_MM) break;
    microCount++;
  }
  return microCount;
}

export const FAMILY_MICRO_COUNT = computeFamilyMicroCount();

// Ordered composition of one Family sheet, top to bottom.
export const FAMILY_ROW_PRODUCTS: readonly Extract<StickerProductKey, 'stiker-pro' | 'stiker-daily' | 'stiker-micro'>[] = [
  'stiker-pro',
  ...Array(FAMILY_DAILY_COUNT).fill('stiker-daily' as const),
  ...Array(FAMILY_MICRO_COUNT).fill('stiker-micro' as const),
];

// Grid layout configurations for A5 (half of A4) - optimized for Balikin sticker products
export const GRID_CONFIGS_A5 = {
  // Stiker Balikin Pro (125mm × 43mm, "Protected By" card layout, QR box 3.9cm, text col 7.8cm) - 4 per sheet
  'stiker-pro': { rows: 4, cols: 1, total: 4, itemWidth: computeProtectedCardItemWidth(43), itemHeight: 43 },
  // Stiker Balikin Daily (95mm × 33mm, "Protected By" card layout, QR box 2.9cm, text col 5.8cm) - 5 per sheet
  'stiker-daily': { rows: 5, cols: 1, total: 5, itemWidth: computeProtectedCardItemWidth(33), itemHeight: 33 },
  // Stiker Balikin Micro (65mm × 23mm, "Protected By" card layout, QR box 1.9cm, text col 3.8cm) - 8 per sheet
  'stiker-micro': { rows: 8, cols: 1, total: 8, itemWidth: computeProtectedCardItemWidth(23), itemHeight: 23 },
  // Stiker Balikin Family: 1 Pro + 2 Daily + FAMILY_MICRO_COUNT Micro "Protected By" cards per sheet
  'stiker-family': {
    rows: FAMILY_ROW_PRODUCTS.length,
    cols: 1,
    total: FAMILY_ROW_PRODUCTS.length,
    itemWidth: computeProtectedCardItemWidth(FAMILY_PRO_HEIGHT_MM),
    itemHeight: FAMILY_PRO_HEIGHT_MM,
    isMixed: true,
  },
} as const;

// Legacy GRID_CONFIGS (deprecated, use GRID_CONFIGS_A3 or GRID_CONFIGS_A4)
export const GRID_CONFIGS = GRID_CONFIGS_A3;

// Paper dimensions in mm [width, height]
export const PAPER_DIMENSIONS = {
  a3: { landscape: [420, 297], portrait: [297, 420] },
  a4: { landscape: [297, 210], portrait: [210, 297] },
  a5: { landscape: [210, 148], portrait: [148, 210] },
} as const;

// Legacy constants (deprecated, use PAPER_DIMENSIONS instead)
export const A3_WIDTH = 420;
export const A3_HEIGHT = 297;

// Bleed and spacing
export const BLEED = 2;
export const SPACING = 3;
export const HEADER_HEIGHT = 25;

/**
 * Get dimensions for a sticker based on shape and size
 */
export function getStickerDimensions(shape: StickerShape, size: StickerSize) {
  const baseSize = SIZE_DIMENSIONS[size];

  if (shape === 'rectangle') {
    // Rectangle is portrait orientation (taller than wide)
    return {
      width: baseSize * 0.85, // 85% of base width
      height: baseSize, // full base height
      bleed: BLEED,
      printableWidth: (baseSize * 0.85) + (BLEED * 2),
      printableHeight: baseSize + (BLEED * 2),
    };
  }

  // Circle and square are same width/height
  return {
    width: baseSize,
    height: baseSize,
    bleed: BLEED,
    printableWidth: baseSize + (BLEED * 2),
    printableHeight: baseSize + (BLEED * 2),
  };
}

/**
 * Get paper dimensions for a given size and orientation
 */
export function getPaperDimensions(paperSize: PaperSize, orientation: Orientation): [number, number] {
  const dims = PAPER_DIMENSIONS[paperSize][orientation];
  return [dims[0], dims[1]] as [number, number];
}

/**
 * Calculate grid positions for stickers on a page
 * @param shape - Sticker shape
 * @param size - Sticker size
 * @param paperSize - Paper size (default: 'a3')
 * @param orientation - Page orientation (default: 'landscape')
 */
export function calculateGridPositions(
  shape: StickerShape,
  size: StickerSize,
  paperSize: PaperSize = 'a3',
  orientation: Orientation = 'landscape'
): [number, number][] {
  // Select appropriate grid config based on paper size
  const gridConfigs = paperSize === 'a4' ? GRID_CONFIGS_A4 : GRID_CONFIGS_A3;
  const config = gridConfigs[shape][size];
  const dimensions = getStickerDimensions(shape, size);

  const positions: [number, number][] = [];

  // Get paper dimensions
  const [paperWidth, paperHeight] = getPaperDimensions(paperSize, orientation);

  // Calculate margins to center the grid
  const totalGridWidth = config.cols * dimensions.printableWidth + (config.cols - 1) * SPACING;
  const totalGridHeight = config.rows * dimensions.printableHeight + (config.rows - 1) * SPACING;

  const startX = (paperWidth - totalGridWidth) / 2;
  const startY = HEADER_HEIGHT + 20 + ((paperHeight - HEADER_HEIGHT - 20 - totalGridHeight) / 2);

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      const x = startX + col * (dimensions.printableWidth + SPACING);
      const y = startY + row * (dimensions.printableHeight + SPACING);
      positions.push([x, y]);
    }
  }

  return positions;
}

/**
 * Get A5 sticker product configuration
 */
export function getStickerProductConfig(productKey: StickerProductKey) {
  return GRID_CONFIGS_A5[productKey];
}

/**
 * Get sticker product display info
 */
export function getStickerProductInfo(productKey: StickerProductKey) {
  const info = {
    'stiker-pro': { name: 'Stiker Balikin Pro', size: '125×43mm', perSheet: '4' },
    'stiker-daily': { name: 'Stiker Balikin Daily', size: '95×33mm', perSheet: '5' },
    'stiker-micro': { name: 'Stiker Balikin Micro', size: '65×23mm', perSheet: '8' },
    'stiker-family': { name: 'Stiker Balikin Family', size: `Mixed (1 Pro + ${FAMILY_DAILY_COUNT} Daily + ${FAMILY_MICRO_COUNT} Micro)`, perSheet: String(FAMILY_ROW_PRODUCTS.length) },
  };
  return info[productKey];
}

/**
 * Calculate A5 sticker grid positions for a specific product
 */
export function calculateA5StickerPositions(
  productKey: StickerProductKey,
  orientation: Orientation = 'portrait'
): [number, number][] {
  const config = getStickerProductConfig(productKey);
  const [paperWidth, paperHeight] = getPaperDimensions('a5', orientation);

  const positions: [number, number][] = [];
  const itemWidth = config.itemWidth + SPACING;
  const itemHeight = config.itemHeight + SPACING;

  // Calculate margins to center the grid
  const totalGridWidth = config.cols * itemWidth - SPACING;
  const totalGridHeight = config.rows * itemHeight - SPACING;

  const startX = (paperWidth - totalGridWidth) / 2;
  const startY = HEADER_HEIGHT + ((paperHeight - HEADER_HEIGHT - totalGridHeight) / 2);

  for (let row = 0; row < config.rows; row++) {
    for (let col = 0; col < config.cols; col++) {
      if (productKey === 'stiker-family') {
        // For family pack, arrange: 3 large + 4 medium + 5 small
        // Rows 0: 3 large (35mm)
        // Rows 1: 4 medium (25mm)
        // Rows 2-3: 5 small (18mm) spread across
        let itemH = config.itemHeight;
        if (row === 0) itemH = 35; // Large items
        else if (row === 1) itemH = 25; // Medium items
        else itemH = 18; // Small items

        const x = startX + col * (config.itemWidth + SPACING);
        const y = startY + row * (itemH + SPACING);
        positions.push([x, y]);
      } else {
        const x = startX + col * itemWidth;
        const y = startY + row * itemHeight;
        positions.push([x, y]);
      }
    }
  }

  return positions;
}

/**
 * Get display label for shape
 */
export function getShapeLabel(shape: StickerShape): string {
  const labels: Record<StickerShape, string> = {
    circle: 'Bulat',
    square: 'Segi Empat',
    rectangle: 'Persegi Panjang',
  };
  return labels[shape];
}

/**
 * Get display label for size
 */
export function getSizeLabel(size: StickerSize): string {
  const labels: Record<StickerSize, string> = {
    small: 'Kecil (30mm)',
    medium: 'Sedang (40mm)',
    large: 'Besar (50mm)',
  };
  return labels[size];
}
