import { db } from '../db';
import { sql } from 'drizzle-orm';

async function diagnoseTables() {
  try {
    console.log('🔍 Diagnosing database tables...\n');

    // Check all tables
    console.log('📊 ALL tables in database:');
    const allTablesResult = await db.execute(sql`
      SELECT tablename, tableowner
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `);

    const allTables = (allTablesResult as any).rows as any[] || [];
    console.log('Found', allTables.length, 'tables:');
    allTables.forEach(t => {
      console.log(`  • ${t.tablename} (owner: ${t.tableowner})`);
    });

    // Check for user-related tables
    console.log('\n🔍 User-related tables:');
    const userTables = allTables.filter(t =>
      t.tablename.toLowerCase().includes('user') ||
      t.tablename.toLowerCase().includes('session') ||
      t.tablename.toLowerCase().includes('account')
    );
    if (userTables.length > 0) {
      userTables.forEach(t => console.log(`  • ${t.tablename}`));
    } else {
      console.log('  ❌ No user tables found');
    }

    // Check for tag-related tables
    console.log('\n🔍 Tag-related tables:');
    const tagTables = allTables.filter(t =>
      t.tablename.toLowerCase().includes('tag') ||
      t.tablename.toLowerCase().includes('scan')
    );
    if (tagTables.length > 0) {
      tagTables.forEach(t => console.log(`  • ${t.tablename}`));
    } else {
      console.log('  ❌ No tag tables found');
    }

    // Check indexes on tables that exist
    console.log('\n📊 Checking indexes on existing tables...');
    for (const table of allTables.slice(0, 10)) { // Limit to first 10 tables
      const indexesResult = await db.execute(sql`
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = ${table.tablename}
        ORDER BY indexname;
      `);
      const indexes = (indexesResult as any).rows as any[] || [];
      if (indexes.length > 0) {
        console.log(`\n${table.tablename} (${indexes.length} indexes):`);
        indexes.forEach(idx => console.log(`  • ${idx.indexname}`));
      }
    }

  } catch (error) {
    console.error('❌ Error diagnosing tables:', error);
  }
}

diagnoseTables().then(() => {
  console.log('\n✅ Diagnosis completed');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
