import { db } from "@/db";
import { sql } from "drizzle-orm";

/**
 * Get approximate row count from PostgreSQL using reltuples
 * This is much faster than COUNT(*) on large tables and returns instantly
 *
 * @param tableName - The table name (with prefix if applicable, e.g., "balikin_tags")
 * @returns Approximate row count as number, or 0 if table not found or query fails
 */
export async function getApproximateCount(tableName: string): Promise<number> {
  try {
    // Try the PostgreSQL reltuples approach
    const result = await db.execute(
      sql`SELECT COALESCE(reltuples::bigint, 0) as count FROM pg_class WHERE relname = ${tableName}`
    );

    // Handle different result structures from different database drivers
    let rows: any[] = [];

    if (result && typeof result === 'object') {
      // Drizzle postgres-js result has 'rows' property
      if ('rows' in result && Array.isArray(result.rows)) {
        rows = result.rows;
      }
      // Sometimes the result might be the rows directly
      else if (Array.isArray(result)) {
        rows = result;
      }
    }

    // Get the count from the first row
    if (rows.length > 0 && rows[0]) {
      const count = rows[0].count;
      if (count) {
        const numCount = Number(count);
        // Only return if it's a reasonable number (> 0)
        return numCount > 0 ? numCount : 0;
      }
    }

    return 0;
  } catch (error) {
    // On Vercel, raw SQL queries may fail - return 0 as fallback
    console.warn(`Failed to get approximate count for ${tableName}, returning 0:`, error instanceof Error ? error.message : String(error));
    return 0;
  }
}

/**
 * Get approximate count for tags table (the largest table)
 */
export async function getTagsApproximateCount(): Promise<number> {
  const count = await getApproximateCount("balikin_tags");
  return count ?? 0;
}

/**
 * Create a query with timeout protection
 * Returns the query result or a fallback value if it times out
 *
 * @param queryFn - The query function to execute
 * @param fallback - Fallback value to return on timeout
 * @param timeoutMs - Timeout in milliseconds (default: 5000)
 * @returns Query result or fallback value
 */
export async function withQueryTimeout<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  timeoutMs: number = 5000
): Promise<T> {
  return Promise.race([
    queryFn(),
    new Promise<T>((resolve) =>
      setTimeout(() => {
        console.warn(`Query timed out after ${timeoutMs}ms, using fallback`);
        resolve(fallback);
      }, timeoutMs)
    ),
  ]);
}