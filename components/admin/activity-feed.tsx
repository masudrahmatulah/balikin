"use client";

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
    iconColor: "text-primary",
    reference: "#BTC-204-981",
    admin: "Admin S.",
    timestamp: "10:42:01 AM",
    status: "Success",
  },
  {
    id: "2",
    event: "Suspicious User Flagged",
    icon: "warning",
    iconColor: "text-tertiary",
    reference: "USR-882-P",
    admin: "System (AI)",
    timestamp: "09:15:33 AM",
    status: "Pending",
  },
  {
    id: "3",
    event: "Shipment Dispatched",
    icon: "local_shipping",
    iconColor: "text-primary",
    reference: "#ORD-9021-X",
    admin: "Warehouse A",
    timestamp: "08:02:11 AM",
    status: "Transit",
  },
  {
    id: "4",
    event: "VDP Error: Invalid Resi",
    icon: "report",
    iconColor: "text-tertiary",
    reference: "#TX-7711",
    admin: "Admin J.",
    timestamp: "07:44:59 AM",
    status: "Blocked",
  },
];

export function ActivityFeed({ activities = defaultActivities }: ActivityFeedProps) {
  const getStatusStyle = (status: Activity["status"]) => {
    switch (status) {
      case "Success":
        return "text-primary border-primary";
      case "Pending":
      case "Transit":
        return "text-secondary border-secondary";
      case "Blocked":
      case "Failed":
        return "text-tertiary border-tertiary";
      default:
        return "text-secondary border-secondary";
    }
  };

  return (
    <div className="col-span-12 lg:col-span-8 bg-surface rounded-lg border border-secondary/10 flex flex-col overflow-hidden shadow-sm">
      <div className="p-8 border-b border-secondary/10 flex justify-between items-end">
        <div>
          <h3 className="font-display text-2xl font-bold text-primary">System Activity</h3>
          <p className="font-body text-xs text-secondary mt-1">Audit logs and real-time event monitoring.</p>
        </div>
        <button className="text-tertiary font-label text-[10px] font-bold uppercase tracking-widest hover:underline">
          Full Audit Log
        </button>
      </div>
      <div className="p-0 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral">
              <th className="px-8 py-4 font-label text-[9px] text-secondary uppercase tracking-[0.2em] font-bold">Event</th>
              <th className="px-8 py-4 font-label text-[9px] text-secondary uppercase tracking-[0.2em] font-bold">Reference</th>
              <th className="px-8 py-4 font-label text-[9px] text-secondary uppercase tracking-[0.2em] font-bold">Admin</th>
              <th className="px-8 py-4 font-label text-[9px] text-secondary uppercase tracking-[0.2em] font-bold text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary/5">
            {activities.map((activity) => (
              <tr key={activity.id} className="hover:bg-neutral/30 transition-colors group">
                <td className="px-8 py-5">
                  <div className="flex items-center gap-4">
                    <span className={`material-symbols-outlined ${activity.iconColor} !text-[18px] opacity-70 group-hover:opacity-100 transition-opacity`} data-icon={activity.icon}>
                      {activity.icon}
                    </span>
                    <span className="font-body text-sm font-medium text-primary">{activity.event}</span>
                  </div>
                </td>
                <td className="px-8 py-5 font-data-mono text-[12px] text-secondary">{activity.reference}</td>
                <td className="px-8 py-5 font-body text-xs text-secondary">{activity.admin}</td>
                <td className="px-8 py-5 text-right">
                  <span className={`px-2 py-0.5 border text-[9px] font-bold uppercase tracking-widest rounded-sm ${getStatusStyle(activity.status)}`}>
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
