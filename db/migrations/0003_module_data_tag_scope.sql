ALTER TABLE "balikin_otomotif_data"
  ADD COLUMN IF NOT EXISTS "tag_id" uuid REFERENCES "balikin_tags"("id") ON DELETE CASCADE;

ALTER TABLE "balikin_pertanian_data"
  ADD COLUMN IF NOT EXISTS "tag_id" uuid REFERENCES "balikin_tags"("id") ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "balikin_otomotif_data_tag_id_unique"
  ON "balikin_otomotif_data" ("tag_id")
  WHERE "tag_id" IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "balikin_pertanian_data_tag_id_unique"
  ON "balikin_pertanian_data" ("tag_id")
  WHERE "tag_id" IS NOT NULL;
