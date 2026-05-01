import type { ModuleType } from './admin-modules';

/**
 * Copywriting templates for module spotlight on dashboard
 * Compact, non-intrusive format
 */
export interface SpotlightCopy {
  emoji: string;
  headline: string;
  description: string;
}

/**
 * Full copywriting for module page (PAS Framework)
 */
export interface ModuleCopy {
  emoji: string;
  headline: string; // Problem
  subheadline: string; // Agitation + Solution
  benefits: string[];
  price?: string;
}

/**
 * Spotlight copy untuk dashboard - compact format
 */
export const SPOTLIGHT_COPIES: Record<ModuleType, SpotlightCopy> = {
  student: {
    emoji: '✨',
    headline: 'Fitur Baru: Student Kit',
    description: 'Kelola jadwal kuliah & deadline dalam 1 tempat',
  },
  otomotif: {
    emoji: '🚗',
    headline: 'Jangan Sampai Telat STNK',
    description: 'Pantau jatuh tempo & servis dalam 1 tempat',
  },
  pertanian: {
    emoji: '🌾',
    headline: 'Panen Lebih Banyak',
    description: 'Kalkulator HST & jadwal pupuk otomatis',
  },
  diklat: {
    emoji: '👥',
    headline: 'Event Lebih Profesional',
    description: 'Manage peserta, sertifikat & materi dalam 1 tempat',
  },
};

/**
 * Full copywriting untuk halaman modul - PAS Framework
 */
export const MODULE_COPIES: Record<ModuleType, ModuleCopy> = {
  student: {
    emoji: '📚',
    headline: 'MASIH CATAT JADWAL DI BANYAK TEMPAT?',
    subheadline: 'Hemat 3 jam/minggu dengan Student Kit. Satu tempat untuk jadwal, deadline & notifikasi WhatsApp otomatis.',
    benefits: [
      'Lupa deadline? WA-nya yang ingatkan',
      'KTM/KRS hilang? Ada backup digital selamanya',
      'Butuh networking? VCard profesional siap pakai',
    ],
    price: 'Rp 49.000/bulan',
  },
  otomotif: {
    emoji: '🚗',
    headline: 'STNK TELAT = DENDA + TILANG?',
    subheadline: 'Pantau jatuh tempo STNK, servis & asuransi dalam satu tempat. Hindari denda jutaan rupiah.',
    benefits: [
      'Never miss jatuh tempo STNK lagi',
      'Jadwal servis terkelola otomatis',
      'Data asuransi lengkap saat klaim',
    ],
    price: 'Rp 29.000/bulan',
  },
  pertanian: {
    emoji: '🌾',
    headline: 'SALAH WAKTU PUPUK = PANEN RUGI JUTAAN?',
    subheadline: 'Kalkulator HST & jadwal pemupukan otomatis. Panen maksimal dengan perencanaan tepat waktu.',
    benefits: [
      'Hitung HST otomatis, tidak perlu manual lagi',
      'Jadwal pupuk tepat waktu setiap musim',
      'Catat panen & biaya tenaga kerja',
    ],
    price: 'Rp 39.000/bulan',
  },
  diklat: {
    emoji: '👥',
    headline: 'EVENT BERANTAKAN, PESERTA BINGUNG?',
    subheadline: 'Manage event B2B profesional. QR check-in, sertifikat otomatis, materi terorganisir rapi.',
    benefits: [
      'Check-in peserta real-time dengan QR',
      'Sertifikat & materi terstruktur per event',
      'Kesan profesional untuk klien Anda',
    ],
    price: 'Rp 99.000/bulan',
  },
};

/**
 * Get spotlight copy for a module
 */
export function getSpotlightCopy(moduleType: ModuleType): SpotlightCopy {
  return SPOTLIGHT_COPIES[moduleType] || SPOTLIGHT_COPIES.student;
}

/**
 * Get full module copy for a module
 */
export function getModuleCopy(moduleType: ModuleType): ModuleCopy {
  return MODULE_COPIES[moduleType] || MODULE_COPIES.student;
}

/**
 * Module rotation logic - weekly rotation
 * Each module gets spotlight for 1 week
 */
export function getSpotlightModule(): ModuleType {
  const moduleTypes: ModuleType[] = ['student', 'otomotif', 'pertanian', 'diklat'];
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNumber = Math.floor((now.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));

  return moduleTypes[weekNumber % moduleTypes.length];
}

/**
 * LocalStorage key for dismissed spotlight
 */
export const DISMISSED_SPOTLIGHT_KEY = 'balikin_dismissed_spotlight';

/**
 * Check if user has dismissed the spotlight
 */
export function hasDismissedSpotlight(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissed = localStorage.getItem(DISMISSED_SPOTLIGHT_KEY);
    if (!dismissed) return false;

    const data = JSON.parse(dismissed);
    const currentModule = getSpotlightModule();

    // Only return true if the same module was dismissed
    return data.module === currentModule;
  } catch {
    return false;
  }
}

/**
 * Mark spotlight as dismissed
 */
export function dismissSpotlight(): void {
  if (typeof window === 'undefined') return;
  try {
    const currentModule = getSpotlightModule();
    localStorage.setItem(
      DISMISSED_SPOTLIGHT_KEY,
      JSON.stringify({ module: currentModule, timestamp: Date.now() })
    );
  } catch {
    // Silently fail if localStorage is not available
  }
}

/**
 * Reset dismissed spotlight (for testing or when you want to show again)
 */
export function resetDismissedSpotlight(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DISMISSED_SPOTLIGHT_KEY);
  } catch {
    // Silently fail
  }
}
