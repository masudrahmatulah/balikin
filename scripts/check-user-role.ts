import { db } from '../db';
import { user } from '../db/schema';
import { eq } from 'drizzle-orm';

/**
 * Check User Role Script
 *
 * Usage: npx tsx scripts/check-user-role.ts <email>
 *
 * This script checks the current role of a user in the database.
 * It displays user information and their current role, with suggestions
 * if the user is not an admin.
 */

async function checkUserRole(email: string) {
  if (!email) {
    console.error('❌ Error: Email address is required');
    console.error('Usage: npx tsx scripts/check-user-role.ts <email>');
    process.exit(1);
  }

  // Normalize email to lowercase for consistent lookup
  const normalizedEmail = email.toLowerCase().trim();

  console.log(`\n🔍 Checking user role for: ${normalizedEmail}\n`);

  try {
    // Query database for user
    const dbUser = await db.query.user.findFirst({
      where: eq(user.email, normalizedEmail),
    });

    if (!dbUser) {
      console.log(`❌ User not found: ${normalizedEmail}`);
      console.log(`\n💡 Suggestions:`);
      console.log(`   - Check if the email address is correct`);
      console.log(`   - Verify the user has completed the registration process`);
      console.log(`   - Check if the user exists in the database`);
      console.log(`   - Run: npm run list-users (to see all users)\n`);
      process.exit(1);
    }

    // Display user information
    console.log(`✅ User found:\n`);
    console.log(`   ID: ${dbUser.id}`);
    console.log(`   Email: ${dbUser.email}`);
    console.log(`   Name: ${dbUser.name || 'Not set'}`);
    console.log(`   Current Role: ${dbUser.role}`);
    console.log(`   Created: ${dbUser.createdAt}`);
    console.log(`   Updated: ${dbUser.updatedAt}`);

    // Check if user is admin
    if (dbUser.role !== 'admin') {
      console.log(`\n⚠️  User is NOT admin. Current role: "${dbUser.role}"`);
      console.log(`\n💡 To make this user admin, run:\n`);
      console.log(`   npm run make-admin ${normalizedEmail}`);
      console.log(`   or`);
      console.log(`   npx tsx scripts/make-admin.ts ${normalizedEmail}\n`);
    } else {
      console.log(`\n✅ User is already admin! No action needed.\n`);
    }

  } catch (error) {
    console.error(`\n❌ Error checking user role:`);
    console.error(error instanceof Error ? error.message : String(error));
    console.error(`\n💡 Suggestions:`);
    console.error(`   - Check database connection`);
    console.error(`   - Verify environment variables are set correctly`);
    console.error(`   - Ensure database is accessible\n`);
    process.exit(1);
  }
}

// Get email from command line argument
const emailArg = process.argv[2];

if (!emailArg) {
  console.error('\n❌ Error: Email address is required\n');
  console.error('Usage: npx tsx scripts/check-user-role.ts <email>\n');
  console.error('Example: npx tsx scripts/check-user-role.ts user@example.com\n');
  process.exit(1);
}

// Run the check
checkUserRole(emailArg);