import { config } from 'dotenv';
config({ path: '.env.local' });
import { db } from '../db/index.ts';
import { sql } from 'drizzle-orm';

async function addActivationTokenColumn() {
  const migration = `
-- Add activation_token column to tags table
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_token text;
`;

  try {
    await db.execute(sql.raw(migration));
    console.log('✓ activation_token column added successfully!');
  } catch (error) {
    console.error('✗ Error adding column:', error.message);
  }
}

addActivationTokenColumn().catch(console.error);
