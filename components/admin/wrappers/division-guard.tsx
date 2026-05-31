"use client";

import { hasPermission, type DivisionType } from "@/lib/admin-divisions";
import { useEffect, useState } from "react";

interface DivisionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  /**
   * Show a fallback message instead of just hiding
   * @default false
   */
  showMessage?: boolean;
}

/**
 * DivisionGuard - Role-Based Access Control wrapper component
 *
 * Conditionally renders children based on user's division permissions.
 * Can show a fallback message or hide content entirely.
 *
 * @example
 * <DivisionGuard permission="manufacturing_queue">
 *   <ManufacturingQueueMetrics />
 * </DivisionGuard>
 *
 * @example With custom fallback
 * <DivisionGuard permission="manufacturing_queue" fallback={<AccessDenied />}>
 *   <ManufacturingQueueMetrics />
 * </DivisionGuard>
 */
export function DivisionGuard({
  permission,
  children,
  fallback = null,
  showMessage = false,
}: DivisionGuardProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermission = async () => {
      try {
        const response = await fetch(`/api/admin/permissions/check?permission=${encodeURIComponent(permission)}`);
        if (response.ok) {
          const data = await response.json();
          setHasAccess(data.hasAccess);
        } else {
          setHasAccess(false);
        }
      } catch (error) {
        console.error("Failed to check permission:", error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermission();
  }, [permission]);

  if (isLoading) {
    return null; // Don't render anything while loading
  }

  if (!hasAccess) {
    if (showMessage && fallback === null) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Access Restricted
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to view this section.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Multiple permissions guard - requires ALL permissions
 */
export function DivisionGuardAll({
  permissions,
  children,
  fallback = null,
  showMessage = false,
}: Omit<DivisionGuardProps, "permission"> & { permissions: string[] }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const results = await Promise.all(
          permissions.map(perm =>
            fetch(`/api/admin/permissions/check?permission=${encodeURIComponent(perm)}`)
              .then(res => res.json())
              .then(data => data.hasAccess)
          )
        );
        const access = results.every(r => r === true);
        setHasAccess(access);
      } catch (error) {
        console.error("Failed to check permissions:", error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [permissions]);

  if (isLoading) {
    return null;
  }

  if (!hasAccess) {
    if (showMessage && fallback === null) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Access Restricted
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to view this section.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Multiple permissions guard - requires ANY permission
 */
export function DivisionGuardAny({
  permissions,
  children,
  fallback = null,
  showMessage = false,
}: Omit<DivisionGuardProps, "permission"> & { permissions: string[] }) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      try {
        const results = await Promise.all(
          permissions.map(perm =>
            fetch(`/api/admin/permissions/check?permission=${encodeURIComponent(perm)}`)
              .then(res => res.json())
              .then(data => data.hasAccess)
          )
        );
        const access = results.some(r => r === true);
        setHasAccess(access);
      } catch (error) {
        console.error("Failed to check permissions:", error);
        setHasAccess(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkPermissions();
  }, [permissions]);

  if (isLoading) {
    return null;
  }

  if (!hasAccess) {
    if (showMessage && fallback === null) {
      return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <div className="text-4xl mb-2">🔒</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            Access Restricted
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            You don't have permission to view this section.
          </p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
}