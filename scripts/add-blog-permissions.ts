import { db } from '@/db';
import { user } from '@/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Add blog permissions to user table
 * Run this script to update the database schema
 */

async function addBlogPermissions() {
  console.log('Adding blog permissions to user table...');

  try {
    // Add blogPermissions column if it doesn't exist
    await db.execute(sql`
      ALTER TABLE balikin_user
      ADD COLUMN IF NOT EXISTS blog_permissions jsonb DEFAULT '{"canCreatePosts": false, "canEditOwnPosts": false, "canPublishPosts": false, "canModerateComments": false}'::jsonb;
    `);

    console.log('✅ blog_permissions column added');

    // Update role check constraint to include 'editor'
    await db.execute(sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'balikin_user_role_check'
        ) THEN
          ALTER TABLE balikin_user
          ADD CONSTRAINT balikin_user_role_check
          CHECK (role IN ('admin', 'editor', 'user'));
        END IF;
      END $$;
    `);

    console.log('✅ Role constraint updated to include editor role');

    console.log('\n✅ Blog permissions migration completed successfully!');
    console.log('\nAvailable roles:');
    console.log('  - admin: Full access to all features');
    console.log('  - editor: Limited access based on blog_permissions');
    console.log('  - user: Standard user access');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

addBlogPermissions()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
