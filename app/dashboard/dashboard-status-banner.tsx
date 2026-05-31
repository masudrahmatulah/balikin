import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, ShieldCheck } from 'lucide-react';

interface DashboardStatusBannerProps {
  totalTags: number;
  lostTags: number;
}

export function DashboardStatusBanner({ totalTags, lostTags }: DashboardStatusBannerProps) {
  const hasLostTags = lostTags > 0;
  const borderClass = hasLostTags
    ? 'border-rose-200 bg-gradient-to-br from-rose-50 to-white shadow-rose-100/50'
    : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-white shadow-emerald-100/50';

  const iconBgClass = hasLostTags
    ? 'bg-gradient-to-br from-rose-500 to-rose-600'
    : 'bg-gradient-to-br from-emerald-500 to-emerald-600';

  const titleClass = hasLostTags ? 'text-rose-700' : 'text-emerald-700';
  const lostCountClass = hasLostTags ? 'text-rose-600' : 'text-slate-900';

  return (
    <section className="mb-6">
      <Card className={`border-2 overflow-hidden ${borderClass} shadow-lg`}>
        <CardContent className="p-5">
          <div className="flex items-center justify-between gap-4">
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
                  {hasLostTags ? `${lostTags} Tag Hilang` : 'SEMUA AMAN'}
                </h2>
                <p className="text-sm text-slate-600 md:text-base">
                  {hasLostTags ? 'Segera cek tag yang hilang' : 'Tidak ada tag yang hilang saat ini'}
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-slate-900" aria-label={`Total ${totalTags} tag aktif`}>
                  {totalTags}
                </p>
                <p className="text-xs text-slate-500 md:text-sm">Tag Aktif</p>
              </div>
              <div className="text-center">
                <p className={`text-2xl font-bold ${lostCountClass}`} aria-label={`${lostTags} tag hilang`}>
                  {lostTags}
                </p>
                <p className="text-xs text-slate-500 md:text-sm">Hilang</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}