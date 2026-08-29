export const STICKER_COLOR_THEMES = {
  'navy-premium': {
    label: 'Navy Premium',
    description: 'Elegan dan terpercaya',
    background: '#0F2747',
    accent: '#F59E0B',
    textMuted: '#DCE7F5',
  },
  'forest-natural': {
    label: 'Forest Natural',
    description: 'Natural dan hangat',
    background: '#12372A',
    accent: '#E8B923',
    textMuted: '#F4F7F2',
  },
  'black-tech': {
    label: 'Black Tech',
    description: 'Modern dan kontras',
    background: '#111827',
    accent: '#06B6D4',
    textMuted: '#F9FAFB',
  },
  'blue-trust': {
    label: 'Blue Trust',
    description: 'Ramah dan profesional',
    background: '#172554',
    accent: '#38BDF8',
    textMuted: '#FFFFFF',
  },
  'burgundy-elegant': {
    label: 'Burgundy Elegant',
    description: 'Mewah dan berkarakter',
    background: '#3B1725',
    accent: '#F97316',
    textMuted: '#FFF7ED',
  },
} as const;

export type StickerColorTheme = keyof typeof STICKER_COLOR_THEMES;

export const DEFAULT_STICKER_COLOR_THEME: StickerColorTheme = 'navy-premium';

export function normalizeStickerColorTheme(theme?: string): StickerColorTheme {
  if (theme && theme in STICKER_COLOR_THEMES) {
    return theme as StickerColorTheme;
  }

  return DEFAULT_STICKER_COLOR_THEME;
}
