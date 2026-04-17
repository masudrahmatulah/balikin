const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function testDatabaseConnection() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('✅ Testing database connection to Supabase...\n');

    // Test 1: Basic connection
    const result = await sql`SELECT NOW()`;
    console.log('✅ Database connection successful!');
    console.log(`   Server time: ${result[0].now}\n`);

    // Test 2: Check user table
    const tableInfo = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'balikin_user'
      ORDER BY ordinal_position
    `;

    console.log('📋 balikin_user table structure:');
    for (const col of tableInfo) {
      const nullable = col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL';
      const defaultVal = col.column_default ? `DEFAULT ${col.column_default}` : '';
      console.log(`   - ${col.column_name}: ${col.data_type} ${nullable} ${defaultVal}`);
    }

    // Test 3: Try to insert a test user
    console.log('\n🧪 Testing user insertion...');

    const testUserId = `test_${Date.now()}`;
    const testEmail = `test_${Date.now()}@example.com`;

    console.log(`   Inserting user: ${testEmail}`);

    const insertedUser = await sql`
      INSERT INTO balikin_user (id, email, name, app_id, role)
      VALUES (${testUserId}, ${testEmail}, 'Test User', 'balikin_id', 'user')
      RETURNING id, email, name, app_id, role, created_at
    `;

    console.log('✅ User inserted successfully!');
    console.log(`   ID: ${insertedUser[0].id}`);
    console.log(`   Email: ${insertedUser[0].email}`);
    console.log(`   App ID: ${insertedUser[0].app_id}`);
    console.log(`   Role: ${insertedUser[0].role}`);

    // Clean up test user
    await sql`DELETE FROM balikin_user WHERE id = ${testUserId}`;
    console.log('\n🧹 Test user cleaned up');

    // Test 4: Check current users
    const userCount = await sql`SELECT COUNT(*) as count FROM balikin_user`;
    console.log(`\n📊 Current total users: ${userCount[0].count}`);

    // Test 5: Check Google accounts
    const googleAccounts = await sql`
      SELECT COUNT(*) as count FROM balikin_account WHERE provider_id = 'google'
    `;
    console.log(`📊 Current Google accounts: ${googleAccounts[0].count}`);

    console.log('\n✅ All database tests passed!');

  } catch (error) {
    console.error('\n❌ Database error:', error.message);
    console.error('Error details:', error);

    // Check specific error types
    if (error.message.includes('connection')) {
      console.error('\n🔍 This appears to be a CONNECTION ERROR.');
      console.error('   Possible causes:');
      console.error('   - Network/firewall issues');
      console.error('   - Supabase credentials incorrect');
      console.error('   - Supabase project paused/suspended');
    } else if (error.message.includes('permission') || error.message.includes('access')) {
      console.error('\n🔍 This appears to be a PERMISSION ERROR.');
      console.error('   Possible causes:');
      console.error('   - Database user permissions insufficient');
      console.error('   - Table-level permissions issue');
    } else if (error.message.includes('constraint') || error.message.includes('unique')) {
      console.error('\n🔍 This appears to be a CONSTRAINT ERROR.');
      console.error('   Possible causes:');
      console.error('   - Unique constraint violation');
      console.error('   - NOT NULL constraint violation');
    }

  } finally {
    await sql.end();
  }
}

testDatabaseConnection();
