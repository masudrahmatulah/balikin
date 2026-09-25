ALTER TABLE "balikin_blog_content_plans"
  ADD COLUMN IF NOT EXISTS "target_min_words" integer NOT NULL DEFAULT 800;

ALTER TABLE "balikin_blog_content_plans"
  ADD COLUMN IF NOT EXISTS "target_max_words" integer NOT NULL DEFAULT 1500;

UPDATE "balikin_blog_content_plans"
SET "target_min_words" = CASE "article_type"
    WHEN 'pillar' THEN 2000
    WHEN 'commercial' THEN 700
    ELSE 800
  END,
  "target_max_words" = CASE "article_type"
    WHEN 'pillar' THEN 2500
    WHEN 'commercial' THEN 1200
    ELSE 1500
  END;
