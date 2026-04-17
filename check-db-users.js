const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function checkDatabase() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('✅ Connected to database');

    // Check for users with same email (case-insensitive)
    const duplicates = await sql`
      SELECT
        LOWER(email) as email_lower,
        COUNT(*) as count,
        STRING_AGG(id, ', ') as user_ids,
        STRING_AGG(role, ', ') as roles,
        STRING_AGG(app_id, ', ') as app_ids,
        STRING_AGG(email, ', ') as original_emails
      FROM balikin_user
      GROUP BY LOWER(email)
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `;

    if (duplicates.length > 0) {
      console.log('\n⚠️  Found duplicate emails:');
      for (const row of duplicates) {
        console.log(`\nEmail (lowercase): ${row.email_lower}`);
        console.log(`Original emails: ${row.original_emails}`);
        console.log(`Count: ${row.count}`);
        console.log(`User IDs: ${row.user_ids}`);
        console.log(`Roles: ${row.roles}`);
        console.log(`App IDs: ${row.app_ids}`);
      }
    } else {
      console.log('\n✅ No duplicate emails found');
    }

    // Check for accounts without proper user reference
    const orphanAccounts = await sql`
      SELECT a.id, a.account_id, a.provider_id, a.user_id
      FROM balikin_account a
      LEFT JOIN balikin_user u ON a.user_id = u.id
      WHERE u.id IS NULL
      LIMIT 10
    `;

    if (orphanAccounts.length > 0) {
      console.log('\n⚠️  Found orphan accounts (accounts without users):');
      for (const row of orphanAccounts) {
        console.log(`Account ID: ${row.account_id}, Provider: ${row.provider_id}, User ID: ${row.user_id}`);
      }
    } else {
      console.log('\n✅ No orphan accounts found');
    }

    // Show all users with Google accounts
    const googleUsers = await sql`
      SELECT
        u.id,
        u.email,
        u.name,
        u.role,
        u.app_id,
        a.account_id,
        a.provider_id
      FROM balikin_user u
      LEFT JOIN balikin_account a ON u.id = a.user_id AND a.provider_id = 'google'
      ORDER BY u.created_at DESC
      LIMIT 20
    `;

    console.log('\n📋 Recent users (including Google accounts):');
    for (const row of googleUsers) {
      const hasGoogle = row.account_id ? '✅' : '❌';
      console.log(`${hasGoogle} ${row.email} | Role: ${row.role} | App: ${row.app_id} | Google: ${row.account_id || 'None'}`);
    }

    // Check total user count
    const totalUsers = await sql`SELECT COUNT(*) as count FROM balikin_user`;
    console.log(`\n📊 Total users in database: ${totalUsers[0].count}`);

    // Check total Google accounts
    const googleAccounts = await sql`
      SELECT COUNT(*) as count FROM balikin_account WHERE provider_id = 'google'
    `;
    console.log(`📊 Total Google accounts: ${googleAccounts[0].count}`);

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await sql.end();
  }
}

checkDatabase();
