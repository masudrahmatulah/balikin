import { config } from 'dotenv';
import postgres from 'postgres';

// Load .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Starting Module Requests migration...');

    // Create module_requests table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_module_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "module_type" text NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "requested_at" timestamp DEFAULT now(),
        "reviewed_at" timestamp,
        "reviewed_by" text,
        "reason" text,
        "rejection_reason" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_module_requests table');

    // Add foreign key constraints
    await sql`
      ALTER TABLE "balikin_module_requests"
      ADD CONSTRAINT "balikin_module_requests_user_id_balikin_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."balikin_user"("id")
      ON DELETE cascade ON UPDATE no action
    `;
    console.log('✓ Added foreign key constraint for user_id');

    await sql`
      ALTER TABLE "balikin_module_requests"
      ADD CONSTRAINT "balikin_module_requests_reviewed_by_balikin_user_id_fk"
      FOREIGN KEY ("reviewed_by") REFERENCES "public"."balikin_user"("id")
      ON DELETE set null ON UPDATE no action
    `;
    console.log('✓ Added foreign key constraint for reviewed_by');

    // Create unique index untuk mencegah duplicate pending requests
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_pending_request"
      ON "balikin_module_requests" ("user_id", "module_type")
      WHERE "status" = 'pending'
    `;
    console.log('✓ Created unique index for pending requests');

    console.log('✅ Module Requests migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
