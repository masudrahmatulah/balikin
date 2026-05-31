import { NextRequest, NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { db } from "@/db";
import { sql } from "drizzle-orm";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Performance Index Migration API
 * POST /api/admin/admin/migrate-indexes
 *
 * Adds critical database indexes for improved query performance
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    const indexes = [
      // Tags table indexes
      "CREATE INDEX IF NOT EXISTS idx_tags_owner_id ON balikin_tags(owner_id)",
      "CREATE INDEX IF NOT EXISTS idx_tags_tier ON balikin_tags(tier)",
      "CREATE INDEX IF NOT EXISTS idx_tags_status ON balikin_tags(status)",
      "CREATE INDEX IF NOT EXISTS idx_tags_created_at ON balikin_tags(created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_tags_composite_status_created ON balikin_tags(status, created_at DESC)",

      // User table indexes
      "CREATE INDEX IF NOT EXISTS idx_user_role ON balikin_user(role)",
      "CREATE INDEX IF NOT EXISTS idx_user_division ON balikin_user(division)",
      "CREATE INDEX IF NOT EXISTS idx_user_created_at ON balikin_user(created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_user_email ON balikin_user(email)",

      // Sticker orders indexes
      "CREATE INDEX IF NOT EXISTS idx_sticker_orders_payment_status ON balikin_sticker_orders(payment_status)",
      "CREATE INDEX IF NOT EXISTS idx_sticker_orders_status ON balikin_sticker_orders(status)",
      "CREATE INDEX IF NOT EXISTS idx_sticker_orders_created_at ON balikin_sticker_orders(created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_sticker_orders_user_id ON balikin_sticker_orders(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_sticker_orders_composite_payment_created ON balikin_sticker_orders(payment_status, created_at DESC)",

      // Scan logs indexes
      "CREATE INDEX IF NOT EXISTS idx_scan_logs_tag_id ON balikin_scan_logs(tag_id)",
      "CREATE INDEX IF NOT EXISTS idx_scan_logs_created_at ON balikin_scan_logs(created_at DESC)",
      "CREATE INDEX IF NOT EXISTS idx_scan_logs_scanned_by ON balikin_scan_logs(scanned_by)",

      // Module selections indexes
      "CREATE INDEX IF NOT EXISTS idx_user_module_selections_user_id ON balikin_user_module_selections(user_id)",
      "CREATE INDEX IF NOT EXISTS idx_user_module_selections_module_type ON balikin_user_module_selections(module_type)",

      // Material inventory indexes
      "CREATE INDEX IF NOT EXISTS idx_material_inventory_material_type ON balikin_material_inventory(material_type)",
    ];

    const results = [];
    let successCount = 0;
    let failCount = 0;

    for (const indexSql of indexes) {
      try {
        await db.execute(sql.raw(indexSql));
        successCount++;
        results.push({ sql: indexSql, status: "success" });
      } catch (error) {
        failCount++;
        results.push({
          sql: indexSql,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Migration complete: ${successCount} indexes created, ${failCount} failed`,
      results,
      summary: {
        total: indexes.length,
        success: successCount,
        failed: failCount,
      },
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      {
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * Get current database indexes
 * GET /api/admin/admin/migrate-indexes
 */
export async function GET(request: NextRequest) {
  try {
    const adminCheck = await isAdmin();
    if (!adminCheck) {
      return NextResponse.json({ error: "Unauthorized: Admin access required" }, { status: 401 });
    }

    // Get current indexes
    const result = await db.execute(
      sql.raw`
        SELECT
          schemaname,
          tablename,
          indexname,
          indexdef
        FROM pg_indexes
        WHERE tablename LIKE 'balikin_%'
        ORDER BY tablename, indexname
      `
    );

    return NextResponse.json({
      indexes: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Error getting indexes:", error);
    return NextResponse.json(
      { error: "Failed to get indexes", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
