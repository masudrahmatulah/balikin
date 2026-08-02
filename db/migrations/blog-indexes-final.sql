-- Blog Performance Indexes Migration (FINAL - Fixed)

-- Blog Comments Indexes
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_id ON balikin_blog_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_comments_approved ON balikin_blog_comments(is_approved);
CREATE INDEX IF NOT EXISTS idx_blog_comments_parent_id ON balikin_blog_comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_blog_comments_post_approved ON balikin_blog_comments(post_id, is_approved);
CREATE INDEX IF NOT EXISTS idx_blog_comments_created_at ON balikin_blog_comments(created_at DESC);

-- Giveaway Claims Indexes
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_post_quiz ON balikin_giveaway_claims(post_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_status ON balikin_giveaway_claims(status);
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_duplicate_check ON balikin_giveaway_claims(whatsapp_number, post_id, quiz_id);
CREATE INDEX IF NOT EXISTS idx_giveaway_claims_created_at ON balikin_giveaway_claims(created_at DESC);

-- True Story Submissions Indexes
CREATE INDEX IF NOT EXISTS idx_true_stories_status ON balikin_true_story_submissions(status);
CREATE INDEX IF NOT EXISTS idx_true_stories_user_id ON balikin_true_story_submissions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_true_stories_tag_id ON balikin_true_story_submissions(balikin_tag_id);
CREATE INDEX IF NOT EXISTS idx_true_stories_created_at ON balikin_true_story_submissions(created_at DESC);

-- Poll Votes Indexes
CREATE INDEX IF NOT EXISTS idx_poll_votes_poll_option ON balikin_poll_votes(poll_id, selected_option_index);
CREATE INDEX IF NOT EXISTS idx_poll_votes_ip_check ON balikin_poll_votes(post_id, poll_id, ip_address) WHERE ip_address IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_poll_votes_created_at ON balikin_poll_votes(created_at DESC);

-- Lost Locations Reports Indexes (FIXED: city_name, not city)
CREATE INDEX IF NOT EXISTS idx_lost_locations_post_id ON balikin_lost_locations_report(post_id);
CREATE INDEX IF NOT EXISTS idx_lost_locations_city_name ON balikin_lost_locations_report(city_name);
CREATE INDEX IF NOT EXISTS idx_lost_locations_created_at ON balikin_lost_locations_report(created_at DESC);

-- Blog Post Revisions Indexes
CREATE INDEX IF NOT EXISTS idx_blog_revisions_post_id ON balikin_blog_post_revisions(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_revisions_number ON balikin_blog_post_revisions(post_id, revision_number DESC);
CREATE INDEX IF NOT EXISTS idx_blog_revisions_created_at ON balikin_blog_post_revisions(created_at DESC);

-- Blog Analytics Indexes
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_id ON balikin_blog_posts_analytics(post_id);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_view_type ON balikin_blog_posts_analytics(view_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_post_view ON balikin_blog_posts_analytics(post_id, view_type);
CREATE INDEX IF NOT EXISTS idx_blog_analytics_created_at ON balikin_blog_posts_analytics(created_at DESC);

-- Rate Limit Indexes
CREATE INDEX IF NOT EXISTS idx_rate_limit_identifier_action ON balikin_rate_limit(identifier, action_type);
CREATE INDEX IF NOT EXISTS idx_rate_limit_window_end ON balikin_rate_limit(window_end);
