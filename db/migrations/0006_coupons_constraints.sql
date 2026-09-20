-- 0006: Batasan keamanan tabel coupons (defense-in-depth, validasi app sudah ada).
-- Terapkan via scripts/apply-migration.ts. Idempotent (IF NOT EXISTS tidak berlaku
-- untuk constraint, jadi cek dulu di pg_constraint bila dijalankan manual).

DO $$
BEGIN
  -- percentage 1-100, fixed 1-10jt
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_coupons_discount_value') THEN
    ALTER TABLE balikin_coupons ADD CONSTRAINT chk_coupons_discount_value CHECK (
      discount_value >= 1 AND discount_value <= 10000000
    );
  END IF;

  -- used_count tidak boleh negatif / melebihi max_uses
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_coupons_used_count') THEN
    ALTER TABLE balikin_coupons ADD CONSTRAINT chk_coupons_used_count CHECK (
      used_count >= 0 AND used_count <= max_uses
    );
  END IF;

  -- max_uses positif
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_coupons_max_uses') THEN
    ALTER TABLE balikin_coupons ADD CONSTRAINT chk_coupons_max_uses CHECK (
      max_uses >= 1
    );
  END IF;
END
$$;
