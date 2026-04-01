/**
 * Sticker Template System
 * Defines shapes, sizes, and layout configurations for PDF generation
 */

export type StickerShape = 'circle' | 'square' | 'rectangle';
export type StickerSize = 'small' | 'medium' | 'large';

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

// Grid layout configurations per shape/size
export const GRID_CONFIGS = {
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

// A3 landscape dimensions
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
 * Calculate grid positions for stickers on A3 page
 */
export function calculateGridPositions(shape: StickerShape, size: StickerSize): [number, number][] {
  const config = GRID_CONFIGS[shape][size];
  const dimensions = getStickerDimensions(shape, size);

  const positions: [number, number][] = [];

  // Calculate margins to center the grid
  const totalGridWidth = config.cols * dimensions.printableWidth + (config.cols - 1) * SPACING;
  const totalGridHeight = config.rows * dimensions.printableHeight + (config.rows - 1) * SPACING;

  const startX = (A3_WIDTH - totalGridWidth) / 2;
  const startY = HEADER_HEIGHT + 20 + ((A3_HEIGHT - HEADER_HEIGHT - 20 - totalGridHeight) / 2);

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
