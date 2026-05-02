import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Load environment variables FIRST
config({ path: '.env.local' });

import { db } from '../db';
import { sql } from 'drizzle-orm';

async function applyMigration() {
  try {
    console.log('🔄 Reading migration file...');

    const migrationPath = join(process.cwd(), 'drizzle', '0003_chunky_jocasta.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('✅ Migration file loaded');
    console.log('🔄 Applying migration to database...');

    // Split by statement breakpoint and execute each statement
    const statements = migrationSQL.split('--> statement-breakpoint').filter(s => s.trim());

    let successCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim();
      if (statement) {
        try {
          console.log(`   Executing statement ${i + 1}/${statements.length}...`);
          await db.execute(sql.raw(statement));
          successCount++;
        } catch (error: any) {
          // Skip if object already exists
          const { code } = error.cause || error;
          if (code === '42701' || // column already exists
              code === '42P07' || // table already exists
              code === '42P16' || // constraint already exists
              code === '42P17') { // constraint already exists (duplicate)
            console.log(`   ⏭️  Skipped (already exists)`);
            skippedCount++;
          } else {
            throw error;
          }
        }
      }
    }

    console.log(`\n✅ Migration completed!`);
    console.log(`   ✨ Successfully executed: ${successCount} statements`);
    console.log(`   ⏭️  Skipped (already exists): ${skippedCount} statements`);

    console.log('✅ Migration applied successfully!');
    console.log('📊 New tables created:');
    console.log('   - balikin_audit_logs');
    console.log('   - balikin_material_inventory');
    console.log('   - balikin_print_queue');
    console.log('   - balikin_shipping_tracking');
    console.log('   - balikin_suspension_log');
    console.log('   - Added columns to balikin_tags');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

applyMigration();
