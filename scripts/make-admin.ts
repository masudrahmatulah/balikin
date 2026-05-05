#!/usr/bin/env tsx
/**
 * Make Admin Script
 *
 * Usage: npx tsx scripts/make-admin.ts <email>
 *
 * This script updates a user's role to 'admin' in the database.
 * Use this to grant admin privileges to existing users.
 */

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

async function makeAdmin(email: string) {
  if (!email) {
    console.error('❌ Error: Email address is required');
    console.error('Usage: npx tsx scripts/make-admin.ts <email>');
    process.exit(1);
  }

  // Normalize email to lowercase for consistent lookup
  const normalizedEmail = email.toLowerCase().trim();

  console.log(`\n🔧 Granting admin privileges to: ${normalizedEmail}\n`);

  try {
    // Find user by email
    console.log(`🔍 Looking for user with email: ${normalizedEmail}`);

    const users = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail));

    if (users.length === 0) {
      console.log(`❌ User not found: ${normalizedEmail}`);
      console.log(`\n💡 Suggestions:`);
      console.log(`   - Check if the email address is correct`);
      console.log(`   - Verify the user has completed registration`);
      console.log(`   - Run: npm run list-users (to see all users)\n`);
      process.exit(1);
    }

    const targetUser = users[0];

    // Display current user state
    console.log(`\n📋 Current user state:\n`);
    console.log(`   ID: ${targetUser.id}`);
    console.log(`   Email: ${targetUser.email}`);
    console.log(`   Name: ${targetUser.name || 'Not set'}`);
    console.log(`   Current Role: ${targetUser.role}`);
    console.log(`   Created: ${targetUser.createdAt}`);
    console.log(`   Updated: ${targetUser.updatedAt}`);

    // Check if already admin
    if (targetUser.role === 'admin') {
      console.log(`\n✅ User is already admin! No changes needed.\n`);
      process.exit(0);
    }

    console.log(`\n🔄 Updating user role from '${targetUser.role}' to 'admin'...\n`);

    // Update user role to admin
    await db
      .update(user)
      .set({
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(user.id, targetUser.id));

    console.log(`✅ Success! User ${normalizedEmail} is now admin!\n`);

    // Verify the change
    const updated = await db
      .select()
      .from(user)
      .where(eq(user.id, targetUser.id));

    if (updated.length > 0) {
      console.log(`📋 Updated user state:\n`);
      console.log(`   ID: ${updated[0].id}`);
      console.log(`   Email: ${updated[0].email}`);
      console.log(`   Name: ${updated[0].name || 'Not set'}`);
      console.log(`   New Role: ${updated[0].role}`);
      console.log(`   Updated At: ${updated[0].updatedAt}\n`);
    }

    console.log(`💡 Next steps:\n`);
    console.log(`   1. Ask the user to log out and log back in`);
    console.log(`   2. User should now be able to access /admin`);
    console.log(`   3. Verify admin access: npm run test-admin\n`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error updating user role:`);
    console.error(error instanceof Error ? error.message : String(error));
    console.error(`\n💡 Suggestions:`);
    console.error(`   - Check database connection`);
    console.error(`   - Verify environment variables are set correctly`);
    console.error(`   - Ensure database is accessible`);
    console.error(`   - Check if user table exists and has correct schema\n`);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
makeAdmin(email);