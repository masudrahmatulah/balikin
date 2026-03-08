import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { config } from 'dotenv';
import * as schema from './schema';

config({ path: '.env.local' });
config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isSupabase = connectionString.includes('supabase.com');
const poolMax = Number(process.env.DATABASE_POOL_MAX || 5);

const options = {
  prepare: false,
  ssl: isSupabase ? 'require' as const : undefined,
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 5,
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
};

const globalForDb = globalThis as typeof globalThis & {
  __balikinPostgresClient?: ReturnType<typeof postgres>;
};

const client = globalForDb.__balikinPostgresClient ?? postgres(connectionString, options);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__balikinPostgresClient = client;
}

export const db = drizzle({ client, schema });
