import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  href: string;
  color?: 'blue' | 'green' | 'purple' | 'slate' | 'orange';
  disabled?: boolean;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
  },
  green: {
    bg: 'bg-green-50',
    text: 'text-green-600',
    hover: 'hover:bg-green-100',
    gradient: 'from-green-500 to-green-600',
  },
  purple: {
    bg: 'bg-purple-50',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-100',
    gradient: 'from-purple-500 to-purple-600',
  },
  slate: {
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    hover: 'hover:bg-slate-100',
    gradient: 'from-slate-500 to-slate-600',
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-100',
    gradient: 'from-orange-500 to-orange-600',
  },
};

export function ActionCard({
  title,
  description,
  icon: Icon,
  href,
  color = 'blue',
  disabled = false,
}: ActionCardProps) {
  const colors = colorClasses[color];

  return (
    <Link href={href}>
      <Card
        className={`transition-all hover:scale-105 hover:shadow-lg ${
          disabled ? 'opacity-50 cursor-not-allowed' : colors.hover
        } ${colors.bg} border-2`}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${colors.gradient} shadow-md`}
            >
              <Icon className={`h-6 w-6 text-white`} />
            </div>
            <div className="flex-1">
              <h3 className={`font-semibold ${colors.text}`}>{title}</h3>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
