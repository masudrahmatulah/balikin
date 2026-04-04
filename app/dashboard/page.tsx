import { redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, count } from 'drizzle-orm';
import { TagCard } from '@/components/tag-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Plus,
  AlertCircle,
  ShieldCheck,
  TriangleAlert,
  ScanLine,
  Sparkles,
  ArrowRight,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/session';
import { UpsellBanner } from '@/components/upsell-banner';
import { FREE_TAG_LIMIT } from '@/lib/constants';
import { Suspense, type ReactNode } from 'react';
import { SignOutButton } from '@/components/sign-out-button';

interface DashboardPageProps {
  searchParams: Promise<{ limit?: string }>;
}

function DashboardStatCard({
  title,
  value,
  description,
  icon,
  accentClass,
}: {
  title: string;
  value: string;
  description: string;
  icon: ReactNode;
  accentClass: string;
}) {
  return (
    <Card className="border-white/60 bg-white/85 shadow-lg shadow-slate-200/60 backdrop-blur-sm">
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="mt-2 sm:mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
            <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2">{description}</p>
          </div>
          <div className={`rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex-shrink-0 ${accentClass}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

async function DashboardContent({ limitReached }: { limitReached?: boolean }) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userTags = await db.query.tags.findMany({
    where: eq(tags.ownerId, session.user.id),
    orderBy: (tags, { desc }) => [desc(tags.createdAt)],
  });

  // Get scan count for each tag
  const tagsWithScanCount = await Promise.all(
    userTags.map(async (tag) => {
      const scanResult = await db
        .select({ count: count() })
        .from(scanLogs)
        .where(eq(scanLogs.tagId, tag.id));

      return {
        ...tag,
        scanCount: scanResult[0]?.count || 0,
        ownerEmail: session.user.email ?? null,
      };
    })
  );

  // Check if user has any premium tags
  const hasPremiumTag = userTags.some(tag => tag.tier === 'premium');

  // Count free tags
  const freeTagCount = userTags.filter(tag => tag.tier === 'free' || !tag.tier).length;
  const isFreeUser = !hasPremiumTag && freeTagCount > 0;
  const canCreateMore = freeTagCount < FREE_TAG_LIMIT || hasPremiumTag;
  const isAtLimit = !hasPremiumTag && freeTagCount >= FREE_TAG_LIMIT;
  const lostTagCount = userTags.filter(tag => tag.status === 'lost').length;
  const totalScans = tagsWithScanCount.reduce((sum, tag) => sum + tag.scanCount, 0);
  const packageLabel = hasPremiumTag ? 'Premium Owner' : 'Digital Tag Free';
  const userEmail = session.user.email ?? 'Pengguna Balikin';
  const greetingName = userEmail.split('@')[0]?.replace(/[._-]/g, ' ') || 'Pengguna';

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#eef5ff_45%,_#f8fafc_100%)]">
      <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-2xl bg-blue-600 p-2 text-white shadow-lg shadow-blue-600/30">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Owner Control Center</p>
              <h1 className="text-lg font-semibold text-slate-950">Balikin Dashboard</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-600 md:inline">
              {userEmail}
            </span>
            <SignOutButton />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-6xl px-4 py-8 md:py-10">
        <section className="relative overflow-hidden rounded-[20px] sm:rounded-[28px] border border-blue-200/70 bg-[linear-gradient(135deg,_rgba(29,78,216,0.98),_rgba(14,116,144,0.94)_55%,_rgba(15,23,42,0.96))] px-4 py-5 sm:px-6 sm:py-7 md:px-8 md:py-8 text-white shadow-2xl shadow-blue-950/15">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.24),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(125,211,252,0.26),_transparent_22%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="max-w-2xl">
              <Badge className="mb-3 sm:mb-4 border border-white/20 bg-white/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-white hover:bg-white/10">
                <Sparkles className="mr-1.5 h-3 w-3 sm:mr-2 sm:h-3.5 sm:w-3.5" />
                <span className="text-xs sm:text-sm">Pusat kontrol tag Anda</span>
              </Badge>
              <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight break-words">
                Halo, <span className="break-all sm:break-normal">{greetingName}</span>. Semua tag penting Anda terpantau dari sini.
              </h2>
              <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm md:text-base leading-5 sm:leading-6 text-blue-100">
                Pantau status aman atau hilang, lihat performa scan, dan ambil tindakan penting dalam beberapa klik tanpa kehilangan rasa percaya diri pada brand Balikin.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Card className="border-white/15 bg-white/10 text-white shadow-none backdrop-blur-sm">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-blue-100/80">Paket Anda</p>
                  <div className="mt-2 flex items-center gap-2">
                    {hasPremiumTag ? <Crown className="h-4 w-4 text-amber-300" /> : <ShieldCheck className="h-4 w-4 text-cyan-200" />}
                    <p className="text-lg font-semibold">{packageLabel}</p>
                  </div>
                  <p className="mt-1 text-sm text-blue-100">
                    {hasPremiumTag ? 'Akses lebih fleksibel dan tampil lebih meyakinkan.' : `Saat ini ${freeTagCount}/${FREE_TAG_LIMIT} slot digital gratis sudah terpakai untuk DIY wallpaper, cetak mandiri, dan kontak darurat.`}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-white/15 bg-white/10 text-white shadow-none backdrop-blur-sm">
                <CardContent className="p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-blue-100/80">Status prioritas</p>
                  <div className="mt-2 flex items-center gap-2">
                    <TriangleAlert className={`h-4 w-4 ${lostTagCount > 0 ? 'text-rose-300' : 'text-emerald-300'}`} />
                    <p className="text-lg font-semibold">
                      {lostTagCount > 0 ? `${lostTagCount} tag butuh perhatian` : 'Semua tag dalam kondisi aman'}
                    </p>
                  </div>
                  <p className="mt-1 text-sm text-blue-100">
                    {lostTagCount > 0 ? 'Mode hilang aktif dan perlu dipantau lebih dekat.' : 'Belum ada tag yang masuk mode hilang.'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mt-4 sm:mt-6 grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="Total Tag"
            value={String(userTags.length)}
            description={userTags.length === 0 ? 'Siap mulai dengan digital tag pertama Anda.' : 'Jumlah digital tag aktif di akun Anda.'}
            icon={<QrCode className="h-4 w-4 sm:h-5 sm:w-5 text-blue-700" />}
            accentClass="bg-blue-100 text-blue-700"
          />
          <DashboardStatCard
            title="Tag Hilang"
            value={String(lostTagCount)}
            description={lostTagCount > 0 ? 'Butuh tindak lanjut dan pemantauan cepat.' : 'Belum ada status hilang yang aktif.'}
            icon={<TriangleAlert className="h-4 w-4 sm:h-5 sm:w-5 text-rose-700" />}
            accentClass="bg-rose-100 text-rose-700"
          />
          <DashboardStatCard
            title="Total Scan"
            value={String(totalScans)}
            description={totalScans > 0 ? 'Semua interaksi scan dari seluruh tag Anda.' : 'Belum ada scan yang tercatat sejauh ini.'}
            icon={<ScanLine className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-700" />}
            accentClass="bg-cyan-100 text-cyan-700"
          />
          <DashboardStatCard
            title="Paket Akun"
            value={hasPremiumTag ? 'Premium' : 'Free'}
            description={hasPremiumTag ? 'Tag premium aktif dan siap tampil lebih meyakinkan.' : 'Paket free cocok untuk digital tag DIY, wallpaper, dan cetak mandiri.'}
            icon={hasPremiumTag ? <Crown className="h-4 w-4 sm:h-5 sm:w-5 text-amber-700" /> : <ShieldCheck className="h-4 w-4 sm:h-5 sm:w-5 text-violet-700" />}
            accentClass={hasPremiumTag ? 'bg-amber-100 text-amber-700' : 'bg-violet-100 text-violet-700'}
          />
        </section>

        <section className="mt-4 sm:mt-6 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          <Card className="border-slate-200/80 bg-white/85 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-slate-950">Aksi Cepat</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Semua hal penting untuk mengelola tag Anda tanpa berputar-putar.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 pt-0 sm:grid-cols-2">
              <Link href="/dashboard/new" className={canCreateMore ? '' : 'pointer-events-none'}>
                <Card className={`h-full border transition-all ${canCreateMore ? 'border-blue-200 bg-blue-50/80 hover:-translate-y-0.5 hover:shadow-md' : 'border-slate-200 bg-slate-100/80 opacity-70'}`}>
                  <CardContent className="flex h-full items-start gap-3 sm:gap-4 p-4 sm:p-5">
                    <div className="rounded-xl sm:rounded-2xl bg-blue-600 p-2.5 sm:p-3 text-white shadow-lg shadow-blue-600/25 flex-shrink-0">
                      <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-950 text-sm sm:text-base">Tambah Tag Baru</p>
                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 line-clamp-2">
                        Buat digital tag baru untuk wallpaper lockscreen atau cetak mandiri.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link href={hasPremiumTag ? '/upgrade' : '/stickers/checkout'}>
                <Card className="h-full border-amber-200 bg-gradient-to-br from-amber-50 to-white transition-all hover:-translate-y-0.5 hover:shadow-md">
                  <CardContent className="flex h-full items-start gap-3 sm:gap-4 p-4 sm:p-5">
                    <div className="rounded-xl sm:rounded-2xl bg-amber-500 p-2.5 sm:p-3 text-white shadow-lg shadow-amber-500/25 flex-shrink-0">
                      <Crown className="h-4 w-4 sm:h-5 sm:w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-950 text-sm sm:text-base truncate">
                          {hasPremiumTag ? 'Kelola Upgrade Premium' : 'Pesan Sticker Vinyl'}
                        </p>
                        <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-600 flex-shrink-0" />
                      </div>
                      <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600 line-clamp-2">
                        {hasPremiumTag ? 'Lihat detail layanan premium dan pengembangan berikutnya.' : 'Pesan sticker vinyl pack isi 6 sebagai jembatan paling pas sebelum upgrade ke akrilik premium.'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/85 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-lg sm:text-xl text-slate-950">Ringkasan Slot</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Biar batas paket dan prioritas tetap gampang terbaca.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 pt-0">
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600">
                  <span className="text-xs sm:text-sm">Digital tag gratis terpakai</span>
                  <span className="font-semibold text-slate-950 text-sm sm:text-base">{freeTagCount}/{FREE_TAG_LIMIT}</span>
                </div>
                <div className="mt-2 sm:mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${isAtLimit ? 'bg-amber-500' : 'bg-blue-600'}`}
                    style={{ width: `${Math.min((freeTagCount / FREE_TAG_LIMIT) * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-white p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-slate-900">
                  {lostTagCount > 0 ? 'Prioritaskan digital tag yang sedang hilang.' : 'Semua digital tag berada dalam kondisi yang terkendali.'}
                </p>
                <p className="mt-1 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                  {lostTagCount > 0 ? 'Pastikan channel notifikasi dan kontak Anda tetap aktif agar setiap scan penting cepat terlihat.' : 'Anda bisa fokus menambah digital tag baru atau menyiapkan upgrade ke stiker / gantungan premium saat dibutuhkan.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mt-4 sm:mt-6 grid gap-4 lg:grid-cols-2">
          <Card className="border-slate-200/80 bg-white/85 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg text-slate-950">Aturan Notifikasi per Paket</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Pengiriman alert scan hanya aktif saat tag berada di mode hilang.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-950">Free</p>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                  Alert scan dikirim via email akun Anda. Cocok untuk digital tag DIY tanpa notifikasi WhatsApp.
                </p>
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-blue-200 bg-blue-50 p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-semibold text-slate-950">Sticker / Acrylic</p>
                <p className="mt-1.5 sm:mt-2 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                  Alert scan dikirim via WhatsApp secara default, dan email tambahan bisa Anda aktifkan per tag.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/80 bg-white/85 shadow-lg shadow-slate-200/60">
            <CardHeader className="pb-3">
              <CardTitle className="text-base sm:text-lg text-slate-950">Catatan Penting</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Supaya alert tetap relevan dan tidak membanjiri Anda.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                Balikin menerapkan jeda alert 15 menit per tag. Scan berulang dalam periode ini tetap tercatat, tetapi notifikasi tidak dikirim ulang.
              </div>
              <div className="rounded-xl sm:rounded-2xl border border-slate-200 bg-slate-50 p-3 sm:p-4 text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                Email alert dikirim ke <span className="font-medium text-slate-900 break-all">{userEmail}</span>. Untuk sticker vinyl dan acrylic, nomor WhatsApp di setiap tag harus terisi agar alert instan dapat dikirim.
              </div>
            </CardContent>
          </Card>
        </section>

        {isFreeUser && (
          <section className="mt-6">
            <UpsellBanner variant="dashboard" />
          </section>
        )}

        {(isAtLimit || limitReached) && (
          <Alert className="mt-6 border-amber-200 bg-amber-50/95 shadow-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertTitle className="text-amber-900">Limit free user tercapai</AlertTitle>
            <AlertDescription className="text-amber-800">
              Anda sudah memakai {FREE_TAG_LIMIT} slot digital gratis. Upgrade ke Premium untuk mendapatkan lebih banyak tag, bahan fisik yang lebih tahan air, dan pengalaman yang lebih meyakinkan.
            </AlertDescription>
          </Alert>
        )}

        <section className="mt-6 sm:mt-8">
          <div className="mb-4 sm:mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <h3 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-950">Tag Saya</h3>
              <p className="text-xs sm:text-sm text-slate-600 mt-1">
                {userTags.length === 0 ? 'Belum ada digital tag aktif di akun Anda.' : `${userTags.length} digital tag siap dipantau, diubah statusnya, dan diunduh sebagai aset DIY.`}
              </p>
            </div>
            <Link href="/dashboard/new" className="w-full sm:w-auto">
              <Button disabled={!canCreateMore} className="w-full sm:w-auto shadow-lg shadow-blue-600/20 min-h-[44px]">
                <Plus className="mr-2 h-4 w-4" />
                Tambah Tag
              </Button>
            </Link>
          </div>

        {tagsWithScanCount.length === 0 ? (
          <Card className="overflow-hidden border-white/70 bg-white/90 shadow-xl shadow-slate-200/70">
            <CardContent className="relative px-4 sm:px-6 py-10 sm:py-14 text-center">
              <div className="absolute inset-x-0 top-0 h-24 sm:h-32 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.16),_transparent_60%)]" />
              <div className="relative">
                <div className="mx-auto mb-4 sm:mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-[20px] sm:rounded-[26px] bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-600/30">
                  <QrCode className="h-8 w-8 sm:h-10 sm:w-10" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-950">
                  Mulai dengan digital tag pertama Anda
                </h3>
                <p className="mx-auto mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm leading-5 sm:leading-6 text-slate-600">
                  Gunakan untuk wallpaper lockscreen, cetak mandiri, atau profil kontak darurat. Saat butuh hasil yang lebih tahan air dan profesional, Anda bisa upgrade ke sticker vinyl pack atau versi akrilik premium.
                </p>
              </div>
              <Link href="/dashboard/new" className="inline-block w-full sm:w-auto">
                <Button className="mt-5 sm:mt-7 w-full sm:w-auto shadow-lg shadow-blue-600/20 min-h-[44px]">
                  <Plus className="mr-2 h-4 w-4" />
                  Buat Tag Baru
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:gap-5 grid-cols-1 lg:grid-cols-2">
            {tagsWithScanCount.map((tag) => (
              <TagCard key={tag.id} {...tag} />
            ))}
          </div>
        )}
        </section>
      </div>
    </div>
  );
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const limitReached = params.limit === '1';

  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50">Loading...</div>}>
      <DashboardContent limitReached={limitReached} />
    </Suspense>
  );
}
