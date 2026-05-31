import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon?: LucideIcon;
  iconName?: string;
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "primary" | "secondary";
  };
  className?: string;
}

/**
 * EmptyState - Clean empty state component
 */
export function EmptyState({
  icon: Icon,
  iconName,
  title,
  message,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {Icon ? (
          <Icon size={32} className="text-gray-400" />
        ) : (
          <span className="text-4xl">{iconName}</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm">{message}</p>
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "mt-6 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            action.variant === "primary"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
