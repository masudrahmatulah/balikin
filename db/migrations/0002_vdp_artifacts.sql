ALTER TABLE "balikin_print_batches"
  ADD COLUMN IF NOT EXISTS "artifact_url" text,
  ADD COLUMN IF NOT EXISTS "artifact_filename" text,
  ADD COLUMN IF NOT EXISTS "artifact_content_type" text,
  ADD COLUMN IF NOT EXISTS "artifact_size" integer,
  ADD COLUMN IF NOT EXISTS "artifact_expires_at" timestamp,
  ADD COLUMN IF NOT EXISTS "generation_config" jsonb;

CREATE INDEX IF NOT EXISTS "balikin_print_batches_artifact_expires_idx"
  ON "balikin_print_batches" ("artifact_expires_at");
