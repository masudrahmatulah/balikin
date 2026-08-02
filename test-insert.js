require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const testEmail = 'test@balikin.local';
const testCampaign = 'first-launch';

pool.query(
  `INSERT INTO balikin_campaign_leads (email, campaign_name, source, metadata) 
   VALUES ($1, $2, $3, $4)
   RETURNING id, email, campaign_name, created_at;`,
  [testEmail, testCampaign, 'test', { test_run: true }],
  (err, res) => {
    if (err) {
      console.error('❌ Insert failed:', err.message);
    } else {
      const lead = res.rows[0];
      console.log('✅ Test insert successful!\n');
      console.log('Lead Data:');
      console.log(`  ID:           ${lead.id}`);
      console.log(`  Email:        ${lead.email}`);
      console.log(`  Campaign:     ${lead.campaign_name}`);
      console.log(`  Created At:   ${lead.created_at}`);
    }
    
    // Query to verify
    pool.query(
      `SELECT COUNT(*) as total_leads, COUNT(DISTINCT campaign_name) as campaigns 
       FROM balikin_campaign_leads;`,
      (err, res) => {
        if (!err) {
          console.log(`\n📊 Stats:`);
          console.log(`  Total leads in DB: ${res.rows[0].total_leads}`);
          console.log(`  Campaigns tracked: ${res.rows[0].campaigns}`);
        }
        pool.end();
      }
    );
  }
);
