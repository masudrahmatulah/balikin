import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface AdminCardProps {
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  className?: string;
  noPadding?: boolean;
}

/**
 * AdminCard - Card component yang konsisten dengan landing page
 *
 * Variants:
 * - default: Card standard dengan border dan shadow
 * - bordered: Card dengan border lebih tebal (border-2)
 * - elevated: Card dengan shadow lebih besar
 *
 * Usage:
 *   <AdminCard variant="bordered">
 *     <div>Content</div>
 *   </AdminCard>
 */
export function AdminCard({
  children,
  variant = 'default',
  className,
  noPadding = false,
}: AdminCardProps) {
  const variantStyles = {
    default: 'border border-gray-200 shadow-md hover:shadow-lg transition-shadow',
    bordered: 'border-2 border-blue-600 shadow-xl shadow-blue-600/20',
    elevated: 'border border-gray-200 shadow-xl',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      {noPadding ? (
        <>{children}</>
      ) : (
        <CardContent className="pt-6">{children}</CardContent>
      )}
    </Card>
  );
}

interface AdminCardWithHeaderProps {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: 'default' | 'bordered' | 'elevated';
  className?: string;
}

/**
 * AdminCardWithHeader - Card dengan header untuk halaman admin
 *
 * Usage:
 *   <AdminCardWithHeader
 *     title="Card Title"
 *     description="Optional description"
 *     variant="bordered"
 *   >
 *     <div>Content</div>
 *   </AdminCardWithHeader>
 */
export function AdminCardWithHeader({
  title,
  description,
  children,
  variant = 'default',
  className,
}: AdminCardWithHeaderProps) {
  const variantStyles = {
    default: 'border border-gray-200 shadow-md',
    bordered: 'border-2 border-blue-600 shadow-xl shadow-blue-600/20',
    elevated: 'border border-gray-200 shadow-xl',
  };

  return (
    <Card className={cn(variantStyles[variant], className)}>
      <CardHeader className="pb-4 border-b">
        <div className="text-xl font-bold text-gray-900">{title}</div>
        {description && (
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        )}
      </CardHeader>
      <CardContent className="pt-6">{children}</CardContent>
    </Card>
  );
}
