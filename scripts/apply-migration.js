require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');
const fs = require('fs');

const client = new Client(process.env.DATABASE_URL);

async function applyMigration() {
  try {
    await client.connect();
    console.log('Connected to database');

    const migrationSQL = fs.readFileSync('./drizzle/0009_fresh_centennial.sql', 'utf8');

    console.log('Applying migration...');
    await client.query(migrationSQL);
    console.log('Migration applied successfully!');

    await client.end();
  } catch (error) {
    console.error('Error applying migration:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    process.exit(1);
  }
}

applyMigration();
