/**
 * Performance Index Migration
 * Adds critical database indexes for improved query performance
 *
 * Run: npx tsx scripts/add-performance-indexes.ts
 */

import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Indexes to add for performance optimization
 */
const INDEXES = [
  // Tags table indexes
  {
    name: "idx_tags_owner_id",
    table: "balikin_tags",
    columns: "owner_id",
    ifNotExists: true,
  },
  {
    name: "idx_tags_tier",
    table: "balikin_tags",
    columns: "tier",
    ifNotExists: true,
  },
  {
    name: "idx_tags_status",
    table: "balikin_tags",
    columns: "status",
    ifNotExists: true,
  },
  {
    name: "idx_tags_created_at",
    table: "balikin_tags",
    columns: "created_at DESC",
    ifNotExists: true,
  },
  {
    name: "idx_tags_composite_status_created",
    table: "balikin_tags",
    columns: "(status, created_at DESC)",
    ifNotExists: true,
  },

  // User table indexes
  {
    name: "idx_user_role",
    table: "balikin_user",
    columns: "role",
    ifNotExists: true,
  },
  {
    name: "idx_user_division",
    table: "balikin_user",
    columns: "division",
    ifNotExists: true,
  },
  {
    name: "idx_user_created_at",
    table: "balikin_user",
    columns: "created_at DESC",
    ifNotExists: true,
  },
  {
    name: "idx_user_email",
    table: "balikin_user",
    columns: "email",
    ifNotExists: true,
  },

  // Sticker orders indexes
  {
    name: "idx_sticker_orders_payment_status",
    table: "balikin_sticker_orders",
    columns: "payment_status",
    ifNotExists: true,
  },
  {
    name: "idx_sticker_orders_status",
    table: "balikin_sticker_orders",
    columns: "status",
    ifNotExists: true,
  },
  {
    name: "idx_sticker_orders_created_at",
    table: "balikin_sticker_orders",
    columns: "created_at DESC",
    ifNotExists: true,
  },
  {
    name: "idx_sticker_orders_user_id",
    table: "balikin_sticker_orders",
    columns: "user_id",
    ifNotExists: true,
  },
  {
    name: "idx_sticker_orders_composite_payment_created",
    table: "balikin_sticker_orders",
    columns: "(payment_status, created_at DESC)",
    ifNotExists: true,
  },

  // Scan logs indexes
  {
    name: "idx_scan_logs_tag_id",
    table: "balikin_scan_logs",
    columns: "tag_id",
    ifNotExists: true,
  },
  {
    name: "idx_scan_logs_created_at",
    table: "balikin_scan_logs",
    columns: "created_at DESC",
    ifNotExists: true,
  },
  {
    name: "idx_scan_logs_scanned_by",
    table: "balikin_scan_logs",
    columns: "scanned_by",
    ifNotExists: true,
  },

  // Module selections indexes
  {
    name: "idx_user_module_selections_user_id",
    table: "balikin_user_module_selections",
    columns: "user_id",
    ifNotExists: true,
  },
  {
    name: "idx_user_module_selections_module_type",
    table: "balikin_user_module_selections",
    columns: "module_type",
    ifNotExists: true,
  },

  // Material inventory indexes
  {
    name: "idx_material_inventory_material_type",
    table: "balikin_material_inventory",
    columns: "material_type",
    ifNotExists: true,
  },
];

/**
 * Create an index
 */
async function createIndex(index: typeof INDEXES[0]) {
  const sqlKeyword = index.ifNotExists ? "CREATE INDEX IF NOT EXISTS" : "CREATE INDEX";

  try {
    await db.execute(
      sql.raw(`${sqlKeyword} ${index.name} ON ${index.table} (${index.columns})`)
    );
    console.log(`✅ Created index: ${index.name}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to create index ${index.name}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function runMigration() {
  console.log("🚀 Starting performance index migration...\n");

  let successCount = 0;
  let failCount = 0;

  for (const index of INDEXES) {
    const result = await createIndex(index);
    if (result) {
      successCount++;
    } else {
      failCount++;
    }
  }

  console.log(`\n📊 Migration complete!`);
  console.log(`✅ Success: ${successCount} indexes`);
  console.log(`❌ Failed: ${failCount} indexes`);

  if (failCount === 0) {
    console.log("\n🎉 All indexes created successfully!");
  } else {
    console.log("\n⚠️  Some indexes failed to create. Please check the errors above.");
  }
}

// Run the migration
runMigration()
  .then(() => {
    console.log("\n✅ Migration completed");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  });
