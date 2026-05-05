'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AuthStatus {
  authenticated: boolean;
  isAdmin: boolean;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
  database?: {
    found: boolean;
    role?: string;
  };
  issues?: string[];
  suggestions?: string[];
}

/**
 * Auth Indicator Component
 *
 * Displays current authentication status in a fixed overlay.
 * Useful for debugging authentication issues during development.
 *
 * Usage: Include in your layout or specific pages where you need to debug auth
 *
 * @example
 * ```tsx
 * import { AuthIndicator } from '@/components/auth-indicator';
 *
 * export default function Layout({ children }) {
 *   return (
 *     <>
 *       {process.env.NODE_ENV === 'development' && <AuthIndicator />}
 *       {children}
 *     </>
 *   );
 * }
 * ```
 */
export function AuthIndicator() {
  const [authStatus, setAuthStatus] = useState<AuthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Only fetch auth status in development
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const fetchAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/debug');
        const data = await response.json();
        setAuthStatus(data);
      } catch (error) {
        console.error('Failed to fetch auth status:', error);
        setAuthStatus({
          authenticated: false,
          isAdmin: false,
          issues: ['Failed to fetch auth status']
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAuthStatus();

    // Refresh auth status every 30 seconds
    const interval = setInterval(fetchAuthStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  // Don't render in production or if hidden
  if (process.env.NODE_ENV === 'production' || !visible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
      {/* Header with close button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          🔐 Auth Status
        </h3>
        <button
          onClick={() => setVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Loading auth status...
        </div>
      ) : authStatus ? (
        <div className="space-y-2 text-sm">
          {/* Authentication Status */}
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Authenticated:</span>
            <span className={authStatus.authenticated ? 'text-green-600' : 'text-red-600'}>
              {authStatus.authenticated ? '✅ Yes' : '❌ No'}
            </span>
          </div>

          {/* User Information */}
          {authStatus.authenticated && authStatus.user && (
            <>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Email:</span>
                <span className="text-gray-900 dark:text-white font-medium">
                  {authStatus.user.email}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Admin:</span>
                <span className={authStatus.isAdmin ? 'text-green-600' : 'text-red-600'}>
                  {authStatus.isAdmin ? '✅ Yes' : '❌ No'}
                </span>
              </div>

              {/* Database Information */}
              {authStatus.database && (
                <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400">DB User:</span>
                    <span className={authStatus.database.found ? 'text-green-600' : 'text-red-600'}>
                      {authStatus.database.found ? '✅ Found' : '❌ Not found'}
                    </span>
                  </div>
                  {authStatus.database.role && (
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-600 dark:text-gray-400">DB Role:</span>
                      <span className="text-gray-900 dark:text-white font-medium">
                        {authStatus.database.role}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* Issues */}
          {authStatus.issues && authStatus.issues.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mb-1">
                ⚠️ Issues:
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {authStatus.issues.map((issue, index) => (
                  <li key={index}>• {issue}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Suggestions */}
          {authStatus.suggestions && authStatus.suggestions.length > 0 && (
            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mb-1">
                💡 Suggestions:
              </div>
              <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                {authStatus.suggestions.slice(0, 2).map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="text-sm text-red-600">
          Failed to load auth status
        </div>
      )}

      {/* Refresh button */}
      <button
        onClick={() => window.location.reload()}
        className="mt-3 w-full text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
      >
        🔄 Refresh Status
      </button>
    </div>
  );
}