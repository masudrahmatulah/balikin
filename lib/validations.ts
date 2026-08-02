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
// BLOG VALIDATION SCHEMAS
// ============================================================================

export const BlogCommentSchema = z.object({
  postId: z.string().uuid('Post ID tidak valid'),
  parentId: z.string().uuid('Parent Comment ID tidak valid').optional(),
  name: z.string()
    .min(1, 'Nama wajib diisi')
    .max(100, 'Nama terlalu panjang (maksimal 100 karakter)')
    .transform((val) => val.trim()),
  whatsapp: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format WhatsApp tidak valid (contoh: 08123456789)')
    .transform((val) => val.replace(/[\s\-]/g, '')),
  commentText: z.string()
    .min(3, 'Komentar minimal 3 karakter')
    .max(2000, 'Komentar terlalu panjang (maksimal 2000 karakter)')
    .transform((val) => val.trim()),
});

export const GiveawayClaimSchema = z.object({
  postId: z.string().uuid('Post ID tidak valid'),
  quizId: z.string().min(1, 'Quiz ID wajib diisi'),
  fullName: z.string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama terlalu panjang')
    .transform((val) => val.trim()),
  whatsappNumber: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format WhatsApp tidak valid')
    .transform((val) => val.replace(/[\s\-]/g, '')),
  shippingAddress: z.string()
    .min(20, 'Alamat lengkap minimal 20 karakter')
    .max(500, 'Alamat terlalu panjang')
    .transform((val) => val.trim()),
  score: z.number()
    .int('Skor harus bilangan bulat')
    .min(0, 'Skor tidak boleh negatif')
    .max(100, 'Skor maksimal 100'),
});

export const TrueStorySubmissionSchema = z.object({
  fullName: z.string()
    .min(2, 'Nama lengkap minimal 2 karakter')
    .max(100, 'Nama terlalu panjang')
    .transform((val) => val.trim()),
  whatsappNumber: z.string()
    .regex(/^(\+62|62|0)[0-9]{9,12}$/, 'Format WhatsApp tidak valid')
    .transform((val) => val.replace(/[\s\-]/g, '')),
  balikinTagId: z.string()
    .min(1, 'ID Tag wajib diisi')
    .max(50, 'ID Tag terlalu panjang')
    .regex(/^BLK[-_]?[A-Z0-9]+$/i, 'Format ID Tag tidak valid (contoh: BLK-12345)')
    .transform((val) => val.trim().toUpperCase()),
  storyTitle: z.string()
    .min(10, 'Judul kisah minimal 10 karakter')
    .max(200, 'Judul terlalu panjang')
    .transform((val) => val.trim()),
  storyText: z.string()
    .min(50, 'Cerita kisah minimal 50 karakter')
    .max(5000, 'Cerita terlalu panjang')
    .transform((val) => val.trim()),
  videoUrl: z.string()
    .url('URL video tidak valid')
    .max(500, 'URL terlalu panjang')
    .refine((val) => {
      const allowedHosts = ['tiktok.com', 'vm.tiktok.com', 'instagram.com', 'drive.google.com'];
      try {
        const hostname = new URL(val).hostname;
        return allowedHosts.some(host => hostname.includes(host));
      } catch {
        return false;
      }
    }, 'URL harus dari TikTok, Instagram, atau Google Drive'),
  jacketSize: z.enum(['S', 'M', 'L', 'XL', 'XXL'], {
    errorMap: () => ({ message: 'Ukuran jaket harus S, M, L, XL, atau XXL' }),
  }),
  shippingAddress: z.string()
    .min(20, 'Alamat lengkap minimal 20 karakter')
    .max(500, 'Alamat terlalu panjang')
    .transform((val) => val.trim()),
});

export const BlogPostCreateSchema = z.object({
  title: z.string()
    .min(5, 'Judul artikel minimal 5 karakter')
    .max(200, 'Judul terlalu panjang')
    .transform((val) => val.trim()),
  slug: z.string()
    .min(1, 'Slug wajib diisi')
    .max(100, 'Slug terlalu panjang')
    .regex(/^[a-z0-9-_]+$/, 'Slug hanya boleh huruf kecil, angka, tanda hubung (-), dan underscore (_)')
    .transform((val) => val.toLowerCase().trim()),
  summary: z.string()
    .min(50, 'Ringkasan minimal 50 karakter')
    .max(500, 'Ringkasan terlalu panjang')
    .transform((val) => val.trim()),
  content: z.string()
    .min(100, 'Konten artikel minimal 100 karakter')
    .max(50000, 'Konten terlalu panjang'),
  coverImage: z.string().url('URL gambar cover tidak valid').optional().or(z.literal('')),
  modules: z.array(z.any()).optional(),
  authorName: z.string().max(100).optional(),
  reviewedBy: z.string().max(100).optional(),
  reviewedByTitle: z.string().max(100).optional(),
  metaDescription: z.string().max(300).optional(),
  metaKeywords: z.string().max(200).optional(),
  focusKeyword: z.string().max(100).optional(),
  isPublished: z.boolean().optional(),
  scheduledAt: z.string().datetime('Format tanggal tidak valid').optional(),
});

export const BlogPostUpdateSchema = BlogPostCreateSchema.partial().extend({
  id: z.string().uuid('Post ID tidak valid'),
});

export const BlogCommentModerationSchema = z.object({
  commentId: z.string().uuid('Comment ID tidak valid'),
  isApproved: z.boolean().optional(),
  isGiveawayWinner: z.boolean().optional(),
});

export const GiveawayClaimModerationSchema = z.object({
  claimId: z.string().uuid('Claim ID tidak valid'),
  status: z.enum(['pending', 'approved', 'shipped', 'rejected']),
  trackingNumber: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

export const TrueStoryModerationSchema = z.object({
  submissionId: z.string().uuid('Submission ID tidak valid'),
  status: z.enum(['pending', 'verified', 'winner_jacket', 'rejected']),
  trackingNumber: z.string().max(100).optional(),
  rejectionReason: z.string().max(500).optional(),
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

export type BlogCommentInput = z.infer<typeof BlogCommentSchema>;
export type GiveawayClaimInput = z.infer<typeof GiveawayClaimSchema>;
export type TrueStorySubmissionInput = z.infer<typeof TrueStorySubmissionSchema>;
export type BlogPostCreateInput = z.infer<typeof BlogPostCreateSchema>;
export type BlogPostUpdateInput = z.infer<typeof BlogPostUpdateSchema>;
export type BlogCommentModerationInput = z.infer<typeof BlogCommentModerationSchema>;
export type GiveawayClaimModerationInput = z.infer<typeof GiveawayClaimModerationSchema>;
export type TrueStoryModerationInput = z.infer<typeof TrueStoryModerationSchema>;
