"use client";

import { ActivityRow } from "./base/activity-row";
import { Package, AlertTriangle, Truck, XCircle, ClipboardList, PackagePlus, type LucideIcon } from "lucide-react";

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
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    event: "Batch B-204 Generated",
    icon: Package,
    reference: "#BTC-204-981",
    admin: "Admin S.",
    timestamp: "10:42:01 AM",
    status: "success",
  },
  {
    id: "2",
    event: "Suspicious User Flagged",
    icon: AlertTriangle,
    reference: "USR-882-P",
    admin: "System (AI)",
    timestamp: "09:15:33 AM",
    status: "pending",
  },
  {
    id: "3",
    event: "Shipment Dispatched",
    icon: Truck,
    reference: "#ORD-9021-X",
    admin: "Warehouse A",
    timestamp: "08:02:11 AM",
    status: "transit",
  },
  {
    id: "4",
    event: "VDP Error: Invalid Resi",
    icon: XCircle,
    reference: "#TX-7711",
    admin: "Admin J.",
    timestamp: "07:44:59 AM",
    status: "failed",
  },
  {
    id: "5",
    event: "New Order #8842",
    icon: ClipboardList,
    reference: "#ORD-8842",
    admin: "Customer Service",
    timestamp: "07:30:15 AM",
    status: "success",
  },
  {
    id: "6",
    event: "Bundle Generation Started",
    icon: PackagePlus,
    reference: "#BND-456",
    admin: "System",
    timestamp: "07:15:22 AM",
    status: "pending",
  },
];

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-display font-semibold text-primary">System Activity</h3>
        <p className="text-sm text-gray-500 mt-1">Recent system events and activities</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Event</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Reference</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Admin</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</span>
              </th>
              <th className="px-6 py-3 text-right">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Time</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {activities.map((activity) => (
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
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-sm text-gray-600">Showing {activities.length} of 128 events</span>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50">
            Previous
          </button>
          <button className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary/90">
            Next
          </button>
        </div>
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
