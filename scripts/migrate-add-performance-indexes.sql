-- Performance Index Migration for Balikin Admin Dashboard
-- This file adds critical indexes for improved query performance
--
-- To apply: Run via Supabase SQL Editor or psql
-- Or use: psql $DATABASE_URL -f scripts/migrate-add-performance-indexes.sql

-- Tags table indexes
CREATE INDEX IF NOT EXISTS idx_tags_owner_id ON balikin_tags(owner_id);
CREATE INDEX IF NOT EXISTS idx_tags_tier ON balikin_tags(tier);
CREATE INDEX IF NOT EXISTS idx_tags_status ON balikin_tags(status);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON balikin_tags(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tags_composite_status_created ON balikin_tags(status, created_at DESC);

-- User table indexes
CREATE INDEX IF NOT EXISTS idx_user_role ON balikin_user(role);
CREATE INDEX IF NOT EXISTS idx_user_division ON balikin_user(division);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON balikin_user(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_email ON balikin_user(email);

-- Sticker orders indexes
CREATE INDEX IF NOT EXISTS idx_sticker_orders_payment_status ON balikin_sticker_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_status ON balikin_sticker_orders(status);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_created_at ON balikin_sticker_orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_user_id ON balikin_sticker_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_sticker_orders_composite_payment_created ON balikin_sticker_orders(payment_status, created_at DESC);

-- Scan logs indexes
CREATE INDEX IF NOT EXISTS idx_scan_logs_tag_id ON balikin_scan_logs(tag_id);
CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON balikin_scan_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_by ON balikin_scan_logs(scanned_by);

-- Module selections indexes
CREATE INDEX IF NOT EXISTS idx_user_module_selections_user_id ON balikin_user_module_selections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_module_selections_module_type ON balikin_user_module_selections(module_type);

-- Material inventory indexes
CREATE INDEX IF NOT EXISTS idx_material_inventory_material_type ON balikin_material_inventory(material_type);

-- Verify indexes created
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename LIKE 'balikin_%'
ORDER BY tablename, indexname;
