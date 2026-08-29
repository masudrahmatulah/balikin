import Link from 'next/link';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'slate';
  disabled?: boolean;
}

const colorVariants = {
  blue: {
    bg: 'bg-white/85 dark:bg-slate-900/80',
    iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600',
    iconText: 'text-white',
    border: 'border-blue-100',
    hoverBorder: 'hover:border-blue-300 dark:border-slate-700 dark:hover:border-blue-700',
    hoverBg: 'hover:bg-blue-50/70 dark:hover:bg-blue-950/30',
    shadow: 'shadow-blue-100/40 dark:shadow-none',
    hoverShadow: 'hover:shadow-blue-200/60',
  },
  emerald: {
    bg: 'bg-white/85 dark:bg-slate-900/80',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    iconText: 'text-white',
    border: 'border-indigo-100',
    hoverBorder: 'hover:border-indigo-300 dark:border-slate-700 dark:hover:border-indigo-700',
    hoverBg: 'hover:bg-indigo-50/70 dark:hover:bg-indigo-950/30',
    shadow: 'shadow-indigo-100/40 dark:shadow-none',
    hoverShadow: 'hover:shadow-indigo-200/60',
  },
  amber: {
    bg: 'bg-white/85 dark:bg-slate-900/80',
    iconBg: 'bg-gradient-to-br from-orange-500 to-amber-500',
    iconText: 'text-white',
    border: 'border-orange-100',
    hoverBorder: 'hover:border-orange-300 dark:border-slate-700 dark:hover:border-orange-700',
    hoverBg: 'hover:bg-orange-50/70 dark:hover:bg-orange-950/30',
    shadow: 'shadow-orange-100/40 dark:shadow-none',
    hoverShadow: 'hover:shadow-orange-200/60',
  },
  purple: {
    bg: 'bg-white/85 dark:bg-slate-900/80',
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    iconText: 'text-white',
    border: 'border-purple-100',
    hoverBorder: 'hover:border-purple-300 dark:border-slate-700 dark:hover:border-purple-700',
    hoverBg: 'hover:bg-purple-50/70 dark:hover:bg-purple-950/30',
    shadow: 'shadow-purple-100/40 dark:shadow-none',
    hoverShadow: 'hover:shadow-purple-200/60',
  },
  slate: {
    bg: 'bg-white/85 dark:bg-slate-900/80',
    iconBg: 'bg-gradient-to-br from-slate-600 to-slate-800',
    iconText: 'text-white',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600',
    hoverBg: 'hover:bg-slate-100/70 dark:hover:bg-slate-800',
    shadow: 'shadow-slate-100/40 dark:shadow-none',
    hoverShadow: 'hover:shadow-slate-200/60',
  },
};

export function QuickActionCard({
  title,
  description,
  icon: Icon,
  href,
  color = 'blue',
  disabled = false,
}: QuickActionCardProps) {
  const variant = colorVariants[color];

  return (
    <Link
      href={href}
      className={cn(
        'group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2',
        variant.bg,
        variant.border,
        variant.hoverBorder,
        variant.shadow,
        variant.hoverShadow,
        'hover:-translate-y-1 hover:shadow-lg',
        disabled && 'pointer-events-none opacity-50'
      )}
    >
      <div className="flex items-start gap-4">
        {/* Icon Container */}
        <div
          className={cn(
            'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl shadow-md transition-transform duration-300',
            variant.iconBg,
            'group-hover:scale-110'
          )}
        >
          <Icon className={cn('h-6 w-6', variant.iconText)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700 dark:text-white dark:group-hover:text-blue-300">
            {title}
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
            {description}
          </p>
        </div>

        {/* Arrow Icon */}
        <div
          className={cn(
            'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full opacity-0 transition-all duration-300',
            variant.hoverBg,
            'group-hover:opacity-100'
          )}
        >
          <svg
             className="h-4 w-4 text-slate-600 dark:text-slate-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>
      </div>

      {/* Hover Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
    </Link>
  );
}
