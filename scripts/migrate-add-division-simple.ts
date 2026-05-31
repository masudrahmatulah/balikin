import fs from "fs";
import path from "path";

// Read migration file
const migrationPath = path.join(process.cwd(), 'drizzle', '0006_add_division_field.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

console.log('🚀 Custom migration to add division field:');
console.log('--------------------------------------------');
console.log(migrationSQL);
console.log('--------------------------------------------');
console.log('');
console.log('To apply this migration, run one of these commands:');
console.log('');
console.log('Option 1: Use psql directly');
console.log('psql $DATABASE_URL -f drizzle/0006_add_division_field.sql');
console.log('');
console.log('Option 2: Copy and paste the SQL above into your database client');
console.log('');
console.log('Option 3: Use Drizzle Kit (after fixing the constraint issues)');
console.log('npx drizzle-kit push --force');
