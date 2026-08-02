const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function runMigration() {
  const client = await pool.connect();
  try {
    const sqlFile = './drizzle/0018_campaign_leads.sql';
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    const statements = sql
      .split('--> statement-breakpoint')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    console.log(`📦 Executing ${statements.length} statements from migration...\n`);
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i].trim();
      if (stmt) {
        console.log(`[${i + 1}/${statements.length}] `, stmt.substring(0, 70) + '...');
        await client.query(stmt);
        console.log('✓ Success\n');
      }
    }
    
    console.log('✅ Migration completed successfully!');
    console.log('\n📊 Table balikin_campaign_leads is now ready in your database.');
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.release();
  }
}

runMigration()
  .then(() => pool.end())
  .catch(err => {
    pool.end();
    process.exit(1);
  });
