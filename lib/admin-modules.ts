import {
  BookOpen,
  Car,
  Wheat,
  Users,
  type LucideIcon,
} from 'lucide-react';

export type ModuleType = 'student' | 'otomotif' | 'pertanian' | 'diklat';

export interface ModuleInfo {
  type: ModuleType;
  name: string;
  description: string;
  benefits: string[];
  icon: LucideIcon;
  color: string;
}

export const MODULES: Record<ModuleType, ModuleInfo> = {
  student: {
    type: 'student',
    name: 'Student Kit',
    description: 'Kelola jadwal kuliah & deadline - hemat 3 jam/minggu!',
    benefits: [
      'Satu tempat untuk jadwal, deadline & link materi',
      'Notifikasi WhatsApp otomatis sebelum deadline',
      'Bagikan jadwal ke teman dengan satu link',
      'Simpan KTM/KRS sebagai foto digital',
      'Buat vCard profesional untuk networking'
    ],
    icon: BookOpen,
    color: 'bg-blue-500'
  },
  otomotif: {
    type: 'otomotif',
    name: 'Otomotif',
    description: 'Pantau STNK, servis, & klaim asuransi dalam satu tempat',
    benefits: [
      'Tidak perlu ingat tanggal jatuh tempo STNK',
      'Jadwal ganti oli & servis terkelola otomatis',
      'Riwayat servis terdokumentasi lengkap',
      'Data asuransi & klaim dalam genggaman',
      'Hindari denda & tilang akibat lupa jatuh tempo'
    ],
    icon: Car,
    color: 'bg-red-500'
  },
  pertanian: {
    type: 'pertanian',
    name: 'Pertanian',
    description: 'Hitung HST & jadwal pupuk otomatis untuk hasil panen maksimal',
    benefits: [
      'Kalkulator HST (Hari Setelah Tanam) otomatis',
      'Jadwal pemupukan tepat waktu',
      'Catatan panen & biaya tenaga kerja',
      'Optimalkan hasil panen dengan perencanaan baik',
      'Hindari kesalahan timing yang merugikan'
    ],
    icon: Wheat,
    color: 'bg-green-500'
  },
  diklat: {
    type: 'diklat',
    name: 'Diklat B2B',
    description: 'Manage acara B2B, sertifikat, & materi training dengan mudah',
    benefits: [
      'Tracking kehadiran peserta real-time',
      'Materi & sertifikat terorganisir per event',
      'QR code untuk check-in peserta',
      'Rundown schedule yang terstruktur',
      'Professional untuk event klien & internal'
    ],
    icon: Users,
    color: 'bg-purple-500'
  }
};

export function getModuleDisplayName(moduleType: string): string {
  return MODULES[moduleType as ModuleType]?.name || moduleType;
}

export function getModuleDescription(moduleType: string): string {
  return MODULES[moduleType as ModuleType]?.description || '';
}

export function getModuleIcon(moduleType: string) {
  return MODULES[moduleType as ModuleType]?.icon || BookOpen;
}

export function getModuleColor(moduleType: string): string {
  return MODULES[moduleType as ModuleType]?.color || 'bg-gray-500';
}

export function getAllModules(): ModuleInfo[] {
  return Object.values(MODULES);
}

export function getModuleInfo(moduleType: string): ModuleInfo | undefined {
  return MODULES[moduleType as ModuleType];
}
