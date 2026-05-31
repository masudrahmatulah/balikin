import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";

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
      bgClass: "bg-blue-50 border-blue-200",
      textClass: "text-blue-800",
      titleClass: "text-blue-900",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-amber-50 border-amber-200",
      textClass: "text-amber-800",
      titleClass: "text-amber-900",
    },
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-50 border-green-200",
      textClass: "text-green-800",
      titleClass: "text-green-900",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-red-50 border-red-200",
      textClass: "text-red-800",
      titleClass: "text-red-900",
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
  icon?: string;
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
      bgClass: "bg-blue-50 border-blue-200",
      textClass: "text-blue-800",
      titleClass: "text-blue-900",
    },
    warning: {
      icon: AlertTriangle,
      bgClass: "bg-amber-50 border-amber-200",
      textClass: "text-amber-800",
      titleClass: "text-amber-900",
    },
    success: {
      icon: CheckCircle,
      bgClass: "bg-green-50 border-green-200",
      textClass: "text-green-800",
      titleClass: "text-green-900",
    },
    error: {
      icon: XCircle,
      bgClass: "bg-red-50 border-red-200",
      textClass: "text-red-800",
      titleClass: "text-red-900",
    },
  };

  const config = alertConfig[type];
  const Icon = config.icon;

  return (
    <div className={cn("border rounded-lg overflow-hidden", config.bgClass)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
            <span className="text-xl">{icon}</span>
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
        <div className="divide-y divide-gray-200">
          {items.map((item, index) => (
            <div key={index} className="px-4 py-3 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
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
        <div className="p-4 bg-white/50">
          <button
            onClick={primaryAction.onClick}
            className={cn(
              "w-full py-2 px-4 rounded-md text-sm font-semibold text-white transition-colors",
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
