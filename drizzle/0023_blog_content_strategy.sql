CREATE TABLE IF NOT EXISTS "balikin_blog_content_clusters" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "app_id" text DEFAULT 'balikin_id' NOT NULL,
  "name" text NOT NULL,
  "slug" text NOT NULL UNIQUE,
  "description" text,
  "primary_keyword" text,
  "target_articles" integer DEFAULT 12 NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "balikin_blog_content_plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "app_id" text DEFAULT 'balikin_id' NOT NULL,
  "cluster_id" uuid NOT NULL REFERENCES "balikin_blog_content_clusters"("id") ON DELETE CASCADE,
  "parent_plan_id" uuid,
  "linked_post_id" uuid REFERENCES "balikin_blog_posts"("id") ON DELETE SET NULL,
  "title" text NOT NULL,
  "focus_keyword" text NOT NULL,
  "secondary_keywords" text,
  "search_intent" text DEFAULT 'informational' NOT NULL,
  "article_type" text DEFAULT 'supporting' NOT NULL,
  "brief" text,
  "cta" text,
  "priority" text DEFAULT 'medium' NOT NULL,
  "status" text DEFAULT 'planned' NOT NULL,
  "target_publish_date" timestamp,
  "assigned_to" text REFERENCES "balikin_user"("id") ON DELETE SET NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "idx_blog_content_clusters_active" ON "balikin_blog_content_clusters" ("is_active");
CREATE INDEX IF NOT EXISTS "idx_blog_content_plans_cluster" ON "balikin_blog_content_plans" ("cluster_id");
CREATE INDEX IF NOT EXISTS "idx_blog_content_plans_status" ON "balikin_blog_content_plans" ("status");
CREATE INDEX IF NOT EXISTS "idx_blog_content_plans_linked_post" ON "balikin_blog_content_plans" ("linked_post_id");
CREATE INDEX IF NOT EXISTS "idx_blog_content_plans_publish_date" ON "balikin_blog_content_plans" ("target_publish_date");
