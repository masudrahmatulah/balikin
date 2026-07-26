require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.query('SELECT version();', (err, res) => {
  if (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  } else {
    console.log('✓ Database connected');
    console.log('Version:', res.rows[0].version.substring(0, 60) + '...');
    
    // Check if campaign_leads table exists
    pool.query(
      "SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'balikin_campaign_leads');",
      (err, res) => {
        const exists = res.rows[0].exists;
        console.log(`balikin_campaign_leads table exists: ${exists ? '✓ Yes' : '✗ No'}`);
        pool.end();
        process.exit(0);
      }
    );
  }
});
