/**
 * Sticker Template System
 * Defines shapes, sizes, and layout configurations for PDF generation
 */

export type StickerShape = 'circle' | 'square' | 'rectangle';
export type StickerSize = 'small' | 'medium' | 'large';
export type PaperSize = 'a3' | 'a4';
export type Orientation = 'landscape' | 'portrait';

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

// Legacy GRID_CONFIGS (deprecated, use GRID_CONFIGS_A3 or GRID_CONFIGS_A4)
export const GRID_CONFIGS = GRID_CONFIGS_A3;

// Paper dimensions in mm [width, height]
export const PAPER_DIMENSIONS = {
  a3: { landscape: [420, 297], portrait: [297, 420] },
  a4: { landscape: [297, 210], portrait: [210, 297] },
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
