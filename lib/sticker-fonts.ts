/**
 * Shared font rendering helper for sticker PNG generation (sharp + libvips native text).
 *
 * Why: Vercel's serverless containers ship with zero installed fonts (no fontconfig cache,
 * no /usr/share/fonts), so any font-family referenced by name only (Arial, system-ui, sans-serif...)
 * resolves to nothing and renders as tofu boxes. Sharp's native `text` input accepts an explicit
 * `fontfile` path, which bypasses fontconfig entirely and works identically in any environment.
 * DejaVu Sans (Bitstream Vera-derived, freely redistributable) is bundled in assets/fonts so it
 * ships with the deployment regardless of what fonts the host machine has.
 */

import path from 'path';
import sharp from 'sharp';

const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');

export const FONT_REGULAR = {
  family: 'DejaVu Sans',
  file: path.join(FONT_DIR, 'DejaVuSans.ttf'),
};

export const FONT_BOLD = {
  family: 'DejaVu Sans Bold',
  file: path.join(FONT_DIR, 'DejaVuSans-Bold.ttf'),
};

export interface RenderedText {
  buffer: Buffer;
  width: number;
  height: number;
}

/**
 * Render a line of text (Pango markup allowed, e.g. `<span foreground="#ff0000">Red</span>`)
 * to a tightly-cropped RGBA PNG buffer using a bundled font file.
 */
export async function renderText(
  markup: string,
  options: { bold?: boolean; size: number; letterSpacing?: number }
): Promise<RenderedText> {
  const font = options.bold ? FONT_BOLD : FONT_REGULAR;
  const text = options.letterSpacing
    ? `<span letter_spacing="${Math.round(options.letterSpacing * 1024)}">${markup}</span>`
    : markup;

  const buffer = await sharp({
    text: {
      text,
      font: `${font.family} ${Math.max(1, Math.round(options.size))}`,
      fontfile: font.file,
      dpi: 72,
      rgba: true,
    },
  })
    .png()
    .toBuffer();

  const meta = await sharp(buffer).metadata();
  return { buffer, width: meta.width || 0, height: meta.height || 0 };
}
