-- Better Auth admin plugin fields; additive and safe to rerun.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '30s';

ALTER TABLE balikin_user
  ADD COLUMN IF NOT EXISTS banned boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS ban_reason text,
  ADD COLUMN IF NOT EXISTS ban_expires timestamp;

ALTER TABLE balikin_session
  ADD COLUMN IF NOT EXISTS impersonated_by text;

COMMIT;
