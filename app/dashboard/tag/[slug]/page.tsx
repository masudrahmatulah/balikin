import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { notificationLogs, tags, scanLogs, userModuleSelections } from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, ExternalLink, FileText, Smartphone, Crown, BellRing, GraduationCap } from 'lucide-react';
import { TagEditPanel } from '@/components/tag-edit-panel';
import Link from 'next/link';
import QRCode from 'qrcode';
import { DownloadCenter } from '@/components/download-center';
import { TabTwoActivation } from '@/components/tab-two-activation';
import { getTagProductLabel, isAcrylicProduct, isFreeProduct, isStickerProduct } from '@/lib/product';
import styles from './tag-detail.module.css';

interface TagDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function TagDetailPage({ params }: TagDetailPageProps) {
  const session = await getSession();

  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const { slug } = await params;

  const tag = await db.query.tags.findFirst({
    where: and(eq(tags.slug, slug), eq(tags.app_id, 'balikin_id')),
  });

  if (!tag || tag.ownerId !== session.user.id) {
    notFound();
  }

  const isFreeTag = isFreeProduct(tag);
  const isStickerTag = isStickerProduct(tag);
  const isAcrylicTag = isAcrylicProduct(tag);
  const productLabel = getTagProductLabel(tag);
  const stickerHistoryCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const scans = await db.query.scanLogs.findMany({
    where: isStickerTag
      ? and(eq(scanLogs.tagId, tag.id), eq(scanLogs.app_id, 'balikin_id'), gte(scanLogs.scannedAt, stickerHistoryCutoff))
      : and(eq(scanLogs.tagId, tag.id), eq(scanLogs.app_id, 'balikin_id')),
    orderBy: (scanLogs, { desc }) => [desc(scanLogs.scannedAt)],
    limit: 10,
  });

  const recentNotificationAttempts = !isFreeTag
    ? await db.query.notificationLogs.findMany({
        where: and(eq(notificationLogs.tagId, tag.id), eq(notificationLogs.app_id, 'balikin_id')),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
        limit: 5,
      })
    : [];

  // Check if user has Student Kit module enabled
  const studentKitModule = await db.query.userModuleSelections.findFirst({
    where: and(
      eq(userModuleSelections.userId, session.user.id),
      eq(userModuleSelections.moduleType, 'student'),
      eq(userModuleSelections.isActive, true),
      eq(userModuleSelections.app_id, 'balikin_id')
    ),
  });
  const hasStudentKit = !!studentKitModule;

