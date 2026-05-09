import postgres from "postgres";
import fs from "fs";
import path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: '.env.local' });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  const sql = postgres(databaseUrl);

  try {
    console.log('🚀 Running custom migration to add division field...');

    // Add division column
    console.log('Adding division column to balikin_user table...');
    await sql`ALTER TABLE "balikin_user" ADD COLUMN IF NOT EXISTS "division" text`;
    console.log('✅ Division column added');

    // Create index
    console.log('Creating index on division column...');
    await sql`CREATE INDEX IF NOT EXISTS "balikin_user_division_idx" ON "balikin_user" ("division")`;
    console.log('✅ Index created');

    // Add comment
    console.log('Adding column comment...');
    await sql`COMMENT ON COLUMN "balikin_user"."division" IS 'Division assignment for admin users: production | customer_service | marketing | admin | null'`;
    console.log('✅ Comment added');

    console.log('');
    console.log('✨ Migration completed successfully!');
    console.log('✨ Added division field to balikin_user table');

    // Verify the change
    const result = await sql`SELECT column_name, data_type, column_default
                              FROM information_schema.columns
                              WHERE table_name = 'balikin_user'
                              AND column_name = 'division'`;

    if (result.length > 0) {
      console.log('');
      console.log('📋 Column info:');
      console.log(JSON.stringify(result, null, 2));
    }

    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await sql.end();
    process.exit(1);
  }
}

runMigration();
