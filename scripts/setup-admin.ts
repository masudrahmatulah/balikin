/**
 * Script untuk membuat admin user pertama kali
 * Run dengan: npx tsx scripts/setup-admin.ts <email>
 *
 * Contoh: npx tsx scripts/setup-admin.ts admin@balikin.id
 */

import { db } from "../db";
import { user } from "../db/schema";
import { eq, sql } from "drizzle-orm";

const email = process.argv[2];

if (!email) {
  console.error("Usage: npx tsx scripts/setup-admin.ts <email>");
  console.error("Example: npx tsx scripts/setup-admin.ts admin@balikin.id");
  process.exit(1);
}

async function setupAdmin() {
  try {
    // Backward-compatible safety: add role column if database is from older schema.
    await db.execute(sql`
      ALTER TABLE "balikin_user"
      ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user' NOT NULL
    `);

    // Check if user exists
    const existingUser = await db.query.user.findFirst({
      where: eq(user.email, email),
    });

    if (existingUser) {
      // Update existing user to admin
      await db
        .update(user)
        .set({ role: "admin", updatedAt: new Date() })
        .where(eq(user.email, email));
      console.log(`User ${email} berhasil diupdate menjadi ADMIN`);
    } else {
      console.log(`User dengan email ${email} tidak ditemukan`);
      console.log("\nSilakan daftar terlebih dahulu melalui: /sign-up");
      console.log("Setelah terdaftar, jalankan script ini lagi untuk menjadikan admin.");
    }
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

setupAdmin();
