import { config } from 'dotenv';
import postgres from 'postgres';

// Load .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Starting Module Permissions migration...');

    // Create user_module_permissions table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_user_module_permissions" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "module_type" text NOT NULL,
        "is_enabled" boolean DEFAULT false NOT NULL,
        "granted_by" text,
        "granted_at" timestamp,
        "reason" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_user_module_permissions table');

    // Add foreign key constraints
    await sql`
      ALTER TABLE "balikin_user_module_permissions"
      ADD CONSTRAINT "balikin_user_module_permissions_user_id_balikin_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."balikin_user"("id")
      ON DELETE cascade ON UPDATE no action
    `;
    console.log('✓ Added foreign key constraint for user_id');

    await sql`
      ALTER TABLE "balikin_user_module_permissions"
      ADD CONSTRAINT "balikin_user_module_permissions_granted_by_balikin_user_id_fk"
      FOREIGN KEY ("granted_by") REFERENCES "public"."balikin_user"("id")
      ON DELETE set null ON UPDATE no action
    `;
    console.log('✓ Added foreign key constraint for granted_by');

    console.log('✅ Module Permissions migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
