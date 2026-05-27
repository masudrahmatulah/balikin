import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// ============================================================================
// CONSTANTS
// ============================================================================

const DEFAULT_POOL_SIZE = 5;
const DEFAULT_CONNECT_TIMEOUT_MS = 30_000;
const DEFAULT_IDLE_TIMEOUT_MS = 20_000;
const DEFAULT_MAX_LIFETIME_MS = 60 * 60_000;
const DEFAULT_STATEMENT_TIMEOUT_MS = 10_000;

// ============================================================================
// DATABASE CONFIGURATION
// ============================================================================

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const isSupabase = connectionString.includes('supabase.com');
const poolMax = Number(process.env.DATABASE_POOL_MAX) || DEFAULT_POOL_SIZE;

const options = {
  prepare: true,
  ssl: isSupabase ? 'require' as const : undefined,
  max: Number.isFinite(poolMax) && poolMax > 0 ? poolMax : DEFAULT_POOL_SIZE,
  connect_timeout: Number(process.env.DATABASE_CONNECT_TIMEOUT) || DEFAULT_CONNECT_TIMEOUT_MS,
  idle_timeout: Number(process.env.DATABASE_IDLE_TIMEOUT) || DEFAULT_IDLE_TIMEOUT_MS,
  max_lifetime: Number(process.env.DATABASE_MAX_LIFETIME) || DEFAULT_MAX_LIFETIME_MS,
  statement_timeout: Number(process.env.DATABASE_STATEMENT_TIMEOUT) || DEFAULT_STATEMENT_TIMEOUT_MS,
  types: {
    date: {
      to: 1184,
      from: [1082, 1083, 1114, 1184],
    },
  },
};

const globalForDb = globalThis as typeof globalThis & {
  __balikinPostgresClient?: ReturnType<typeof postgres>;
};

const client = globalForDb.__balikinPostgresClient ?? postgres(connectionString, options);

if (process.env.NODE_ENV !== 'production') {
  globalForDb.__balikinPostgresClient = client;
}

export const db = drizzle({ client, schema });

// Re-export schema for convenience
export * from './schema';
