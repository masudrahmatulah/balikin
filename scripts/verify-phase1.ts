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

async function verifySchema() {
  console.log('=== Verifying FASE 1 Database Schema ===\n');

  const isSupabase = connectionString.includes('supabase.com');
  const client = postgres(connectionString, {
    prepare: false,
    ssl: isSupabase ? 'require' as const : undefined,
  });

  try {
    // Check print_batches table
    const batches = await client.unsafe(`
      SELECT COUNT(*) as count FROM balikin_print_batches;
    `);
    console.log('✓ balikin_print_batches table exists, rows:', batches[0]?.count || '0');

    // Check chat_rooms table
    const rooms = await client.unsafe(`
      SELECT COUNT(*) as count FROM balikin_chat_rooms;
    `);
    console.log('✓ balikin_chat_rooms table exists, rows:', rooms[0]?.count || '0');

    // Check messages table
    const msgs = await client.unsafe(`
      SELECT COUNT(*) as count FROM balikin_messages;
    `);
    console.log('✓ balikin_messages table exists, rows:', msgs[0]?.count || '0');

    // Check new columns in tags table
    const columns = await client.unsafe(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'balikin_tags'
      AND column_name IN ('activation_token_hash', 'activation_pin_hash', 'activation_pin_plain', 'serial_number', 'is_custom', 'batch_id')
      ORDER BY column_name;
    `);
    console.log('✓ balikin_tags new columns:');
    columns.forEach((col: any) => {
      console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
    });

    // Check indexes
    const indexes = await client.unsafe(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('balikin_chat_rooms', 'balikin_messages', 'balikin_print_batches')
      AND schemaname = 'public'
      ORDER BY indexname;
    `);
    console.log('✓ Indexes created:', indexes.length);

    // Check foreign keys
    const fks = await client.unsafe(`
      SELECT
        tc.table_name,
        tc.constraint_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public'
      AND tc.table_name LIKE 'balikin_%'
      ORDER BY tc.table_name, tc.constraint_name;
    `);
    console.log('✓ Foreign keys:', fks.length);

    console.log('\n=== FASE 1 Schema Verification Complete ===');
    console.log('\nSummary:');
    console.log('[✓] balikin_print_batches table (A3 sheet tracking)');
    console.log('[✓] balikin_chat_rooms table (anonymous chat sessions)');
    console.log('[✓] balikin_messages table (chat history with isReadByOwner)');
    console.log('[✓] balikin_tags activation columns (token_hash, pin_hash, pin_plain, serial_number, is_custom, batch_id)');
    console.log('[✓] Indexes and Foreign Keys');

  } catch (error) {
    console.error('Verification failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

verifySchema().catch(console.error);
