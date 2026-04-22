import { config } from 'dotenv';
import postgres from 'postgres';

// Load .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Starting Module Usage Analytics migration...');

    // Create module_usage_analytics table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_module_usage_analytics" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "module_type" text NOT NULL,
        "action_type" text NOT NULL,
        "performed_by" text,
        "created_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_module_usage_analytics table');

    // Add foreign key constraints
    await sql`
      ALTER TABLE "balikin_module_usage_analytics"
      ADD CONSTRAINT "balikin_module_usage_analytics_user_id_balikin_user_id_fk"
      FOREIGN KEY ("user_id") REFERENCES "public"."balikin_user"("id")
      ON DELETE cascade ON UPDATE no action
    `;
    console.log('✓ Added foreign key constraint for user_id');

    await sql`
      ALTER TABLE "balikin_module_usage_analytics"
      ADD CONSTRAINT "balikin_module_usage_analytics_performed_by_balikin_user_id_fk"
      FOREIGN KEY ("performed_by") REFERENCES "public"."balikin_user"("id")
      ON DELETE set null ON UPDATE no action
    `;
    console.log('✓ Added foreign key constraint for performed_by');

    // Create indexes untuk analytics queries
    await sql`
      CREATE INDEX IF NOT EXISTS "idx_analytics_module_type"
      ON "balikin_module_usage_analytics"("module_type", "created_at")
    `;
    console.log('✓ Created index for module_type and created_at');

    await sql`
      CREATE INDEX IF NOT EXISTS "idx_analytics_user_id"
      ON "balikin_module_usage_analytics"("user_id")
    `;
    console.log('✓ Created index for user_id');

    console.log('✅ Module Usage Analytics migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
