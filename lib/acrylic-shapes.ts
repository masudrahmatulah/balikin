/**
 * Physical dimensions & die-cut mask definitions for each Akrilik wadah shape
 * used by the VDP tool. These drive both the print canvas size (mm) and the
 * safe QR/logo placement so nothing gets clipped by the shape's cutting line.
 */

export type AcrylicShapeKey =
  | "oval"
  | "octagon"
  | "heart"
  | "rectangle"
  | "rectangle-motif"
  | "square"
  | "circle"
  | "rectangle-emboss";

export type ShapeMaskType = "ellipse" | "circle" | "octagon" | "heart" | "rect";

export interface AcrylicShapeConfig {
  key: AcrylicShapeKey;
  label: string;
  widthMm: number;
  heightMm: number;
  maskType: ShapeMaskType;
  qrSizeMm: number;
  qrTopMarginMm: number;
  // Optional override for the logo cell (kolom 2), which doesn't need the
  // safety margin QR/text cells reserve and can sit closer to the cut line.
  // Falls back to a qrSizeMm x qrSizeMm square when unset.
  logoWidthMm?: number;
  logoHeightMm?: number;
}

// 300 DPI print resolution (matches existing VDP engine convention)
export const PX_PER_MM = 300 / 25.4;
export const mmToPx = (mm: number): number => Math.round(mm * PX_PER_MM);

/**
 * qrSizeMm / qrTopMarginMm are tuned per shape so the QR/logo always sits
 * inside the safe zone of the die-cut outline: non-rectangular shapes
 * (ellipse, heart, octagon, circle) get extra side/top margin so corners are
 * never clipped by the curved edge, while plain rectangles only need a small
 * cutting-safety margin. Remaining height below the QR is reserved for text.
 */
export const ACRYLIC_SHAPES: Record<AcrylicShapeKey, AcrylicShapeConfig> = {
  oval: {
    key: "oval",
    label: "Akrilik OVAL",
    widthMm: 30,
    heightMm: 37,
    maskType: "rect",
    qrSizeMm: 27,
    qrTopMarginMm: 3,
    logoWidthMm: 26,
    logoHeightMm: 33,
  },
  octagon: {
    key: "octagon",
    label: "Akrilik Persegi Delapan",
    widthMm: 30,
    heightMm: 47,
    maskType: "octagon",
    qrSizeMm: 24,
    qrTopMarginMm: 3,
  },
  heart: {
    key: "heart",
    label: "Akrilik Hati",
    widthMm: 42,
    heightMm: 40,
    maskType: "heart",
    qrSizeMm: 23,
    qrTopMarginMm: 8,
  },
  rectangle: {
    key: "rectangle",
    label: "Akrilik Persegi Panjang",
    widthMm: 28,
    heightMm: 47,
    maskType: "rect",
    qrSizeMm: 24,
    qrTopMarginMm: 3,
  },
  "rectangle-motif": {
    key: "rectangle-motif",
    label: "Akrilik Persegi Panjang Motif",
    widthMm: 29,
    heightMm: 40,
    maskType: "rect",
    qrSizeMm: 24,
    qrTopMarginMm: 3,
  },
  square: {
    key: "square",
    label: "Akrilik Kotak",
    widthMm: 30,
    heightMm: 30,
    maskType: "rect",
    qrSizeMm: 21,
    qrTopMarginMm: 2,
  },
  circle: {
    key: "circle",
    label: "Akrilik Lingkaran",
    widthMm: 35,
    heightMm: 35,
    maskType: "circle",
    qrSizeMm: 22,
    qrTopMarginMm: 4,
  },
  "rectangle-emboss": {
    key: "rectangle-emboss",
    label: "Akrilik Persegi Panjang Timbul",
    widthMm: 32,
    heightMm: 45,
    maskType: "rect",
    qrSizeMm: 26,
    qrTopMarginMm: 3,
  },
};

// Fallback used when a batch predates shape-specific material types (old
// generic "acrylic" rows, or callers that don't know the material type).
export const LEGACY_SHAPE: AcrylicShapeConfig = {
  key: "rectangle-emboss",
  label: "Akrilik (Legacy)",
  widthMm: 30,
  heightMm: 45,
  maskType: "rect",
  qrSizeMm: 24,
  qrTopMarginMm: 9,
};

export function deriveAcrylicShapeKey(materialType?: string | null): AcrylicShapeKey | null {
  if (!materialType || !materialType.startsWith("acrylic-")) return null;
  const key = materialType.slice("acrylic-".length) as AcrylicShapeKey;
  return key in ACRYLIC_SHAPES ? key : null;
}

export function getAcrylicShapeConfig(shapeKey?: AcrylicShapeKey | null): AcrylicShapeConfig {
  if (shapeKey && ACRYLIC_SHAPES[shapeKey]) return ACRYLIC_SHAPES[shapeKey];
  return LEGACY_SHAPE;
}

/**
 * Returns an unclosed SVG shape element (geometry only, no fill/stroke) for
 * the given mask type at the given pixel size. Reused both inside a
 * <clipPath> (so QR/logo/text can never bleed past the cut line) and as the
 * visible cutting-mark stroke — callers append fill/stroke attrs and `/>`.
 */
export function getShapeMarkup(maskType: ShapeMaskType, widthPx: number, heightPx: number): string {
  switch (maskType) {
    case "circle": {
      const r = Math.min(widthPx, heightPx) / 2;
      return `<circle cx="${widthPx / 2}" cy="${heightPx / 2}" r="${r}"`;
    }
    case "ellipse":
      return `<ellipse cx="${widthPx / 2}" cy="${heightPx / 2}" rx="${widthPx / 2}" ry="${heightPx / 2}"`;
    case "octagon": {
      const cut = Math.min(widthPx, heightPx) * 0.28;
      const w = widthPx;
      const h = heightPx;
      return `<path d="M ${cut} 0 L ${w - cut} 0 L ${w} ${cut} L ${w} ${h - cut} L ${w - cut} ${h} L ${cut} ${h} L 0 ${h - cut} L 0 ${cut} Z"`;
    }
    case "heart": {
      // Heart drawn in a 100x95 unit box, scaled to fit widthPx x heightPx
      const sx = widthPx / 100;
      const sy = heightPx / 95;
      return `<path transform="scale(${sx} ${sy})" d="M50,15 C35,-5 0,10 0,37 C0,60 25,77 50,95 C75,77 100,60 100,37 C100,10 65,-5 50,15 Z"`;
    }
    case "rect":
    default: {
      const rx = Math.min(widthPx, heightPx) * 0.06;
      return `<rect x="0" y="0" width="${widthPx}" height="${heightPx}" rx="${rx}"`;
    }
  }
}
