"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AdminCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  variant?: "default" | "bordered" | "highlighted";
  className?: string;
  noPadding?: boolean;
}

/**
 * AdminCard - Clean, minimal card component with consistent styling
 *
 * Variants:
 * - default: Clean card with subtle border and shadow
 * - bordered: Card with colored border for emphasis
 * - highlighted: Card with highlighted background for critical items
 *
 * Usage:
 *   <AdminCard variant="default">
 *     <div>Content</div>
 *   </AdminCard>
 */
export function AdminCard({
  children,
  title,
  description,
  variant = "default",
  className,
  noPadding = false,
}: AdminCardProps) {
  const variantStyles = {
    default: "border border-blue-100/80 bg-white/90 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all dark:border-slate-700 dark:bg-slate-900/90",
    bordered: "border-2 border-blue-600/20 bg-white/90 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all dark:border-blue-500/30 dark:bg-slate-900/90",
    highlighted:
      "border-2 border-blue-600/40 bg-gradient-to-br from-blue-50/80 to-purple-50/60 shadow-md hover:-translate-y-0.5 hover:shadow-lg transition-all dark:from-blue-950/30 dark:to-purple-950/20",
  };

  const content = (
    <div className={cn(variantStyles[variant], "rounded-2xl", className)}>
      {title && (
        <div className="border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h3 className="font-display text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>{children}</div>
    </div>
  );

  return content;
}

interface AdminCardWithHeaderProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "bordered" | "highlighted";
  className?: string;
  noPadding?: boolean;
}

/**
 * AdminCardWithHeader - Card with header for consistency
 */
export function AdminCardWithHeader({
  title,
  description,
  children,
  variant = "default",
  className,
  noPadding = false,
}: AdminCardWithHeaderProps) {
  return (
    <AdminCard
      title={title}
      description={description}
      variant={variant}
      className={className}
      noPadding={noPadding}
    >
      {children}
    </AdminCard>
  );
}
