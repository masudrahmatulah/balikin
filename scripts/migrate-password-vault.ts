import { config } from 'dotenv';
import postgres from 'postgres';

config({ path: '.env.local' });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error('DATABASE_URL environment variable is not set');

const sql = postgres(connectionString, {
  ssl: connectionString.includes('supabase.com') ? 'require' : undefined,
  prepare: false,
});

async function migrate() {
  try {
    await sql`
    CREATE TABLE IF NOT EXISTS balikin_password_vault_items (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      app_id text NOT NULL DEFAULT 'balikin_id',
      user_id text NOT NULL REFERENCES balikin_user(id) ON DELETE CASCADE,
      ciphertext text NOT NULL,
      iv text NOT NULL,
      salt text NOT NULL,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )
    `;
    await sql`
    CREATE INDEX IF NOT EXISTS idx_password_vault_items_user
    ON balikin_password_vault_items (app_id, user_id, updated_at DESC)
    `;
    console.log('Password vault table is ready.');
  } finally {
    await sql.end();
  }
}

migrate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
