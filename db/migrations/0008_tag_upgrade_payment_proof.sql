-- Manual QRIS proof for tag upgrade orders; safe to rerun.
ALTER TABLE balikin_tag_upgrade_orders
  ADD COLUMN IF NOT EXISTS payment_proof_url text;
