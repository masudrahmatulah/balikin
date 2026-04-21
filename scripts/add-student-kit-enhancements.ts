import { config } from 'dotenv';
import postgres from 'postgres';

// Load .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Starting Student Kit Enhancements migration...');

    // Add new columns to balikin_student_kit_data table
    await sql`
      ALTER TABLE "balikin_student_kit_data"
      ADD COLUMN IF NOT EXISTS "vcard_data" text,
      ADD COLUMN IF NOT EXISTS "vcard_share_code" text,
      ADD COLUMN IF NOT EXISTS "whatsapp_notifications_enabled" boolean DEFAULT false,
      ADD COLUMN IF NOT EXISTS "notification_phone_number" text,
      ADD COLUMN IF NOT EXISTS "last_notification_sent_at" timestamp
    `;
    console.log('✓ Added new columns to balikin_student_kit_data');

    // Create index on vcard_share_code for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS "student_kit_vcard_share_code_idx"
      ON "balikin_student_kit_data" ("vcard_share_code")
    `;
    console.log('✓ Created index on vcard_share_code');

    // Create student_kit_schedule_shares table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_student_kit_schedule_shares" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "share_code" text UNIQUE NOT NULL,
        "class_schedule" text NOT NULL,
        "assignment_deadlines" text NOT NULL,
        "drive_links" text NOT NULL,
        "expires_at" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_student_kit_schedule_shares table');

    // Create index on share_code for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS "student_kit_schedule_shares_share_code_idx"
      ON "balikin_student_kit_schedule_shares" ("share_code")
    `;
    console.log('✓ Created index on share_code');

    // Create index on expires_at for cleanup queries
    await sql`
      CREATE INDEX IF NOT EXISTS "student_kit_schedule_shares_expires_at_idx"
      ON "balikin_student_kit_schedule_shares" ("expires_at")
    `;
    console.log('✓ Created index on expires_at');

    console.log('\n✅ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Restart your development server');
    console.log('2. Test the Schedule Sharing feature');
    console.log('3. Test the Internship vCard feature');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

// Run migration
migrate().catch(console.error);
