import { cn } from "@/lib/utils";
import { CheckCircle2, Clock, XCircle, ArrowRight, type LucideIcon } from "lucide-react";

interface ActivityRowProps {
  icon?: LucideIcon | string;
  iconClassName?: string;
  event: string;
  reference?: string;
  admin?: string;
  timestamp: string;
  status: "success" | "pending" | "failed" | "transit";
  className?: string;
}

/**
 * ActivityRow - Clean table row for activity feed
 */
export function ActivityRow({
  icon: Icon,
  iconClassName,
  event,
  reference,
  admin,
  timestamp,
  status,
  className,
}: ActivityRowProps) {
  const statusStyles = {
    success:
      "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-300 dark:border-green-800 dark:hover:bg-green-950/50",
    pending: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800 dark:hover:bg-amber-950/50",
    failed:
      "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-300 dark:border-red-800 dark:hover:bg-red-950/50",
    transit:
      "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/30 dark:text-blue-300 dark:border-blue-800 dark:hover:bg-blue-950/50",
  };

  const statusIcons: Record<ActivityRowProps["status"], LucideIcon> = {
    success: CheckCircle2,
    pending: Clock,
    failed: XCircle,
    transit: ArrowRight,
  };
  const StatusIcon = statusIcons[status];

  return (
    <tr className={cn("transition-colors hover:bg-blue-50/50 dark:hover:bg-slate-800/60", className)}>
      <td className="px-4 py-3">
        {Icon && (
          <div className={cn("w-6 h-6", iconClassName)}>
            {typeof Icon === "string" ? (
              <span className="text-sm">{Icon}</span>
            ) : (
              <Icon size={16} />
            )}
          </div>
        )}
        {!Icon && (
          <span className="text-gray-400">•</span>
        )}
      </td>
      <td className="px-4 py-3">
          <span className="text-sm font-medium text-gray-900 dark:text-white">{event}</span>
      </td>
      {reference && (
        <td className="px-4 py-3">
          <span className="inline-block rounded bg-slate-100 px-2 py-0.5 text-xs font-mono text-gray-600 dark:bg-slate-800 dark:text-slate-300">
            {reference}
          </span>
        </td>
      )}
      {admin && (
        <td className="px-4 py-3">
          <span className="text-sm text-gray-600 dark:text-slate-300">{admin}</span>
        </td>
      )}
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold uppercase tracking-wider border rounded",
            statusStyles[status]
          )}
        >
          <StatusIcon size={12} />
          {status}
        </span>
      </td>
      <td className="px-4 py-3 text-right">
        <span className="text-xs text-gray-500 dark:text-slate-400">{timestamp}</span>
      </td>
    </tr>
  );
}
