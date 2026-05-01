import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../db/schema';
import fs from 'fs';
import path from 'path';

const connectionString = process.env.DATABASE_URL!;

const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function runMigration() {
  console.log('Running migration...');

  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '../drizzle/0002_strong_synch.sql'),
    'utf-8'
  );

  try {
    await client.unsafe(migrationSQL);
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
