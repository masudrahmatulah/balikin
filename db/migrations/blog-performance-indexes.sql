-- Blog Performance Indexes Migration
-- Adds missing indexes for optimal query performance

-- Blog Comments Indexes
-- For fetching comments by post (most common query)
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON balikin_blog_comments(post_id);
-- For fetching approved comments
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON balikin_blog_comments(is_approved);
-- For fetching parent comments (threading)
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON balikin_blog_comments(parent_id) WHERE parent_id IS NOT NULL;
-- Composite index for post + approved
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_approved ON balikin_blog_comments(post_id, is_approved);
-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON balikin_blog_comments(created_at DESC);

-- Giveaway Claims Indexes
-- For fetching claims by post + quiz
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_post_quiz ON balikin_giveaway_claims(post_id, quiz_id);
-- For fetching claims by status
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_status ON balikin_giveaway_claims(status);
-- For preventing duplicate claims (whatsapp + post + quiz)
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_duplicate_check ON balikin_giveaway_claims(whatsapp_number, post_id, quiz_id);
-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_created_at ON balikin_giveaway_claims(created_at DESC);

-- True Story Submissions Indexes
-- For fetching by status
CREATE INDEX IF NOT EXISTS idx_true_stories_status ON balikin_true_story_submissions(status);
-- For fetching by user
CREATE INDEX IF NOT EXISTS idx_true_stories_user_id ON balikin_true_story_submissions(user_id) WHERE user_id IS NOT NULL;
-- For fetching by tag
CREATE INDEX IF NOT EXISTS idx_true_stories_tag_id ON balikin_true_story_submissions(balikin_tag_id);
-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_true_stories_created_at ON balikin_true_story_submissions(created_at DESC);

-- Poll Votes Indexes
-- For counting votes by poll + option
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_option ON balikin_poll_votes(poll_id, option_id);
-- For preventing duplicate votes
CREATE INDEX IF NOT EXISTS idx_poll_votes_fingerprint ON balikin_poll_votes(fingerprint, poll_id);
-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_poll_votes_created_at ON balikin_poll_votes(created_at DESC);

-- Lost Locations Reports Indexes
-- For fetching by post
CREATE INDEX IF NOT EXISTS idx_lost_locations_post_id ON balikin_lost_locations_report(post_id);
-- For fetching by region/city
CREATE INDEX IF NOT EXISTS idx_lost_locations_city ON balikin_lost_locations_report(city);
-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_lost_locations_created_at ON balikin_lost_locations_report(created_at DESC);

-- Blog Post Revisions Indexes
-- For fetching revisions by post
CREATE INDEX IF NOT EXISTS idx_blog_revisions_post_id ON balikin_blog_post_revisions(post_id);
-- For ordering by revision number
CREATE INDEX IF NOT EXISTS idx_blog_revisions_number ON balikin_blog_post_revisions(post_id, revision_number DESC);
-- Index for created_at sorting
CREATE INDEX IF NOT EXISTS idx_blog_revisions_created_at ON balikin_blog_post_revisions(created_at DESC);

-- Blog Analytics Indexes
-- For fetching analytics by post
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON balikin_blog_posts_analytics(post_id);
-- For filtering by view type
CREATE INDEX IF NOT EXISTS idx_blog_analytics_view_type ON balikin_blog_posts_analytics(view_type);
-- Composite index for post + view type
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_view ON balikin_blog_posts_analytics(post_id, view_type);
-- Index for created_at (time-series queries)
CREATE INDEX IF NOT EXISTS idx_blog_analytics_created_at ON balikin_blog_posts_analytics(created_at DESC);

-- Rate Limit Indexes
-- For fetching by identifier + action type
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON balikin_rate_limit(identifier, action_type);
-- For cleanup queries (old records)
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_end ON balikin_rate_limit(window_end);
