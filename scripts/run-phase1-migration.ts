import dotenv from 'dotenv';
import path from 'path';
import postgres from 'postgres';

// Load environment variables from .env.local
dotenv.config({ path: path.join(__dirname, '../.env.local') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('DATABASE_URL environment variable is not set');
  process.exit(1);
}

async function runMigration() {
  console.log('Running FASE 1 migration...');

  const isSupabase = connectionString.includes('supabase.com');

  const client = postgres(connectionString, {
    prepare: false,
    ssl: isSupabase ? 'require' as const : undefined,
  });

  try {
    // Create print_batches table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS balikin_print_batches (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        app_id text DEFAULT 'balikin_id' NOT NULL,
        batch_number text NOT NULL UNIQUE,
        serial_number_range text,
        total_stickers integer DEFAULT 0 NOT NULL,
        status text DEFAULT 'pending' NOT NULL,
        printed_at timestamp,
        completed_at timestamp,
        created_by text,
        notes text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);
    console.log('✓ Created balikin_print_batches table');

    // Create chat_rooms table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS balikin_chat_rooms (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        app_id text DEFAULT 'balikin_id' NOT NULL,
        tag_id uuid NOT NULL,
        is_active boolean DEFAULT true NOT NULL,
        finder_fingerprint text,
        created_at timestamp DEFAULT now(),
        updated_at timestamp DEFAULT now()
      );
    `);
    console.log('✓ Created balikin_chat_rooms table');

    // Create messages table
    await client.unsafe(`
      CREATE TABLE IF NOT EXISTS balikin_messages (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        app_id text DEFAULT 'balikin_id' NOT NULL,
        room_id uuid NOT NULL,
        sender_type text NOT NULL,
        message_text text NOT NULL,
        is_read_by_owner boolean DEFAULT false NOT NULL,
        created_at timestamp DEFAULT now()
      );
    `);
    console.log('✓ Created balikin_messages table');

    // Add columns to tags table
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_token_hash text;`);
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_pin_hash text;`);
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_pin_plain text;`);
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS serial_number text;`);
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false NOT NULL;`);
    await client.unsafe(`ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS batch_id uuid;`);
    console.log('✓ Added activation columns to balikin_tags table');

    // Create indexes
    await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_tag_id ON balikin_chat_rooms (tag_id);`);
    await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON balikin_chat_rooms (is_active);`);
    await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_messages_room_id ON balikin_messages (room_id);`);
    await client.unsafe(`CREATE INDEX IF NOT EXISTS idx_messages_created_at ON balikin_messages (created_at);`);
    console.log('✓ Created indexes');

    // Add foreign keys (ignore if already exists)
    try {
      await client.unsafe(`
        ALTER TABLE balikin_chat_rooms DROP CONSTRAINT IF EXISTS balikin_chat_rooms_tag_id_balikin_tags_id_fk;
        ALTER TABLE balikin_chat_rooms ADD CONSTRAINT balikin_chat_rooms_tag_id_balikin_tags_id_fk
          FOREIGN KEY (tag_id) REFERENCES balikin_tags(id) ON DELETE CASCADE ON UPDATE NO ACTION;
      `);
    } catch (e: any) {
      console.log('  Note: FK for chat_rooms already exists or error:', e.message?.substring(0, 100));
    }

    try {
      await client.unsafe(`
        ALTER TABLE balikin_messages DROP CONSTRAINT IF EXISTS balikin_messages_room_id_balikin_chat_rooms_id_fk;
        ALTER TABLE balikin_messages ADD CONSTRAINT balikin_messages_room_id_balikin_chat_rooms_id_fk
          FOREIGN KEY (room_id) REFERENCES balikin_chat_rooms(id) ON DELETE CASCADE ON UPDATE NO ACTION;
      `);
    } catch (e: any) {
      console.log('  Note: FK for messages already exists or error:', e.message?.substring(0, 100));
    }

    try {
      await client.unsafe(`
        ALTER TABLE balikin_tags DROP CONSTRAINT IF EXISTS balikin_tags_batch_id_balikin_print_batches_id_fk;
        ALTER TABLE balikin_tags ADD CONSTRAINT balikin_tags_batch_id_balikin_print_batches_id_fk
          FOREIGN KEY (batch_id) REFERENCES balikin_print_batches(id) ON DELETE SET NULL ON UPDATE NO ACTION;
      `);
    } catch (e: any) {
      console.log('  Note: FK for tags->print_batches already exists or error:', e.message?.substring(0, 100));
    }

    try {
      await client.unsafe(`
        ALTER TABLE balikin_print_batches DROP CONSTRAINT IF EXISTS balikin_print_batches_created_by_balikin_user_id_fk;
        ALTER TABLE balikin_print_batches ADD CONSTRAINT balikin_print_batches_created_by_balikin_user_id_fk
          FOREIGN KEY (created_by) REFERENCES balikin_user(id) ON DELETE SET NULL ON UPDATE NO ACTION;
      `);
    } catch (e: any) {
      console.log('  Note: FK for print_batches already exists or error:', e.message?.substring(0, 100));
    }

    console.log('✓ Added foreign keys');
    console.log('\n🎉 FASE 1 migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await client.end();
  }
}

runMigration().catch(console.error);
