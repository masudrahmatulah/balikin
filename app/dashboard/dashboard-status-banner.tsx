import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface DashboardStatusBannerProps {
  totalTags: number;
  lostTags: number;
}

export function DashboardStatusBanner({ totalTags, lostTags }: DashboardStatusBannerProps) {
  const hasLostTags = lostTags > 0;
  const borderClass = hasLostTags
    ? 'border-rose-200 bg-gradient-to-br from-rose-50 via-white to-orange-50 shadow-rose-100/50 dark:border-rose-800 dark:from-rose-950/40 dark:via-slate-900 dark:to-orange-950/20'
    : 'border-blue-200 bg-gradient-to-br from-blue-50 via-white to-purple-50 shadow-blue-100/50 dark:border-blue-800 dark:from-blue-950/40 dark:via-slate-900 dark:to-purple-950/20';

  const iconBgClass = hasLostTags
    ? 'bg-gradient-to-br from-rose-500 to-rose-600'
    : 'bg-gradient-to-br from-blue-600 to-indigo-600';

  const titleClass = hasLostTags ? 'text-rose-700 dark:text-rose-300' : 'text-blue-700 dark:text-blue-300';
  const lostCountClass = hasLostTags ? 'text-rose-600 dark:text-rose-300' : 'text-slate-900 dark:text-white';

  return (
    <section className="mb-6">
      <Card className={`overflow-hidden rounded-3xl border-2 ${borderClass} shadow-lg`}>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg ${iconBgClass}`}>
                {hasLostTags ? (
                  <AlertCircle className="h-7 w-7 text-white" aria-hidden="true" />
                ) : (
                  <ShieldCheck className="h-7 w-7 text-white" aria-hidden="true" />
                )}
              </div>
              <div>
                  <h2 className={`text-xl font-bold md:text-2xl ${titleClass}`}>
                   {hasLostTags ? `${lostTags} Tag Hilang` : 'Semua Tag Aman'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 md:text-base">
                  {hasLostTags ? 'Segera cek tag yang hilang' : 'Tidak ada tag yang hilang saat ini'}
                </p>
              </div>
            </div>
            <div className="flex justify-center gap-8 border-t border-slate-200/70 pt-4 sm:border-l sm:border-t-0 sm:pl-6 sm:pt-0">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900 dark:text-white" aria-label={`Total ${totalTags} tag aktif`}>
                  {totalTags}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">Tag Aktif</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${lostCountClass}`} aria-label={`${lostTags} tag hilang`}>
                  {lostTags}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 md:text-sm">Hilang</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
