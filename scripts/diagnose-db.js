/**
 * Database Performance Diagnostics
 * Run this to identify slow queries and performance bottlenecks
 */

const { performance } = require('perf_hooks');

async function diagnoseDatabase() {
  console.log('🔍 Starting Database Performance Diagnostics...\n');

  const startTime = performance.now();

  try {
    // Test basic connection
    console.log('1. Testing database connection...');
    const { db } = await import('@/db');
    const { user, tags } = await import('@/db/schema');
    const { count } = await import('drizzle-orm');

    const connectionTest = performance.now();
    await db.select({ count: count() }).from(user).limit(1);
    console.log(`   ✅ Connection OK (${Math.round(performance.now() - connectionTest)}ms)\n`);

    // Test user count query
    console.log('2. Testing user count query...');
    const userCountStart = performance.now();
    const userCount = await db.select({ count: count() }).from(user);
    console.log(`   📊 Total users: ${userCount[0]?.count || 0}`);
    console.log(`   ⏱️  Time: ${Math.round(performance.now() - userCountStart)}ms\n`);

    // Test tag count query
    console.log('3. Testing tag count query...');
    const tagCountStart = performance.now();
    const tagCount = await db.select({ count: count() }).from(tags);
    console.log(`   📊 Total tags: ${tagCount[0]?.count || 0}`);
    console.log(`   ⏱️  Time: ${Math.round(performance.now() - tagCountStart)}ms\n`);

    // Test users with tags query (the problematic one)
    console.log('4. Testing users with tags query...');
    const usersWithTagsStart = performance.now();
    const users = await db.query.user.findMany({
      orderBy: (u, { desc }) => [desc(u.createdAt)],
      limit: 100,
    });
    console.log(`   👥 Users fetched: ${users.length}`);
    console.log(`   ⏱️  Users query time: ${Math.round(performance.now() - usersWithTagsStart)}ms`);

    // Test tag counts aggregation
    const tagCountsStart = performance.now();
    const { scanLogs } = await import('@/db/schema');
    const tagCounts = await db
      .select({
        ownerId: tags.ownerId,
        count: count(),
      })
      .from(tags)
      .groupBy(tags.ownerId);
    console.log(`   🏷️  Tag counts aggregated: ${tagCounts.length}`);
    console.log(`   ⏱️  Tag counts time: ${Math.round(performance.now() - tagCountsStart)}ms`);

    const totalUsersWithTagsTime = Math.round(performance.now() - usersWithTagsStart);
    console.log(`   ⏱️  Total users with tags query time: ${totalUsersWithTagsTime}ms\n`);

    // Test scan logs query (likely the bottleneck)
    console.log('5. Testing scan logs query...');
    const scanLogsStart = performance.now();
    const { scanLogs: sl } = await import('@/db/schema');
    const scanLogCount = await db.select({ count: count() }).from(sl);
    console.log(`   📋 Total scan logs: ${scanLogCount[0]?.count || 0}`);
    console.log(`   ⏱️  Time: ${Math.round(performance.now() - scanLogsStart)}ms\n`);

    // Recommendations
    console.log('💡 Recommendations:');
    if (totalUsersWithTagsTime > 5000) {
      console.log('   ❌ Users with tags query is very slow!');
      console.log('   🔧 Consider:');
      console.log('      - Adding database indexes on commonly queried columns');
      console.log('      - Using pagination instead of loading all users at once');
      console.log('      - Caching query results');
    }

    if ((scanLogCount[0]?.count || 0) > 10000) {
      console.log('   ⚠️  Large number of scan logs detected');
      console.log('   🔧 Consider:');
      console.log('      - Archiving old scan logs');
      console.log('      - Adding indexes on scanLogs.tagId');
      console.log('      - Using summary tables instead of raw scan logs');
    }

    console.log(`\n✅ Diagnostics complete in ${Math.round(performance.now() - startTime)}ms`);

  } catch (error) {
    console.error('❌ Diagnostics failed:', error);
    process.exit(1);
  }
}

// Run the diagnostics
diagnoseDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
