import { QuickActionCard } from '@/components/quick-action-card';
import { Plus, Package, ScanLine, HelpCircle } from 'lucide-react';

export function DashboardQuickActions({ canCreateMore }: { canCreateMore: boolean }) {
  return (
    <section className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <QuickActionCard
        title="Tambah Tag"
        description="Buat tag baru untuk barang Anda"
        icon={Plus}
        href="/dashboard/new"
        color="blue"
        disabled={!canCreateMore}
      />
      <QuickActionCard
        title="Lihat Tag"
        description="Kelola semua tag Anda"
        icon={Package}
        href="#tags"
        color="emerald"
      />
      <QuickActionCard
        title="Scan QR"
        description="Simulasi scan untuk testing"
        icon={ScanLine}
        href="/scan"
        color="purple"
      />
      <QuickActionCard
        title="Bantuan"
        description="Panduan dan FAQ"
        icon={HelpCircle}
        href="/help"
        color="slate"
      />
    </section>
  );
}