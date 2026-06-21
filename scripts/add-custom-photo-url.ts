import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "@/db";
import { sql } from "drizzle-orm";

async function addCustomPhotoUrlColumn() {
  try {
    await db.execute(sql`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS custom_photo_url text`);
    console.log("✓ Column custom_photo_url added successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error adding column:", error);
    process.exit(1);
  }
}

addCustomPhotoUrlColumn();
