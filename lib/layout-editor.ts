/**
 * Visual Layout Editor for Sticker QR
 * Types and utilities for drag-and-drop sticker layout editor
 */

import type { StickerShape, StickerSize } from './sticker-template';

export type PaperSize = 'a3' | 'a4';
export type Orientation = 'landscape' | 'portrait';

export interface StickerItem {
  id: string;
  tagId: string;
  x: number;        // position in mm
  y: number;        // position in mm
  rotation: number; // degrees (0-360)
  shape: StickerShape;
  size: StickerSize;
  customText?: string;
}

export interface LayoutConfig {
  paperSize: PaperSize;
  orientation: Orientation;
  items: StickerItem[];
}

export interface LayoutTemplate extends LayoutConfig {
  id: string;
  name: string;
  description?: string;
}

// Paper dimensions in mm [width, height]
export const PAPER_DIMENSIONS = {
  a3: { landscape: [420, 297], portrait: [297, 420] },
  a4: { landscape: [297, 210], portrait: [210, 297] },
} as const;

// Scale factor for converting mm to px (at 96 DPI)
export const MM_TO_PX = 3.78;

// Safe margins in mm
export const MARGIN = 10;

/**
 * Get paper dimensions for a given size and orientation
 */
export function getPaperDimensions(paperSize: PaperSize, orientation: Orientation): [number, number] {
  const dims = PAPER_DIMENSIONS[paperSize][orientation];
  return [dims[0], dims[1]] as [number, number];
}

/**
 * Convert mm to px
 */
export function mmToPx(mm: number): number {
  return mm * MM_TO_PX;
}

/**
 * Convert px to mm
 */
export function pxToMm(px: number): number {
  return px / MM_TO_PX;
}

/**
 * Get canvas scale factor to fit paper in viewport
 */
export function getCanvasScale(paperWidthMm: number, containerWidth: number): number {
  const paperWidthPx = mmToPx(paperWidthMm);
  return Math.min(1, containerWidth / paperWidthPx);
}

/**
 * Check if a position is within paper bounds
 */
export function isWithinBounds(
  x: number,
  y: number,
  paperSize: PaperSize,
  orientation: Orientation,
  itemSize: { width: number; height: number }
): boolean {
  const [paperWidth, paperHeight] = getPaperDimensions(paperSize, orientation);
  return (
    x >= MARGIN &&
    y >= MARGIN &&
    x + itemSize.width <= paperWidth - MARGIN &&
    y + itemSize.height <= paperHeight - MARGIN
  );
}

/**
 * Snap position to grid (in mm)
 */
export function snapToGrid(value: number, gridSize = 1): number {
  return Math.round(value / gridSize) * gridSize;
}

/**
 * Get sticker item bounds for collision detection
 */
export function getItemBounds(item: StickerItem, getItemSize: (shape: StickerShape, size: StickerSize) => { width: number; height: number }) {
  const size = getItemSize(item.shape, item.size);
  return {
    x: item.x,
    y: item.y,
    width: size.width,
    height: size.height,
    right: item.x + size.width,
    bottom: item.y + size.height,
  };
}

/**
 * Check if two items overlap
 */
export function itemsOverlap(
  item1: StickerItem,
  item2: StickerItem,
  getItemSize: (shape: StickerShape, size: StickerSize) => { width: number; height: number }
): boolean {
  const bounds1 = getItemBounds(item1, getItemSize);
  const bounds2 = getItemBounds(item2, getItemSize);

  return !(
    bounds1.right <= bounds2.x ||
    bounds1.x >= bounds2.right ||
    bounds1.bottom <= bounds2.y ||
    bounds1.y >= bounds2.bottom
  );
}
