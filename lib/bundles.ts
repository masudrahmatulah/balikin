/**
 * Bundle types and utilities for the Student Kit Keychain Bundle system
 */

export type BundleType = 'student_kit' | 'otomotif' | 'pertanian' | 'diklat' | 'standard' | null;
export type ModuleType = 'student' | 'otomotif' | 'pertanian' | 'diklat';

export interface BundleConfig {
  type: BundleType;
  moduleType: ModuleType | null;
  name: string;
  description: string;
  price: number;
  qrColor: string;
  qrBgColor: string;
  emoji: string;
}

/**
 * Bundle configurations for each type
 */
export const BUNDLE_CONFIGS: Record<Exclude<BundleType, null>, BundleConfig> = {
  student_kit: {
    type: 'student_kit',
    moduleType: 'student',
    name: 'Student Kit Keychain',
    description: 'Satu gantungan kunci untuk semua kebutuhan kampus Anda',
    price: 79000,
    qrColor: '#3B82F6', // blue-500
    qrBgColor: '#EFF6FF', // blue-50
    emoji: '🎓',
  },
  otomotif: {
    type: 'otomotif',
    moduleType: 'otomotif',
    name: 'Otomotif Keychain',
    description: 'Pantau STNK, servis & asuransi dalam satu tempat',
    price: 59000,
    qrColor: '#EF4444', // red-500
    qrBgColor: '#FEF2F2', // red-50
    emoji: '🚗',
  },
  pertanian: {
    type: 'pertanian',
    moduleType: 'pertanian',
    name: 'Pertanian Keychain',
    description: 'Kalkulator HST & jadwal pupuk otomatis',
    price: 69000,
    qrColor: '#22C55E', // green-500
    qrBgColor: '#F0FDF4', // green-50
    emoji: '🌾',
  },
  diklat: {
    type: 'diklat',
    moduleType: 'diklat',
    name: 'Diklat B2B Keychain',
    description: 'Manage event, sertifikat & materi training',
    price: 149000,
    qrColor: '#A855F7', // purple-500
    qrBgColor: '#FAF5FF', // purple-50
    emoji: '👥',
  },
  standard: {
    type: 'standard',
    moduleType: null,
    name: 'Balikin Standard Keychain',
    description: 'Proteksi barang hilang dengan QR code',
    price: 29000,
    qrColor: '#64748B', // slate-500
    qrBgColor: '#F8FAFC', // slate-50
    emoji: '🔖',
  },
};

/**
 * Get bundle configuration by type
 */
export function getBundleConfig(bundleType: BundleType): BundleConfig | null {
  if (!bundleType) return null;
  return BUNDLE_CONFIGS[bundleType] || null;
}

/**
 * Get bundle configuration by module type
 */
export function getBundleByModule(moduleType: ModuleType): BundleConfig | null {
  return Object.values(BUNDLE_CONFIGS).find(
    config => config.moduleType === moduleType
  ) || null;
}

/**
 * Format price to Indonesian Rupiah
 */
export function formatBundlePrice(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(price);
}

/**
 * Check if a bundle type includes a module
 */
export function isBundleWithModule(bundleType: BundleType): boolean {
  const config = getBundleConfig(bundleType);
  return config?.moduleType !== null;
}

/**
 * Get the module type for a bundle
 */
export function getBundleModuleType(bundleType: BundleType): ModuleType | null {
  const config = getBundleConfig(bundleType);
  return config?.moduleType || null;
}
