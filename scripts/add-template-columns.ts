import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function migrate() {
  try {
    // Check if columns already exist
    const result = await sql`
      SELECT column_name
      FROM information_schema.columns
      WHERE table_name = 'balikin_tag_bundles'
      AND column_name IN ('sticker_shape', 'sticker_size')
    `;

    const existingColumns = result.map(r => r.column_name);

    if (!existingColumns.includes('sticker_shape')) {
      await sql`ALTER TABLE "balikin_tag_bundles" ADD COLUMN "sticker_shape" text DEFAULT 'circle' NOT NULL`;
      console.log('✓ Added sticker_shape column');
    } else {
      console.log('✓ sticker_shape column already exists');
    }

    if (!existingColumns.includes('sticker_size')) {
      await sql`ALTER TABLE "balikin_tag_bundles" ADD COLUMN "sticker_size" text DEFAULT 'medium' NOT NULL`;
      console.log('✓ Added sticker_size column');
    } else {
      console.log('✓ sticker_size column already exists');
    }

    console.log('Migration complete!');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

migrate();
