#!/usr/bin/env tsx
/**
 * Check and update user role to admin
 * Usage: npx tsx scripts/check-admin.ts <user-email>
 */

import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

async function checkAndMakeAdmin(email: string) {
  if (!email) {
    console.error('Usage: npx tsx scripts/check-admin.ts <user-email>');
    process.exit(1);
  }

  try {
    console.log(`🔍 Looking for user with email: ${email}`);

    // Find user by email with timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
    );

    const queryPromise = db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      })
      .from(user)
      .where(eq(user.email, email.toLowerCase()));

    const users = await Promise.race([queryPromise, timeoutPromise]) as any[];

    if (users.length === 0) {
      console.error(`❌ User with email "${email}" not found`);
      console.log('\n💡 Tips:');
      console.log('   - Pastikan email sudah terdaftar di sistem');
      console.log('   - Coba login dulu, baru check role');
      console.log('   - Email case-sensitive (gunakan lowercase)');
      process.exit(1);
    }

    const targetUser = users[0];
    console.log('\n✅ User found:');
    console.log('   ID:', targetUser.id);
    console.log('   Email:', targetUser.email);
    console.log('   Name:', targetUser.name || 'No name');
    console.log('   Current Role:', targetUser.role);
    console.log('   Created:', targetUser.createdAt);

    if (targetUser.role === 'admin') {
      console.log('\n✨ User already has admin role!');
      process.exit(0);
    }

    console.log('\n🔧 Updating user role to admin...');

    // Update user role to admin with timeout
    const updateTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Update timeout after 10 seconds')), 10000)
    );

    const updatePromise = db
      .update(user)
      .set({
        role: 'admin',
        updatedAt: new Date()
      })
      .where(eq(user.id, targetUser.id))
      .returning();

    await Promise.race([updatePromise, updateTimeoutPromise]);

    console.log('✅ Success! User has been made admin');

    // Verify the change with timeout
    const verifyTimeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Verification timeout after 10 seconds')), 10000)
    );

    const verifyPromise = db
      .select({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      })
      .from(user)
      .where(eq(user.id, targetUser.id));

    const verified = await Promise.race([verifyPromise, verifyTimeoutPromise]) as any[];

    console.log('\n✅ Verified updated user:');
    console.log('   ID:', verified[0].id);
    console.log('   Email:', verified[0].email);
    console.log('   Name:', verified[0].name);
    console.log('   New Role:', verified[0].role);

    console.log('\n🎉 Admin access granted!');
    console.log('   Sekarang Anda bisa mengakses: /admin');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];
checkAndMakeAdmin(email);