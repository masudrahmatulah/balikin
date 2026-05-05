import { db } from '../db';
import { sql } from 'drizzle-orm';

async function addPerformanceIndexes() {
  console.log('🚀 Adding performance indexes for admin dashboard optimization...');

  try {
    // Indexes for tags table
    console.log('📊 Adding indexes for balikin_tags table...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_tags_owner_id" ON "balikin_tags"("owner_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_tags_created_at" ON "balikin_tags"("created_at")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_tags_slug" ON "balikin_tags"("slug")`);
    console.log('✅ Tags table indexes created');

    // Indexes for user table
    console.log('📊 Adding indexes for balikin_user table...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_balikin_user_email" ON "balikin_user"("email")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_balikin_user_role" ON "balikin_user"("role")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_balikin_user_created_at" ON "balikin_user"("created_at")`);
    console.log('✅ User table indexes created');

    // Indexes for scan_logs table
    console.log('📊 Adding indexes for balikin_scan_logs table...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_scan_logs_tag_id" ON "balikin_scan_logs"("tag_id")`);
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_scan_logs_scanned_at" ON "balikin_scan_logs"("scanned_at")`);
    console.log('✅ Scan logs table indexes created');

    // Composite index for admin dashboard
    console.log('📊 Adding composite index for admin dashboard...');
    await db.execute(sql`CREATE INDEX IF NOT EXISTS "idx_tags_owner_created_composite" ON "balikin_tags"("owner_id", "created_at")`);
    console.log('✅ Composite index created');

    console.log('🎉 All performance indexes created successfully!');
    console.log('');
    console.log('Expected improvements:');
    console.log('  • Admin queries: 3-8s → <500ms');
    console.log('  • Authentication: Faster role lookups');
    console.log('  • Dashboard load: 104s → <5s');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    process.exit(1);
  }
}

// Run the script
addPerformanceIndexes().then(() => {
  console.log('✅ Script completed successfully');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
