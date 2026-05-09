"use client";

import { Card } from "@/components/ui/card";

interface Activity {
  id: string;
  event: string;
  icon: string;
  iconColor: string;
  reference: string;
  admin: string;
  timestamp: string;
  status: "Success" | "Pending" | "Transit" | "Blocked" | "Failed";
}

interface ActivityFeedProps {
  activities?: Activity[];
}

const defaultActivities: Activity[] = [
  {
    id: "1",
    event: "Batch B-204 Generated",
    icon: "inventory",
    iconColor: "text-status-resolved",
    reference: "#BTC-204-981",
    admin: "Admin S.",
    timestamp: "10:42:01 AM",
    status: "Success",
  },
  {
    id: "2",
    event: "Suspicious User Flagged",
    icon: "warning",
    iconColor: "text-status-open",
    reference: "USR-882-P",
    admin: "System (AI)",
    timestamp: "09:15:33 AM",
    status: "Pending",
  },
  {
    id: "3",
    event: "Shipment Dispatched",
    icon: "local_shipping",
    iconColor: "text-balikin-gold",
    reference: "#ORD-9021-X",
    admin: "Warehouse A",
    timestamp: "08:02:11 AM",
    status: "Transit",
  },
  {
    id: "4",
    event: "VDP Error: Invalid Resi",
    icon: "report",
    iconColor: "text-status-critical",
    reference: "#TX-7711",
    admin: "Admin J.",
    timestamp: "07:44:59 AM",
    status: "Blocked",
  },
];

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
  const getStatusColor = (status: Activity["status"]) => {
    switch (status) {
      case "Success":
        return "bg-status-resolved/10 text-status-resolved";
      case "Pending":
        return "bg-status-open/10 text-status-open";
      case "Transit":
        return "bg-balikin-gold/10 text-balikin-gold";
      case "Blocked":
      case "Failed":
        return "bg-status-critical/10 text-status-critical";
      default:
        return "bg-surface-variant text-on-surface-variant";
    }
  };

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface-container rounded-xl border border-white/5 flex flex-col overflow-hidden">
      <div className="p-6 border-b border-outline-variant/30 flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">System Activity Feed</h3>
        <button className="text-balikin-gold text-label-caps font-bold uppercase hover:underline">
          View All Logs
        </button>
      </div>
      <div className="p-0 overflow-y-auto max-h-[600px]">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-surface-container-low border-b border-outline-variant/20">
              <th className="px-6 py-4 font-label-caps text-outline uppercase text-[10px]">Event</th>
              <th className="px-6 py-4 font-label-caps text-outline uppercase text-[10px]">Reference</th>
              <th className="px-6 py-4 font-label-caps text-outline uppercase text-[10px]">Admin</th>
              <th className="px-6 py-4 font-label-caps text-outline uppercase text-[10px]">Timestamp</th>
              <th className="px-6 py-4 font-label-caps text-outline uppercase text-[10px]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/10">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-surface-variant/20 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`material-symbols-outlined ${activity.iconColor} !text-[18px]`} data-icon={activity.icon}>
                      {activity.icon}
                    </span>
                    <span className="font-medium">{activity.event}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-data-mono text-data-mono">{activity.reference}</td>
                <td className="px-6 py-4 text-on-surface-variant">{activity.admin}</td>
                <td className="px-6 py-4 text-on-surface-variant">{activity.timestamp}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 ${getStatusColor(activity.status)} text-[10px] font-bold uppercase rounded`}>
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
