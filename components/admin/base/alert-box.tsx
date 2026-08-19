import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Info, AlertTriangle, CheckCircle, XCircle, type LucideIcon } from "lucide-react";

interface AlertBoxProps {
  type: "info" | "warning" | "success" | "error";
  title?: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

/**
 * AlertBox - Clean alert component with minimal styling
 */
export function AlertBox({
  type,
  title,
  message,
  action,
  className,
}: AlertBoxProps) {
  const alertConfig = {
    info: {
      icon: Info,
      bgClass: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
      textClass: "text-blue-800 dark:text-blue-200",
      titleClass: "text-blue-900 dark:text-blue-100",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
      textClass: "text-amber-800 dark:text-amber-200",
      titleClass: "text-amber-900 dark:text-amber-100",
    },
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
      textClass: "text-green-800 dark:text-green-200",
      titleClass: "text-green-900 dark:text-green-100",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
      textClass: "text-red-800 dark:text-red-200",
      titleClass: "text-red-900 dark:text-red-100",
    },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "border rounded-lg p-4",
        config.bgClass,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <Icon size={20} className={cn(config.textClass)} />
        </div>
        <div className="flex-1 min-w-0">
          {title && (
            <h4 className={cn("font-semibold mb-1", config.titleClass)}>
              {title}
            </h4>
          )}
          <p className={cn("text-sm", config.textClass)}>{message}</p>
        </div>
        {action && (
          <div className="flex-shrink-0">{action}</div>
        )}
      </div>
    </div>
  );
}

interface AlertCardProps extends AlertBoxProps {
  icon?: LucideIcon;
  items?: Array<{ label: string; value: string }>;
  primaryAction?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * AlertCard - Alert card for critical items (like low stock)
 */
export function AlertCard({
  type,
  icon,
  items,
  primaryAction,
  ...alertBoxProps
}: AlertCardProps) {
  const alertConfig = {
    info: {
      icon: Info,
      bgClass: "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
      textClass: "text-blue-800 dark:text-blue-200",
      titleClass: "text-blue-900 dark:text-blue-100",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
      textClass: "text-amber-800 dark:text-amber-200",
      titleClass: "text-amber-900 dark:text-amber-100",
    },
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
      textClass: "text-green-800 dark:text-green-200",
      titleClass: "text-green-900 dark:text-green-100",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
      textClass: "text-red-800 dark:text-red-200",
      titleClass: "text-red-900 dark:text-red-100",
    },
  };

  const config = alertConfig[type];
  const DisplayIcon = icon || config.icon;

  return (
    <div className={cn("overflow-hidden rounded-2xl border", config.bgClass)}>
      <div className="border-b border-slate-200/70 p-4 dark:border-slate-700/70">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white dark:border-slate-700 dark:bg-slate-800">
            <DisplayIcon size={20} className={config.textClass} />
          </div>
          <div>
            <h4 className={cn("font-bold", config.titleClass)}>
              {alertBoxProps.title}
            </h4>
            <p className={cn("text-sm", config.textClass)}>
              {alertBoxProps.message}
            </p>
          </div>
        </div>
      </div>
      {items && items.length > 0 && (
        <div className="divide-y divide-slate-200/70 dark:divide-slate-700/70">
          {items.map((item, index) => (
            <div key={index} className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700 dark:text-slate-200">
                {item.label}
              </span>
              <span className="text-sm font-bold text-amber-600">
                {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
      {primaryAction && (
        <div className="bg-white/50 p-4 dark:bg-slate-900/20">
          <button
            onClick={primaryAction.onClick}
            className={cn(
              "w-full rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors",
              type === "error" && "bg-red-600 hover:bg-red-700",
              type === "warning" && "bg-amber-600 hover:bg-amber-700",
              type === "success" && "bg-green-600 hover:bg-green-700",
              type === "info" && "bg-blue-600 hover:bg-blue-700"
            )}
          >
            {primaryAction.label}
          </button>
        </div>
      )}
    </div>
  );
}
