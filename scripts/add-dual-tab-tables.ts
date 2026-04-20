import { config } from 'dotenv';
import postgres from 'postgres';

// Load .env.local
config({ path: '.env.local' });

const sql = postgres(process.env.DATABASE_URL!);

async function migrate() {
  try {
    console.log('Starting Dual-Tab feature migration...');

    // Create emergency_information table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_emergency_information" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "tag_id" uuid NOT NULL,
        "blood_type" text,
        "allergies" text,
        "medical_conditions" text,
        "emergency_contact" text,
        "emergency_contact_name" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_emergency_information table');

    // Create user_module_selections table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_user_module_selections" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "module_type" text NOT NULL,
        "is_active" boolean DEFAULT true,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_user_module_selections table');

    // Create student_kit_data table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_student_kit_data" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "class_schedule" text,
        "assignment_deadlines" text,
        "drive_links" text,
        "ktm_krs_photos" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_student_kit_data table');

    // Create otomotif_data table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_otomotif_data" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "stnk_number" text,
        "stnk_expiry_date" timestamp,
        "oil_change_schedule" text,
        "service_history" text,
        "insurance_number" text,
        "insurance_provider" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_otomotif_data table');

    // Create pertanian_data table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_pertanian_data" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "hst_calculator" text,
        "fertilizer_schedule" text,
        "harvest_log" text,
        "labor_cost_notes" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_pertanian_data table');

    // Create diklat_data table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_diklat_data" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "tag_id" uuid NOT NULL,
        "event_id" text,
        "attendee_name" text,
        "attendance_status" text,
        "rundown_schedule" text,
        "material_links" text,
        "certificate_url" text,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_diklat_data table');

    // Create tag_documents table
    await sql`
      CREATE TABLE IF NOT EXISTS "balikin_tag_documents" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "app_id" text DEFAULT 'balikin_id' NOT NULL,
        "user_id" text NOT NULL,
        "tag_id" uuid,
        "module_type" text NOT NULL,
        "document_type" text NOT NULL,
        "file_name" text NOT NULL,
        "file_url" text NOT NULL,
        "file_size" integer,
        "mime_type" text,
        "created_at" timestamp DEFAULT now()
      )
    `;
    console.log('✓ Created balikin_tag_documents table');

    // Add has_tab_two_enabled column to tags table if it doesn't exist
    const columnCheck = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'balikin_tags'
      AND column_name = 'has_tab_two_enabled'
    `;

    if (columnCheck.length === 0) {
      await sql`ALTER TABLE "balikin_tags" ADD COLUMN "has_tab_two_enabled" boolean DEFAULT false`;
      console.log('✓ Added has_tab_two_enabled column to balikin_tags');
    } else {
      console.log('✓ Column has_tab_two_enabled already exists in balikin_tags');
    }

    // Create foreign key constraints
    const constraints = [
      ['balikin_emergency_information_tag_id_balikin_tags_id_fk',
        'balikin_emergency_information', 'tag_id', 'balikin_tags'],
      ['balikin_user_module_selections_user_id_balikin_user_id_fk',
        'balikin_user_module_selections', 'user_id', 'balikin_user'],
      ['balikin_student_kit_data_user_id_balikin_user_id_fk',
        'balikin_student_kit_data', 'user_id', 'balikin_user'],
      ['balikin_otomotif_data_user_id_balikin_user_id_fk',
        'balikin_otomotif_data', 'user_id', 'balikin_user'],
      ['balikin_pertanian_data_user_id_balikin_user_id_fk',
        'balikin_pertanian_data', 'user_id', 'balikin_user'],
      ['balikin_diklat_data_tag_id_balikin_tags_id_fk',
        'balikin_diklat_data', 'tag_id', 'balikin_tags'],
      ['balikin_tag_documents_user_id_balikin_user_id_fk',
        'balikin_tag_documents', 'user_id', 'balikin_user'],
      ['balikin_tag_documents_tag_id_balikin_tags_id_fk',
        'balikin_tag_documents', 'tag_id', 'balikin_tags'],
    ];

    for (const [fkName, table, column, refTable] of constraints) {
      // Check if constraint exists
      const constraintCheck = await sql`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = ${table}
        AND constraint_name = ${fkName}
      `;

      if (constraintCheck.length === 0) {
        await sql`
          ALTER TABLE ${sql(table)}
          ADD CONSTRAINT ${sql(fkName)}
          FOREIGN KEY (${sql(column)}) REFERENCES "public".${sql(refTable)}("id")
          ON DELETE cascade ON UPDATE no action
        `;
        console.log(`✓ Added foreign key ${fkName}`);
      } else {
        console.log(`✓ Foreign key ${fkName} already exists`);
      }
    }

    console.log('\n✅ Dual-Tab feature migration complete!');
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
