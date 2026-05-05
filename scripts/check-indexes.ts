import { db } from '../db';
import { sql } from 'drizzle-orm';

async function checkIndexes() {
  try {
    console.log('🔍 Checking if indexes exist...\n');

    // Check tables
    console.log('📊 Checking Balikin tables...');
    const tablesResult = await db.execute(sql`
      SELECT tablename
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename LIKE 'balikin_%'
      ORDER BY tablename;
    `);

    const tables = (tablesResult as any).rows as any[] || [];
    console.log('Tables found:', tables.length > 0 ? tables.map(r => r.tablename).join(', ') : 'No tables found');

    // Check indexes
    console.log('\n📊 Checking indexes on Balikin tables...');
    const indexesResult = await db.execute(sql`
      SELECT
        tablename,
        indexname,
        indexdef
      FROM pg_indexes
      WHERE tablename LIKE 'balikin_%'
      ORDER BY tablename, indexname;
    `);

    if (indexesResult.rows.length === 0) {
      console.log('❌ No indexes found on Balikin tables!');
    } else {
      console.log(`✅ Found ${indexesResult.rows.length} indexes:`);
      indexesResult.rows.forEach((row: any) => {
        console.log(`  • ${row.tablename}: ${row.indexname}`);
      });
    }

    // Check if specific indexes exist
    console.log('\n🔍 Checking for our performance indexes...');
    const criticalIndexes = [
      'idx_balikin_user_email',
      'idx_balikin_user_role',
      'idx_tags_owner_id',
      'idx_tags_created_at',
    ];

    for (const indexName of criticalIndexes) {
      const result = await db.execute(sql`
        SELECT 1 as exists
        FROM pg_indexes
        WHERE indexname = ${indexName};
      `);

      if (result.rows.length > 0) {
        console.log(`✅ ${indexName} exists`);
      } else {
        console.log(`❌ ${indexName} NOT FOUND`);
      }
    }

    // Test query performance
    console.log('\n⚡ Testing query performance...');
    const start = Date.now();
    try {
      await db.execute(sql`
        SELECT * FROM balikin_user
        WHERE email = 'test@example.com'
        LIMIT 1;
      `);
      const duration = Date.now() - start;
      console.log(`Query completed in ${duration}ms`);
      if (duration > 1000) {
        console.log('⚠️ WARNING: Query is slow (>1s)');
      }
    } catch (error) {
      console.log('Note: Query failed (table might not exist)');
    }

  } catch (error) {
    console.error('❌ Error checking indexes:', error);
  }
}

checkIndexes().then(() => {
  console.log('\n✅ Check completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
