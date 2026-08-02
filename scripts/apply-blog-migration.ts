import { drizzle } from 'drizzle-orm/node-postgres';
import { sql } from 'drizzle-orm';
import { config } from 'dotenv';
import { Pool } from 'pg';
import fs from 'fs';

// Load .env.local
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function applyMigration() {
  try {
    console.log('Applying blog migration...');

    // Read the migration file
    const migration = fs.readFileSync('./drizzle/0008_colorful_dagger.sql', 'utf-8');

    // Execute the migration
    await db.execute(sql.raw(migration));

    console.log('✅ Migration applied successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

applyMigration();
