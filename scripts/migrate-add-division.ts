import "dotenv/config";
import { db } from "@/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function runCustomMigration() {
  try {
    console.log('🚀 Running custom migration to add division field...');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'drizzle', '0006_add_division_field.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));

    for (const statement of statements) {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await db.execute(sql.raw(statement));
    }

    console.log('✅ Migration completed successfully!');
    console.log('✨ Added division field to balikin_user table');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runCustomMigration();
