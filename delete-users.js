const postgres = require('postgres');
require('dotenv').config({ path: '.env.local' });

async function deleteUsers() {
  const sql = postgres(process.env.DATABASE_URL);

  try {
    console.log('✅ Connected to database');

    const emailsToDelete = [
      '01rahmanzain@gmail.com',
      'maserudyun@gmail.com',
      'masudpay@gmail.com',
      'marenlennert22@gmail.com',
      'rahmat0330@gmail.com',
    ];

    console.log('\n🗑️  Deleting users:', emailsToDelete);

    for (const email of emailsToDelete) {
      console.log(`\n--- Processing: ${email} ---`);

      // Check if user exists
      const user = await sql`
        SELECT id, email, name, role
        FROM balikin_user
        WHERE email = ${email}
      `;

      if (user.length === 0) {
        console.log(`⚠️  User ${email} not found`);
        continue;
      }

      const userId = user[0].id;
      console.log(`📍 Found user: ${user[0].name} (${user[0].role})`);

      // Delete sessions
      const deletedSessions = await sql`
        DELETE FROM balikin_session
        WHERE user_id = ${userId}
        RETURNing id
      `;
      console.log(`🗑️  Deleted ${deletedSessions.count} sessions`);

      // Delete accounts (including Google accounts)
      const deletedAccounts = await sql`
        DELETE FROM balikin_account
        WHERE user_id = ${userId}
        RETURNing id, provider_id
      `;
      if (deletedAccounts.count > 0) {
        console.log(`🗑️  Deleted accounts:`);
        for (const acc of deletedAccounts) {
          console.log(`   - ${acc.provider_id}: ${acc.id}`);
        }
      } else {
        console.log(`🗑️  No accounts found`);
      }

      // Delete verification records
      const deletedVerifications = await sql`
        DELETE FROM balikin_verification
        WHERE identifier = ${email}
        RETURNing id
      `;
      console.log(`🗑️  Deleted ${deletedVerifications.count} verification records`);

      // Check and delete sticker orders
      const deletedOrders = await sql`
        DELETE FROM balikin_sticker_orders
        WHERE user_id = ${userId}
        RETURNing id
      `;
      if (deletedOrders.count > 0) {
        console.log(`🗑️  Deleted ${deletedOrders.count} sticker orders`);
      }

      // Finally delete the user
      const deletedUser = await sql`
        DELETE FROM balikin_user
        WHERE id = ${userId}
        RETURNing id, email
      `;
      console.log(`✅ Deleted user: ${deletedUser[0].email}`);
    }

    console.log('\n✅ Deletion complete!');

    // Show remaining users
    const remainingUsers = await sql`
      SELECT email, role, name
      FROM balikin_user
      ORDER BY created_at DESC
    `;

    console.log(`\n📋 Remaining users (${remainingUsers.length}):`);
    for (const user of remainingUsers) {
      console.log(`- ${user.email} (${user.role})`);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.end();
  }
}

deleteUsers();
