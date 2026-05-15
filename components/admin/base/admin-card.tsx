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
    default: "border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow",
    bordered: "border-2 border-blue-600 shadow-md hover:shadow-lg transition-shadow",
    highlighted:
      "border-2 border-amber-500 bg-amber-50/50 shadow-md hover:shadow-lg transition-shadow",
  };

  const content = (
    <div className={cn(variantStyles[variant], "rounded-lg", className)}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
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
