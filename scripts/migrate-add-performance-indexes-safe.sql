-- Performance Index Migration for Balikin Admin Dashboard
-- Safe version with column existence checks
--
-- Run this in Supabase SQL Editor or via psql

-- Tags table indexes
DO $$
BEGIN
    -- Check if table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_tags') THEN
        -- Check if column exists before creating index
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_tags' AND column_name = 'owner_id') THEN
            CREATE INDEX IF NOT EXISTS idx_tags_owner_id ON balikin_tags(owner_id);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_tags' AND column_name = 'tier') THEN
            CREATE INDEX IF NOT EXISTS idx_tags_tier ON balikin_tags(tier);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_tags' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_tags_status ON balikin_tags(status);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_tags' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_tags_created_at ON balikin_tags(created_at DESC);
        END IF;
    END IF;
END $$;

-- User table indexes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_user') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_user' AND column_name = 'role') THEN
            CREATE INDEX IF NOT EXISTS idx_user_role ON balikin_user(role);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_user' AND column_name = 'division') THEN
            CREATE INDEX IF NOT EXISTS idx_user_division ON balikin_user(division);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_user' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_user_created_at ON balikin_user(created_at DESC);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_user' AND column_name = 'email') THEN
            CREATE INDEX IF NOT EXISTS idx_user_email ON balikin_user(email);
        END IF;
    END IF;
END $$;

-- Sticker orders indexes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_sticker_orders') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_sticker_orders' AND column_name = 'payment_status') THEN
            CREATE INDEX IF NOT EXISTS idx_sticker_orders_payment_status ON balikin_sticker_orders(payment_status);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_sticker_orders' AND column_name = 'status') THEN
            CREATE INDEX IF NOT EXISTS idx_sticker_orders_status ON balikin_sticker_orders(status);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_sticker_orders' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_sticker_orders_created_at ON balikin_sticker_orders(created_at DESC);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_sticker_orders' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_sticker_orders_user_id ON balikin_sticker_orders(user_id);
        END IF;

        -- Composite index
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_sticker_orders' AND column_name = 'payment_status') THEN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_sticker_orders' AND column_name = 'created_at') THEN
                CREATE INDEX IF NOT EXISTS idx_sticker_orders_composite_payment_created ON balikin_sticker_orders(payment_status, created_at DESC);
            END IF;
        END IF;
    END IF;
END $$;

-- Scan logs indexes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_scan_logs') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_scan_logs' AND column_name = 'tag_id') THEN
            CREATE INDEX IF NOT EXISTS idx_scan_logs_tag_id ON balikin_scan_logs(tag_id);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_scan_logs' AND column_name = 'created_at') THEN
            CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON balikin_scan_logs(created_at DESC);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_scan_logs' AND column_name = 'scanned_by') THEN
            CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_by ON balikin_scan_logs(scanned_by);
        END IF;
    END IF;
END $$;

-- Module selections indexes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_user_module_selections') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_user_module_selections' AND column_name = 'user_id') THEN
            CREATE INDEX IF NOT EXISTS idx_user_module_selections_user_id ON balikin_user_module_selections(user_id);
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_user_module_selections' AND column_name = 'module_type') THEN
            CREATE INDEX IF NOT EXISTS idx_user_module_selections_module_type ON balikin_user_module_selections(module_type);
        END IF;
    END IF;
END $$;

-- Material inventory indexes
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_material_inventory') THEN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'balikin_material_inventory' AND column_name = 'material_type') THEN
            CREATE INDEX IF NOT EXISTS idx_material_inventory_material_type ON balikin_material_inventory(material_type);
        END IF;
    END IF;
END $$;

-- Show created indexes
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename LIKE 'balikin_%'
ORDER BY tablename, indexname;
