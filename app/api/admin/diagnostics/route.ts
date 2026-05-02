import { NextResponse } from 'next/server';
import { db } from '@/db';
import { user, tags, scanLogs } from '@/db/schema';
import { count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const maxDuration = 10; // 10 second timeout

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
  );
  return Promise.race([promise, timeout]);
}

export async function GET() {
  const results = {
    tests: [] as Array<{
      name: string;
      status: 'success' | 'warning' | 'error' | 'skipped';
      duration: number;
      details: string;
    }>,
    summary: {
      totalTests: 0,
      passed: 0,
      warnings: 0,
      errors: 0,
      skipped: 0,
    },
    recommendations: [] as string[],
  };

  const test = async (
    name: string,
    timeoutMs: number,
    testFn: () => Promise<{ duration: number; details: string; status: 'success' | 'warning' | 'error' }>
  ) => {
    const start = Date.now();
    try {
      const result = await withTimeout(testFn(), timeoutMs, `Test timeout after ${timeoutMs}ms`);
      results.tests.push({
        name,
        duration: Date.now() - start,
        ...result,
      });
    } catch (error) {
      results.tests.push({
        name,
        status: 'error',
        duration: Date.now() - start,
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  // Test 1: Database Connection (with timeout)
  await test('Database Connection', 2000, async () => {
    const start = Date.now();
    try {
      await db.select({ count: count() }).from(user).limit(1);
      const duration = Date.now() - start;

      if (duration > 1000) {
        return {
          status: 'warning' as const,
          details: `Connected but slow (${duration}ms - should be <100ms)`,
        };
      }
      return {
        status: 'success' as const,
        details: `Connected successfully (${duration}ms)`,
      };
    } catch (error) {
      throw new Error(`Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  });

  // Test 2: User Count Query (with timeout)
  await test('User Count Query', 3000, async () => {
    const start = Date.now();
    const userCount = await db.select({ count: count() }).from(user);
    const duration = Date.now() - start;
    const countValue = userCount[0]?.count || 0;

    if (duration > 1000) {
      return {
        status: 'warning' as const,
        details: `${countValue} users (${duration}ms - slow, should be <100ms)`,
      };
    }
    return {
      status: 'success' as const,
      details: `${countValue} users (${duration}ms)`,
    };
  });

  // Test 3: Tag Count Query (with timeout)
  await test('Tag Count Query', 3000, async () => {
    const start = Date.now();
    const tagCount = await db.select({ count: count() }).from(tags);
    const duration = Date.now() - start;
    const countValue = tagCount[0]?.count || 0;

    if (duration > 1000) {
      return {
        status: 'warning' as const,
        details: `${countValue} tags (${duration}ms - slow, should be <100ms)`,
      };
    }
    return {
      status: 'success' as const,
      details: `${countValue} tags (${duration}ms)`,
    };
  });

  // Test 4: Skip slow tests initially
  results.tests.push({
    name: 'Users Query Test',
    status: 'skipped',
    duration: 0,
    details: 'Skipped to avoid timeout - known performance issue',
  });

  results.tests.push({
    name: 'Tag Aggregation Test',
    status: 'skipped',
    duration: 0,
    details: 'Skipped to avoid timeout - known performance issue',
  });

  results.recommendations.push('Based on your logs, tag count takes 3+ seconds and users query takes 8+ seconds');
  results.recommendations.push('Add database indexes: CREATE INDEX idx_tags_owner_id ON tags(owner_id)');
  results.recommendations.push('Add database indexes: CREATE INDEX idx_user_created_at ON user(created_at)');
  results.recommendations.push('Consider archiving old scan logs if you have more than 50,000 records');

  // Calculate summary
  results.summary.totalTests = results.tests.length;
  results.summary.passed = results.tests.filter(t => t.status === 'success').length;
  results.summary.warnings = results.tests.filter(t => t.status === 'warning').length;
  results.summary.errors = results.tests.filter(t => t.status === 'error').length;
  results.summary.skipped = results.tests.filter(t => t.status === 'skipped').length;

  return NextResponse.json(results);
}
