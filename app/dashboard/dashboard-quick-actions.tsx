import { QuickActionCard } from '@/components/quick-action-card';
import { Plus, Package, ScanLine, HelpCircle } from 'lucide-react';

export function DashboardQuickActions({ canCreateMore }: { canCreateMore: boolean }) {
  return (
    <section className="mb-7" aria-labelledby="quick-actions-heading">
      <div className="mb-3 flex items-end justify-between gap-4">
        <div>
          <h2 id="quick-actions-heading" className="text-lg font-display font-semibold text-slate-900 dark:text-white">Aksi Cepat</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Mulai dari sini untuk mengelola perlindungan barang Anda.</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickActionCard title="Tambah Tag" description="Buat tag baru untuk barang Anda" icon={Plus} href="/dashboard/new" color="blue" disabled={!canCreateMore} />
        <QuickActionCard title="Lihat Tag" description="Kelola semua tag Anda" icon={Package} href="#tags" color="emerald" />
        <QuickActionCard title="Scan QR" description="Simulasi scan untuk testing" icon={ScanLine} href="/scan" color="purple" />
        <QuickActionCard title="Bantuan" description="Panduan dan FAQ" icon={HelpCircle} href="/help" color="slate" />
      </div>
    </section>
  );
}
