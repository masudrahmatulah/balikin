"use client";

import type { LucideIcon } from "lucide-react";
import { ActivityRow } from "./base/activity-row";

interface Activity {
  id: string;
  event: string;
  icon?: LucideIcon | string;
  iconClassName?: string;
  reference?: string;
  admin?: string;
  timestamp: string;
  status: "success" | "pending" | "transit" | "failed";
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-blue-100/80 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-slate-900/90">
      {/* Header */}
      <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <h3 className="font-display text-lg font-semibold text-blue-700 dark:text-blue-300">System Activity</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Recent system events and activities</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50/60 dark:bg-slate-800/70">
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Event</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Reference</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Admin</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Status</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">Time</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {activities.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-500 dark:text-slate-400">
                  Belum ada aktivitas terbaru.
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <ActivityRow
                  key={activity.id}
                  icon={activity.icon as any}
                  iconClassName={activity.iconClassName}
                  event={activity.event}
                  reference={activity.reference}
                  admin={activity.admin}
                  timestamp={activity.timestamp}
                  status={activity.status}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 dark:border-slate-800">
        <span className="text-sm text-gray-600 dark:text-slate-400">
          Menampilkan {activities.length} aktivitas terbaru
        </span>
      </div>
    </div>
  );
}

// Loading state
export function ActivityFeedSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="h-4 w-48 bg-gray-100 rounded mt-1 animate-pulse" />
      </div>
      <div className="p-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-6 h-6 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="flex gap-4 ml-9">
              <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
              <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
      <div className="px-6 py-4 border-t border-gray-200">
        <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
    </div>
  );
}
