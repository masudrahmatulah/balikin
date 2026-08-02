import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function addActivationTokenColumn() {
  const isSupabase = connectionString.includes('supabase.com');
  const client = postgres(connectionString, {
    prepare: false,
    ssl: isSupabase ? 'require' as const : undefined,
  });

  try {
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_token text;`);
    console.log('✓ activation_token column added successfully!');
  } catch (error) {
    console.error('✗ Error adding column:', error);
  } finally {
    await client.end();
  }
}

addActivationTokenColumn().catch(console.error);
