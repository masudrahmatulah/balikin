// Blog Module Types
export type FAQItem = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
};

export type BlogModule =
  | { type: 'faq'; data: FAQItem[] }
  | { type: 'gallery'; images: string[] }
  | { type: 'ad_baris'; text: string; link: string; badge?: string }
  | { type: 'crowdsourced_map'; mapRegionId: string }
  | { type: 'instant_poll'; pollId: string; question: string; options: string[] }
  | { type: 'setup_showoff'; galleryId: string; incentiveDiscount: number }
  | {
      type: 'quiz_giveaway';
      quizId: string;
      rewardText: string;
      minScoreToWin: number; // 0-100
      questions: QuizQuestion[];
    };

// Blog Post Types
export type BlogPostStatus = 'draft' | 'published';
export type GiveawayStatus = 'pending' | 'approved' | 'shipped' | 'rejected';
export type TrueStoryStatus = 'pending' | 'verified' | 'winner_jacket' | 'rejected';
export type JacketSize = 'S' | 'M' | 'L' | 'XL' | 'XXL';

// Public Types (for components)
export interface PublicBlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  coverImage: string | null;
  content: string;
  modules: BlogModule[];
  authorName: string;
  authorAvatar: string | null;
  reviewedBy: string | null;
  reviewedByTitle: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export interface QuizModuleProps {
  quizId: string;
  rewardText: string;
  minScoreToWin: number;
  questions: QuizQuestion[];
  postId: string;
}

export interface Comment {
  id: string;
  name: string;
  commentText: string;
  isGiveawayWinner: boolean;
  hasHeroBadge: boolean;
  createdAt: string;
}

export interface PollResults {
  pollId: string;
  options: string[];
  counts: number[];
  totalVotes: number;
}

// SEO Types
export interface SEOMetadata {
  metaDescription: string;
  metaKeywords: string;
  focusKeyword: string;
}

export interface SEOChecklist {
  slugOptimized: boolean;
  focusKeywordInContent: boolean;
  hasAltImages: boolean;
  hasInternalLinks: boolean;
  wordCountMet: boolean;
}

// Schema.org Types
export interface FAQPageSchema {
  '@context': string;
  '@type': 'FAQPage';
  mainEntity: Array<{
    '@type': 'Question';
    name: string;
    acceptedAnswer: {
      '@type': 'Answer';
      text: string;
    };
  }>;
}

export interface BlogPostingSchema {
  '@context': string;
  '@type': 'BlogPosting';
  headline: string;
  description: string;
  image: string | null;
  author: {
    '@type': 'Person';
    name: string;
  };
  reviewedBy?: {
    '@type': 'Person';
    name: string;
    jobTitle: string;
  };
  datePublished: string;
  dateModified: string;
}