  // Generate QR Code
  const qrUrl = `${process.env.BETTER_AUTH_URL || 'http://localhost:3000'}/p/${slug}`;
  const qrCode = await QRCode.toDataURL(qrUrl, {
    width: 300,
    margin: 2,
    color: {
      dark: '#1f2937',
      light: '#ffffff',
    },
  });
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white text-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 dark:text-slate-100">
      <header className="border-b border-blue-100/80 bg-white/80 backdrop-blur dark:border-slate-700 dark:bg-slate-900/80">
        <div className="container mx-auto px-4 py-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="w-full justify-center sm:w-auto">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code Card */}
          <Card className="border-blue-100/80 shadow-xl shadow-blue-900/5 dark:border-slate-700">
            <CardHeader>
              <CardTitle>{isFreeTag ? 'Download Center Digital Tag' : `${productLabel} untuk ${tag.name}`}</CardTitle>
              <CardDescription>
                {isFreeTag
                  ? 'Pilih aset QR digital untuk wallpaper lockscreen atau cetak mandiri.'
                  : 'Scan untuk melihat profil tag ini'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center rounded-lg border border-slate-200 bg-white p-4">
                <img src={qrCode} alt={`QR Code untuk ${tag.name}`} className="w-full max-w-[250px]" />
              </div>
              <div className={styles.composedPanel}>
                <DownloadCenter
                  tagName={tag.name}
                  slug={tag.slug}
                  qrDataUrl={qrCode}
                  tier={tag.tier}
                />
              </div>

              <div className="space-y-2">
                {tag.hasTabTwoEnabled && hasStudentKit && (
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" asChild>
                    <Link href={`/p/${slug}/private/student`}>
                      <GraduationCap className="mr-2 h-4 w-4" />
                      Buka Student Kit
                    </Link>
                  </Button>
                )}
                 {!isFreeTag && (
                   <Button variant="outline" className="w-full" asChild>
                     <a href={`/dashboard/tag/${slug}/qr`} download>
                       <FileText className="mr-2 h-4 w-4" />
                       Download PDF
                     </a>
                   </Button>
                 )}
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/p/${slug}?preview=1`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka Halaman Publik
                  </a>
                </Button>
              </div>
              <div className="text-center text-xs text-slate-600 dark:text-slate-400">
                <p>URL:</p>
                <p className="mt-1 block w-full min-w-0 break-all whitespace-normal font-mono">
                  {qrUrl}
                </p>
              </div>
                {isFreeTag && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                   Digital tag free cocok untuk lockscreen HP, tablet, atau cetak mandiri sementara. Download PNG ber-watermark tersedia gratis. Upgrade ke Printable Tag untuk PDF tanpa watermark dan lebih banyak lisensi.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tag Info & Scans */}
          <div className="space-y-6">
            {/* Tag Info */}
            <Card className="border-blue-100/80 shadow-xl shadow-blue-900/5 dark:border-slate-700">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="break-words">{tag.name}</CardTitle>
                    <CardDescription className="block w-full min-w-0 break-all whitespace-normal">/p/{tag.slug}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={tag.status === 'lost' ? 'destructive' : 'success'} className={tag.status === 'lost' ? 'bg-brand-red-dark text-white hover:bg-brand-red-dark/90' : 'bg-green-700 text-white hover:bg-green-800'}>
                      {tag.status === 'lost' ? 'Hilang' : 'Normal'}
                    </Badge>
                    {isFreeTag && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200">
                        Digital Tag Free
                      </Badge>
                    )}
                    {!isFreeTag && (
                      <Badge variant="outline" className={isStickerTag ? 'border-slate-300 bg-slate-50 text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'}>
                        {productLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Kontak WhatsApp</div>
                  <div className="text-slate-900 dark:text-slate-100">{tag.contactWhatsapp}</div>
                </div>
                {tag.customMessage && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Pesan Sapaan</div>
                    <div className="text-slate-900 bg-blue-50 p-2 rounded mt-1 dark:bg-slate-800 dark:text-slate-100">
                      {tag.customMessage}
                    </div>
                  </div>
                )}
              {isAcrylicTag && tag.serialNumber && (
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
                  <span className="font-medium">Serial fisik</span>
                  <span className="ml-2 font-mono font-semibold tracking-wide">{tag.serialNumber}</span>
                  <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Simpan serial ini untuk bantuan identifikasi. Ini bukan PIN aktivasi.</p>
                </div>
              )}
                {tag.rewardNote && (
                  <div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Imbalan</div>
                    <div className="text-slate-900 bg-green-50 p-2 rounded mt-1 dark:bg-green-950/40 dark:text-green-200">
                      {tag.rewardNote}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300">Dibuat</div>
                  <div className="text-slate-600 text-sm dark:text-slate-400">
                    {tag.createdAt ? new Date(tag.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }) : '-'}
                  </div>
                </div>
                {!isFreeTag && (
                  <div className={`rounded-xl border p-3 text-sm ${isAcrylicTag ? 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {isAcrylicTag
                      ? 'Acrylic Premium memakai priority WhatsApp alert lebih dulu, lalu otomatis fallback ke jalur standar bila kanal utama sedang bermasalah.'
                      : 'Sticker Vinyl memakai jalur WhatsApp standar dengan ringkasan notifikasi yang tetap cepat dan ringan.'}
                  </div>
                )}
                <div className={`pt-2 ${styles.composedPanel}`}>
                  <TagEditPanel
                    tagId={tag.id}
                    tagName={tag.name}
                    contactWhatsapp={tag.contactWhatsapp ?? ''}
                    customMessage={tag.customMessage ?? null}
                    rewardNote={tag.rewardNote ?? null}
                    isFree={isFreeTag}
                    variant="desktop"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tab 2 - Modul Privat */}
            <div className={styles.composedPanel}>
              <TabTwoActivation
                tagId={tag.id}
                tagName={tag.name}
                hasTabTwoEnabled={tag.hasTabTwoEnabled || false}
                slug={tag.slug}
              />
            </div>

            {/* Scan History */}
            <Card className="border-blue-100/80 shadow-xl shadow-blue-900/5 dark:border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {isFreeTag ? 'Info Scan' : isStickerTag ? 'Riwayat Scan 30 Hari' : 'Riwayat Scan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scans.length === 0 ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400 text-center py-4">
                    Belum ada scan tercatat
                  </p>
                ) : isFreeTag ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 dark:border-slate-700 dark:bg-slate-800">
                      <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        Seseorang telah menscan digital tag Anda sebanyak {scans.length} kali.
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">
                        Data scan tetap tercatat, tetapi detail lokasi akurat dan notifikasi WhatsApp kami simpan sebagai keuntungan Premium.
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/40">
                      <div className="flex items-start gap-3">
                        <Crown className="mt-0.5 h-5 w-5 text-amber-700 dark:text-amber-300" />
                        <div>
                          <p className="text-sm font-medium text-amber-950 dark:text-amber-100">
                            Ingin tracking lebih lengkap?
                          </p>
                          <p className="mt-1 text-sm leading-6 text-amber-800 dark:text-amber-200">
                            Upgrade ke Sticker Vinyl atau Acrylic Premium untuk mendapatkan positioning yang lebih meyakinkan, produk fisik yang tahan lama, dan teaser tracking yang lebih bernilai.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">
                      Scan terakhir:
                      {' '}
                      {scans[0]?.scannedAt ? new Date(scans[0].scannedAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {isStickerTag && (
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Riwayat untuk Sticker Vinyl dibatasi ke 30 hari terakhir agar fokus pada scan yang paling relevan.
                      </div>
                    )}
                    {scans.map((scan) => (
                      <div key={scan.id} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
                        <div className="p-2 bg-blue-100 rounded-full dark:bg-blue-950">
                          <MapPin className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            {scan.city || 'Lokasi tidak diketahui'}
                            {scan.locationSource === 'gps' ? (
                              <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                                GPS presisi{scan.accuracyMeters ? ` (±${scan.accuracyMeters} m)` : ''}
                              </span>
                            ) : (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                                Perkiraan kota
                              </span>
                            )}
                            {scan.deviceInfo && (
                              <span className="flex items-center gap-1 break-all text-xs text-slate-600 dark:text-slate-400">
                                <Smartphone className="h-3 w-3" />
                                {scan.deviceInfo}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                            <Calendar className="h-3 w-3" />
                            {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </div>
                          {scan.ipAddress && scan.ipAddress !== 'unknown' && (
                            <div className="mt-1 break-all text-xs text-slate-600 dark:text-slate-400">
                              IP: {scan.ipAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    <p className="text-xs leading-5 text-slate-600 dark:text-slate-400">
                      “Perkiraan kota” = lokasi berbasis IP (bisa meleset, jangan dianggap titik tepat).
                      “GPS presisi” = penemu mengizinkan lokasi browser.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {!isFreeTag && (
              <Card className="border-blue-100/80 shadow-xl shadow-blue-900/5 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BellRing className="h-5 w-5" />
                    Log Notifikasi WhatsApp
                  </CardTitle>
                  <CardDescription>
                    {isAcrylicTag
                      ? 'Audit pengiriman untuk jalur priority dan fallback standar.'
                      : 'Audit pengiriman untuk jalur WhatsApp standar.'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {recentNotificationAttempts.length === 0 ? (
                    <p className="py-4 text-center text-sm text-slate-600 dark:text-slate-400">
                      Belum ada attempt notifikasi WhatsApp tercatat.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentNotificationAttempts.map((attempt) => (
                        <div key={attempt.id} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={attempt.status === 'sent' ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200' : 'border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-200'}>
                              {attempt.status === 'sent' ? 'Sent' : 'Failed'}
                            </Badge>
                            <Badge variant="outline" className={attempt.channel === 'priority' ? 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200' : 'border-slate-200 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200'}>
                              {attempt.channel === 'priority' ? 'Priority' : 'Standard'}
                            </Badge>
                            <span className="text-xs uppercase tracking-[0.16em] text-slate-600 dark:text-slate-400">{attempt.provider}</span>
                          </div>
                          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
                            {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </div>
                          {attempt.errorMessage && (
                            <div className="mt-2 text-sm text-red-700 dark:text-red-300">
                              {attempt.errorMessage}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
