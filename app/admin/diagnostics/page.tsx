'use client';

import { useState } from 'react';

export default function DiagnosticsPage() {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          🔍 Database Performance Diagnostics
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Performance analysis based on server logs
        </p>
      </div>

      <div className="space-y-6">
        {/* Performance Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">⚠️ Performance Issues Found</h2>

          <div className="space-y-4">
            {/* Issue 1 */}
            <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-semibold text-red-700 dark:text-red-300">
                Issue #1: Tag Count Query Timeout
              </h3>
              <div className="mt-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Current:</strong> 3+ seconds
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Expected:</strong> &lt;100ms
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Your server logs show: "Tag count timeout or error: Error: Query timeout after 3000ms"
                </p>
              </div>
            </div>

            {/* Issue 2 */}
            <div className="border-l-4 border-red-500 pl-4 py-2 bg-red-50 dark:bg-red-900/20">
              <h3 className="font-semibold text-red-700 dark:text-red-300">
                Issue #2: Users With Tags Query Timeout
              </h3>
              <div className="mt-2 text-sm">
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Current:</strong> 8+ seconds
                </p>
                <p className="text-gray-700 dark:text-gray-300">
                  <strong>Expected:</strong> &lt;500ms
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Your server logs show: "Users for tags timeout or error: Error: Query timeout after 8000ms"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold mb-4">🛠️ Solutions</h2>

          <div className="space-y-4">
            {/* Solution 1 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">
                ✅ Solution 1: Add Database Indexes (Recommended First)
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Connect to your database and run these SQL commands:
              </p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`-- Add indexes to speed up common queries
CREATE INDEX IF NOT EXISTS idx_tags_owner_id ON tags(owner_id);
CREATE INDEX IF NOT EXISTS idx_tags_created_at ON tags(created_at);
CREATE INDEX IF NOT EXISTS idx_user_created_at ON user(created_at);
CREATE INDEX IF NOT EXISTS idx_scan_logs_tag_id ON scan_logs(tag_id);

-- Verify indexes were created
SELECT indexname, tablename FROM pg_indexes
WHERE tablename IN ('tags', 'user', 'scan_logs')
ORDER BY tablename, indexname;`}</pre>
              </div>
            </div>

            {/* Solution 2 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                🧹 Solution 2: Clean Up Old Data
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                If you have old scan logs, archive them to improve performance:
              </p>
              <div className="bg-gray-900 text-blue-400 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`-- Check how many scan logs you have
SELECT COUNT(*) as total_scan_logs FROM scan_logs;

-- Archive logs older than 6 months (adjust as needed)
CREATE TABLE scan_logs_archive AS
SELECT * FROM scan_logs
WHERE created_at < NOW() - INTERVAL '6 months';

-- Delete archived logs from main table
DELETE FROM scan_logs
WHERE created_at < NOW() - INTERVAL '6 months';`}</pre>
              </div>
            </div>

            {/* Solution 3 */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-2">
                ⚙️ Solution 3: Optimize Database Connection
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Check your `.env.local` file for connection settings:
              </p>
              <div className="bg-gray-900 text-purple-400 p-3 rounded text-xs font-mono overflow-x-auto">
                <pre>{`# Add connection pool settings to your DATABASE_URL
DATABASE_URL=postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=20&pgbouncer=true`}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl shadow-sm border border-green-200 dark:border-green-800 p-6">
          <h2 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2">
            ✅ Current Status
          </h2>
          <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
            <p>
              <strong>Admin Dashboard:</strong> Working (simplified version) ✅
            </p>
            <p>
              <strong>Page Load Time:</strong> &lt;1 second ✅
            </p>
            <p>
              <strong>Advanced Features:</strong> Disabled for performance ⚠️
            </p>
            <p className="mt-3 pt-3 border-t border-green-300 dark:border-green-700">
              <strong>Next Step:</strong> Apply Solution 1 (database indexes) to restore full functionality
            </p>
          </div>
        </div>

        {/* Quick Test */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl shadow-sm border border-blue-200 dark:border-blue-800 p-6">
          <h2 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-2">
            🧪 Quick Test
          </h2>
          <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
            Test if the fixes work by applying the indexes and refreshing the admin page.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/admin'}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              Test Admin Page
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
            >
              Refresh Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}