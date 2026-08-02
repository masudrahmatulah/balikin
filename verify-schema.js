require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query(`
  SELECT column_name, data_type, is_nullable, column_default
  FROM information_schema.columns 
  WHERE table_name = 'balikin_campaign_leads'
  ORDER BY ordinal_position;
`, (err, res) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('\n📋 Schema: balikin_campaign_leads\n');
    console.log('COLUMN NAME           | DATA TYPE   | NULL | DEFAULT');
    console.log('─'.repeat(65));
    res.rows.forEach(col => {
      const nullable = col.is_nullable === 'YES' ? 'Yes' : 'No';
      const def = col.column_default || '—';
      console.log(
        `${col.column_name.padEnd(20)} | ${col.data_type.padEnd(11)} | ${nullable.padEnd(4)} | ${def}`
      );
    });
  }
  
  // Check indexes
  pool.query(`
    SELECT indexname, indexdef
    FROM pg_indexes
    WHERE tablename = 'balikin_campaign_leads';
  `, (err, res) => {
    if (!err && res.rows.length > 0) {
      console.log('\n🔍 Indexes:\n');
      res.rows.forEach(idx => {
        console.log(`  ${idx.indexname}`);
      });
    }
    pool.end();
  });
});
