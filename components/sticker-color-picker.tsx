'use client';

import { Check } from 'lucide-react';
import { STICKER_COLOR_THEMES, type StickerColorTheme } from '@/lib/sticker-color-themes';

interface StickerColorPickerProps {
  value: StickerColorTheme;
  onChange: (value: StickerColorTheme) => void;
  compact?: boolean;
}

export function StickerColorPicker({ value, onChange, compact = false }: StickerColorPickerProps) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Pilih warna sticker</p>
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-5'}`}>
        {(Object.keys(STICKER_COLOR_THEMES) as StickerColorTheme[]).map((colorId) => {
          const color = STICKER_COLOR_THEMES[colorId];
          const selected = value === colorId;

          return (
            <button
              key={colorId}
              type="button"
              onClick={() => onChange(colorId)}
              aria-pressed={selected}
              className={`relative rounded-xl border-2 p-2 text-left transition-all ${
                selected
                  ? 'border-brand-red bg-red-50 shadow-sm shadow-red-100 dark:bg-red-500/10'
                  : 'border-slate-200 hover:border-brand-red/50 dark:border-white/10'
              }`}
            >
              <span
                className="mb-2 block h-7 w-full rounded-md border border-black/10"
                style={{ background: `linear-gradient(135deg, ${color.background} 55%, ${color.accent} 55%)` }}
                aria-hidden="true"
              />
              <span className="block truncate text-xs font-semibold text-slate-900 dark:text-white">{color.label}</span>
              {!compact && <span className="mt-0.5 block truncate text-[10px] text-slate-500 dark:text-slate-400">{color.description}</span>}
              {selected && <Check className="absolute right-2 top-2 h-4 w-4 text-brand-red" aria-hidden="true" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
