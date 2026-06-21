import { db } from '../db/index.js';
import { sql } from 'drizzle-orm';

async function runMigration() {
  const migration = `
-- Create print_batches table
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

-- Create chat_rooms table
CREATE TABLE IF NOT EXISTS balikin_chat_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  app_id text DEFAULT 'balikin_id' NOT NULL,
  tag_id uuid NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  finder_fingerprint text,
  created_at timestamp DEFAULT now(),
  updated_at timestamp DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS balikin_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  app_id text DEFAULT 'balikin_id' NOT NULL,
  room_id uuid NOT NULL,
  sender_type text NOT NULL,
  message_text text NOT NULL,
  is_read_by_owner boolean DEFAULT false NOT NULL,
  created_at timestamp DEFAULT now()
);

-- Add columns to tags table (if not exists)
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_token_hash text;
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_pin_hash text;
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS activation_pin_plain text;
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS serial_number text;
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS is_custom boolean DEFAULT false NOT NULL;
ALTER TABLE balikin_tags ADD COLUMN IF NOT EXISTS batch_id uuid;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_rooms_tag_id ON balikin_chat_rooms (tag_id);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_active ON balikin_chat_rooms (is_active);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON balikin_messages (room_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON balikin_messages (created_at);
`;

  try {
    await db.execute(sql.raw(migration));
    console.log('✓ Tables, columns, and indexes created successfully!');
  } catch (error) {
    console.error('✗ Error creating structures:', error.message);
    return;
  }

  // Now try to add foreign keys separately
  const fks = `
ALTER TABLE balikin_chat_rooms DROP CONSTRAINT IF EXISTS balikin_chat_rooms_tag_id_balikin_tags_id_fk;
ALTER TABLE balikin_chat_rooms ADD CONSTRAINT balikin_chat_rooms_tag_id_balikin_tags_id_fk
  FOREIGN KEY (tag_id) REFERENCES balikin_tags(id) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE balikin_messages DROP CONSTRAINT IF EXISTS balikin_messages_room_id_balikin_chat_rooms_id_fk;
ALTER TABLE balikin_messages ADD CONSTRAINT balikin_messages_room_id_balikin_chat_rooms_id_fk
  FOREIGN KEY (room_id) REFERENCES balikin_chat_rooms(id) ON DELETE CASCADE ON UPDATE NO ACTION;

ALTER TABLE balikin_tags DROP CONSTRAINT IF EXISTS balikin_tags_batch_id_balikin_print_batches_id_fk;
ALTER TABLE balikin_tags ADD CONSTRAINT balikin_tags_batch_id_balikin_print_batches_id_fk
  FOREIGN KEY (batch_id) REFERENCES balikin_print_batches(id) ON DELETE SET NULL ON UPDATE NO ACTION;

ALTER TABLE balikin_print_batches DROP CONSTRAINT IF EXISTS balikin_print_batches_created_by_balikin_user_id_fk;
ALTER TABLE balikin_print_batches ADD CONSTRAINT balikin_print_batches_created_by_balikin_user_id_fk
  FOREIGN KEY (created_by) REFERENCES balikin_user(id) ON DELETE SET NULL ON UPDATE NO ACTION;
`;

  try {
    await db.execute(sql.raw(fks));
    console.log('✓ Foreign keys added successfully!');
  } catch (error) {
    console.error('✗ Error adding foreign keys:', error.message);
  }

  console.log('\n🎉 Migration completed!');
}

runMigration().catch(console.error);
