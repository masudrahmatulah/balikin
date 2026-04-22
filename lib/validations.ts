/**
 * Validation schemas using Zod for Student Kit module
 */

import { z } from 'zod';

// ============================================================================
// STUDENT KIT VALIDATION SCHEMAS
// ============================================================================

export const ClassScheduleItemSchema = z.object({
  course: z.string().min(1, 'Nama mata kuliah harus diisi').max(100, 'Mata kuliah terlalu panjang'),
  room: z.string().max(50, 'Kode ruang terlalu panjang').optional(),
  day: z.enum(['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'], {
    errorMap: () => ({ message: 'Hari tidak valid' }),
  }),
  time: z.string().regex(/^\d{1,2}:\d{2}$/, {
    message: 'Format waktu harus HH:MM (contoh: 08:00)',
  }),
});

export const AssignmentDeadlineItemSchema = z.object({
  title: z.string().min(1, 'Judul tugas harus diisi').max(200, 'Judul terlalu panjang'),
  course: z.string().max(100, 'Nama mata kuliah terlalu panjang'),
  dueDate: z.string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Format tanggal tidak valid',
    })
    .refine((date) => new Date(date) > new Date(), {
      message: 'Deadline harus di masa depan',
    }),
});

export const DriveLinkItemSchema = z.object({
  name: z.string().min(1, 'Nama link harus diisi').max(100, 'Nama terlalu panjang'),
  url: z.string().url('URL tidak valid').max(500, 'URL terlalu panjang'),
});

export const VCDataSchema = z.object({
  fullName: z.string().min(1, 'Nama lengkap harus diisi').max(100, 'Nama terlalu panjang'),
  title: z.string().max(100, 'Judul terlalu panjang').optional(),
  email: z.string().email('Email tidak valid').optional().or(z.literal('')),
  phone: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format nomor HP tidak valid (contoh: +628123456789)')
    .optional()
    .or(z.literal('')),
  linkedinUrl: z.string().url('LinkedIn URL tidak valid').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Portfolio URL tidak valid').optional().or(z.literal('')),
  githubUrl: z.string().url('GitHub URL tidak valid').optional().or(z.literal('')),
  bio: z.string().max(500, 'Bio terlalu panjang (max 500 karakter)').optional(),
});

// ============================================================================
// REQUEST VALIDATION SCHEMAS
// ============================================================================

export const UpdateStudentKitSchema = z.object({
  classSchedule: z.string()
    .transform((val) => {
      try {
        const parsed = JSON.parse(val || '[]');
        return z.array(ClassScheduleItemSchema).parse(parsed);
      } catch {
        throw new Error('Format classSchedule tidak valid');
      }
    })
    .optional(),
  assignmentDeadlines: z.string()
    .transform((val) => {
      try {
        const parsed = JSON.parse(val || '[]');
        return z.array(AssignmentDeadlineItemSchema).parse(parsed);
      } catch {
        throw new Error('Format assignmentDeadlines tidak valid');
      }
    })
    .optional(),
  driveLinks: z.string()
    .transform((val) => {
      try {
        const parsed = JSON.parse(val || '[]');
        return z.array(DriveLinkItemSchema).parse(parsed);
      } catch {
        throw new Error('Format driveLinks tidak valid');
      }
    })
    .optional(),
  ktmKrsPhotos: z.string()
    .transform((val) => {
      try {
        const parsed = JSON.parse(val || '[]');
        return z.array(z.string().url()).max(10, 'Maksimal 10 foto').parse(parsed);
      } catch {
        throw new Error('Format ktmKrsPhotos tidak valid');
      }
    })
    .optional(),
});

export const UpdateInternshipVCardSchema = z.object({
  fullName: z.string().min(1).max(100).optional(),
  title: z.string().max(100).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().regex(/^(\+62|62|0)[0-9]{9,12}$/).optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  bio: z.string().max(500).optional(),
});

export const ShareScheduleSchema = z.object({
  classSchedule: z.string().refine((val) => {
    try {
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, 'Format JSON tidak valid'),
});

export const ImportScheduleSchema = z.object({
  shareCode: z.string()
    .length(10, 'Kode berbagi harus 10 karakter')
    .regex(/^[a-z0-9_-]+$/i, 'Kode hanya boleh huruf, angka, underscore, dan dash'),
});

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ClassScheduleItem = z.infer<typeof ClassScheduleItemSchema>;
export type AssignmentDeadlineItem = z.infer<typeof AssignmentDeadlineItemSchema>;
export type DriveLinkItem = z.infer<typeof DriveLinkItemSchema>;
export type VCData = z.infer<typeof VCDataSchema>;
export type UpdateStudentKitInput = z.infer<typeof UpdateStudentKitSchema>;
export type UpdateInternshipVCardInput = z.infer<typeof UpdateInternshipVCardSchema>;
