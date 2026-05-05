#!/usr/bin/env tsx
/**
 * List all users in the database
 * Usage: npx tsx scripts/list-users.ts
 */

import { db } from "@/db";
import { user } from "@/db/schema";

async function listUsers() {
  try {
    const users = await db.select().from(user);
    console.log(`Found ${users.length} users in database:`);
    users.forEach(u => {
      console.log(`- ${u.email} (${u.name || 'No name'}) - Role: ${u.role} - ID: ${u.id}`);
    });

    if (users.length === 0) {
      console.log('No users found. You need to create a user first.');
    }
  } catch (error) {
    console.error('Error listing users:', error);
    process.exit(1);
  }
}

listUsers();