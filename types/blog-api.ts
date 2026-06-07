/**
 * Type definitions for blog system
 * Replaces 'any' types with proper TypeScript interfaces
 */

import type { BlogModule } from '@/types/blog';

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Standard API response wrapper
 */
export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  error?: string;
  code?: string;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// BLOG POST TYPES
// ============================================================================

/**
 * Blog post for public display (sanitized)
 */
export interface BlogPostPublic {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  authorName: string;
  authorAvatar: string | null;
  reviewedBy: string | null;
  reviewedByTitle: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Blog post for admin (full data)
 */
export interface BlogPostAdmin extends BlogPostPublic {
  content: string;
  modules: BlogModule[];
  isPublished: boolean;
  scheduledAt: Date | null;
  authorId: string | null;
  metaDescription: string | null;
  metaKeywords: string | null;
  focusKeyword: string | null;
  deletedAt: Date | null;
}

/**
 * Blog post input for creation/update
 */
export interface BlogPostInput {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage?: string | null;
  modules?: BlogModule[];
  authorName?: string;
  authorAvatar?: string | null;
  reviewedBy?: string | null;
  reviewedByTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  focusKeyword?: string | null;
  scheduledAt?: string | null;
}

// ============================================================================
// COMMENT TYPES
// ============================================================================

/**
 * Blog comment for public display
 */
export interface BlogCommentPublic {
  id: string;
  parentId: string | null;
  name: string;
  commentText: string;
  isGiveawayWinner: boolean;
  hasHeroBadge: boolean;
  createdAt: Date;
}

/**
 * Blog comment input
 */
export interface BlogCommentInput {
  postId: string;
  parentId?: string | null;
  name: string;
  whatsapp: string;
  commentText: string;
}

/**
 * Blog comment with admin data
 */
export interface BlogCommentAdmin extends BlogCommentPublic {
  postId: string;
  userId: string | null;
  whatsappNumber: string | null;
  isApproved: boolean;
  updatedAt: Date;
}

// ============================================================================
// GIVEAWAY CLAIM TYPES
// ============================================================================

/**
 * Giveaway claim input
 */
export interface GiveawayClaimInput {
  postId: string;
  quizId: string;
  fullName: string;
  whatsappNumber: string;
  shippingAddress: string;
  score: number;
}

/**
 * Giveaway claim status
 */
export type GiveawayClaimStatus = 'pending' | 'approved' | 'rejected' | 'fulfilled';

/**
 * Giveaway claim with admin data
 */
export interface GiveawayClaimAdmin {
  id: string;
  postId: string;
  quizId: string;
  fullName: string;
  whatsappNumber: string;
  shippingAddress: string;
  score: number;
  status: GiveawayClaimStatus;
  trackingNumber?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// TRUE STORY TYPES
// ============================================================================

/**
 * True story submission input
 */
export interface TrueStorySubmissionInput {
  fullName: string;
  whatsappNumber: string;
  balikinTagId: string;
  storyTitle: string;
  storyText: string;
  videoUrl: string;
  jacketSize: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  shippingAddress: string;
}

/**
 * True story submission status
 */
export type TrueStoryStatus = 'pending' | 'approved' | 'rejected' | 'winner_jacket' | 'winner_sticker';

/**
 * True story submission with admin data
 */
export interface TrueStorySubmissionAdmin {
  id: string;
  userId: string | null;
  fullName: string;
  whatsappNumber: string;
  balikinTagId: string;
  storyTitle: string;
  storyText: string;
  videoUrl: string;
  jacketSize: string;
  shippingAddress: string;
  status: TrueStoryStatus;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// POLL TYPES
// ============================================================================

/**
 * Poll option
 */
export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

/**
 * Poll vote input
 */
export interface PollVoteInput {
  pollId: string;
  optionId: string;
  postId: string;
}

/**
 * Poll results
 */
export interface PollResults {
  pollId: string;
  question: string;
  options: PollOption[];
  totalVotes: number;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Application error with status code
 */
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Validation error
 */
export class ValidationError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

/**
 * Not found error
 */
export class NotFoundError extends Error {
  constructor(
    resource: string,
    identifier: string
  ) {
    super(`${resource} tidak ditemukan: ${identifier}`);
    this.name = 'NotFoundError';
    this.code = 'NOT_FOUND';
  }
  code: string;
}

// ============================================================================
// WORKFLOW TYPES
// ============================================================================

/**
 * Blog post workflow status
 */
export type WorkflowStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';

/**
 * Blog post workflow actions
 */
export type WorkflowAction = 'submit_for_review' | 'approve' | 'reject' | 'request_changes';

/**
 * Workflow state for a post
 */
export interface PostWorkflowState {
  status: WorkflowStatus;
  canEdit: boolean;
  canSubmit: boolean;
  canApprove: boolean;
  canReject: boolean;
}

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * View type for analytics
 */
export type ViewType = 'page_view' | 'module_interaction' | 'quiz_completion' | 'comment_submit';

/**
 * Analytics record
 */
export interface BlogAnalytics {
  id: string;
  postId: string;
  viewType: ViewType;
  ipAddress: string | null;
  userAgent: string | null;
  referrer: string | null;
  createdAt: Date;
}
