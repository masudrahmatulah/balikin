CREATE TABLE IF NOT EXISTS "balikin_coupons" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "app_id" text DEFAULT 'balikin_id' NOT NULL,
  "code" text NOT NULL,
  "discount_type" text NOT NULL,
  "discount_value" integer NOT NULL,
  "max_uses" integer DEFAULT 1 NOT NULL,
  "used_count" integer DEFAULT 0 NOT NULL,
  "expires_at" timestamp,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_by" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "balikin_coupons_code_unique" UNIQUE("code"),
  CONSTRAINT "balikin_coupons_discount_type_check" CHECK ("discount_type" IN ('percentage', 'fixed')),
  CONSTRAINT "balikin_coupons_discount_value_check" CHECK ("discount_value" > 0),
  CONSTRAINT "balikin_coupons_max_uses_check" CHECK ("max_uses" > 0)
);

CREATE INDEX IF NOT EXISTS "idx_balikin_coupons_code"
  ON "balikin_coupons" ("code");

CREATE INDEX IF NOT EXISTS "idx_balikin_coupons_active"
  ON "balikin_coupons" ("is_active");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'balikin_coupons_created_by_user_fk'
  ) THEN
    ALTER TABLE "balikin_coupons"
      ADD CONSTRAINT "balikin_coupons_created_by_user_fk"
      FOREIGN KEY ("created_by") REFERENCES "balikin_user"("id") ON DELETE SET NULL;
  END IF;
END $$;
