import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isSupabase = connectionString.includes('supabase.com');
const poolMax = Number(process.env.DATABASE_POOL_MAX || (isSupabase ? 1 : 5));

const options = {
  prepare: false,
  ssl: isSupabase ? 'require' as const : undefined,
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : 1,
  connect_timeout: 30,
  idle_timeout: 20,
  max_lifetime: 60 * 30,
  // Add retry logic for Supabase
  onnotice: () => {},
  onparameter: () => {},
};

const globalForDb = globalThis as typeof globalThis & {
  __balikinPostgresClient?: ReturnType<typeof postgres>;
};

const client = globalForDb.__balikinPostgresClient ?? postgres(connectionString, options);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__balikinPostgresClient = client;
}

export const db = drizzle({ client, schema });
