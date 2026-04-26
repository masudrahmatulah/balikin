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
    bg: 'bg-blue-50',
    iconBg: 'bg-gradient-to-br from-blue-500 to-blue-600',
    iconText: 'text-white',
    border: 'border-blue-200',
    hoverBorder: 'hover:border-blue-300',
    hoverBg: 'hover:bg-blue-100/50',
    shadow: 'shadow-blue-100/40',
    hoverShadow: 'hover:shadow-blue-200/60',
  },
  emerald: {
    bg: 'bg-emerald-50',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    iconText: 'text-white',
    border: 'border-emerald-200',
    hoverBorder: 'hover:border-emerald-300',
    hoverBg: 'hover:bg-emerald-100/50',
    shadow: 'shadow-emerald-100/40',
    hoverShadow: 'hover:shadow-emerald-200/60',
  },
  amber: {
    bg: 'bg-amber-50',
    iconBg: 'bg-gradient-to-br from-amber-500 to-amber-600',
    iconText: 'text-white',
    border: 'border-amber-200',
    hoverBorder: 'hover:border-amber-300',
    hoverBg: 'hover:bg-amber-100/50',
    shadow: 'shadow-amber-100/40',
    hoverShadow: 'hover:shadow-amber-200/60',
  },
  purple: {
    bg: 'bg-purple-50',
    iconBg: 'bg-gradient-to-br from-purple-500 to-purple-600',
    iconText: 'text-white',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-300',
    hoverBg: 'hover:bg-purple-100/50',
    shadow: 'shadow-purple-100/40',
    hoverShadow: 'hover:shadow-purple-200/60',
  },
  slate: {
    bg: 'bg-slate-50',
    iconBg: 'bg-gradient-to-br from-slate-600 to-slate-700',
    iconText: 'text-white',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-slate-300',
    hoverBg: 'hover:bg-slate-100/50',
    shadow: 'shadow-slate-100/40',
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
        'group relative overflow-hidden rounded-2xl border-2 p-5 transition-all duration-300',
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
          <h3 className="text-base font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-slate-600 line-clamp-2">
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
            className="h-4 w-4 text-slate-600"
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
