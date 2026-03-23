import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { notificationLogs, tags, scanLogs } from '@/db/schema';
import { and, eq, gte } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Calendar, ExternalLink, FileText, Smartphone, Crown, BellRing } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';
import { DownloadCenter } from '@/components/download-center';
import { getTagProductLabel, isAcrylicProduct, isFreeProduct, isStickerProduct } from '@/lib/product';

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
    where: eq(tags.slug, slug),
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
      ? and(eq(scanLogs.tagId, tag.id), gte(scanLogs.scannedAt, stickerHistoryCutoff))
      : eq(scanLogs.tagId, tag.id),
    orderBy: (scanLogs, { desc }) => [desc(scanLogs.scannedAt)],
    limit: 10,
  });

  const recentNotificationAttempts = !isFreeTag
    ? await db.query.notificationLogs.findMany({
        where: eq(notificationLogs.tagId, tag.id),
        orderBy: (logs, { desc }) => [desc(logs.createdAt)],
        limit: 5,
      })
    : [];

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
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
          <Card>
            <CardHeader>
              <CardTitle>{isFreeTag ? 'Download Center Digital Tag' : `${productLabel} untuk ${tag.name}`}</CardTitle>
              <CardDescription>
                {isFreeTag
                  ? 'Pilih aset QR digital untuk wallpaper lockscreen atau cetak mandiri.'
                  : 'Scan untuk melihat profil tag ini'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center rounded-lg border bg-white p-4">
                <img src={qrCode} alt={`QR Code untuk ${tag.name}`} className="w-full max-w-[250px]" />
              </div>
              <DownloadCenter
                tagName={tag.name}
                slug={tag.slug}
                qrDataUrl={qrCode}
                tier={tag.tier}
              />

              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/dashboard/tag/${slug}/qr`} download>
                    <FileText className="mr-2 h-4 w-4" />
                    {isFreeTag ? 'Download PDF Panduan' : 'Download PDF'}
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka Halaman Publik
                  </a>
                </Button>
              </div>
              <div className="text-center text-xs text-gray-500">
                <p>URL:</p>
                <p className="mt-1 block w-full min-w-0 break-all whitespace-normal font-mono">
                  {qrUrl}
                </p>
              </div>
              {isFreeTag && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  Digital tag free cocok untuk lockscreen HP, tablet, atau cetak mandiri sementara. Upgrade ke Sticker Vinyl atau Acrylic Premium saat Anda butuh hasil fisik yang lebih tahan air dan lebih profesional.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Tag Info & Scans */}
          <div className="space-y-6">
            {/* Tag Info */}
            <Card>
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle className="break-words">{tag.name}</CardTitle>
                    <CardDescription className="block w-full min-w-0 break-all whitespace-normal">/p/{tag.slug}</CardDescription>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant={tag.status === 'lost' ? 'destructive' : 'success'}>
                      {tag.status === 'lost' ? 'Hilang' : 'Normal'}
                    </Badge>
                    {isFreeTag && (
                      <Badge variant="outline" className="border-blue-200 bg-blue-50 text-blue-700">
                        Digital Tag Free
                      </Badge>
                    )}
                    {!isFreeTag && (
                      <Badge variant="outline" className={isStickerTag ? 'border-slate-300 bg-slate-50 text-slate-700' : 'border-amber-200 bg-amber-50 text-amber-700'}>
                        {productLabel}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Kontak WhatsApp</div>
                  <div className="text-gray-900">{tag.contactWhatsapp}</div>
                </div>
                {tag.customMessage && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Pesan Sapaan</div>
                    <div className="text-gray-900 bg-blue-50 p-2 rounded mt-1">
                      {tag.customMessage}
                    </div>
                  </div>
                )}
                {tag.rewardNote && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Imbalan</div>
                    <div className="text-gray-900 bg-green-50 p-2 rounded mt-1">
                      {tag.rewardNote}
                    </div>
                  </div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-700">Dibuat</div>
                  <div className="text-gray-600 text-sm">
                    {tag.createdAt ? new Date(tag.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    }) : '-'}
                  </div>
                </div>
                {!isFreeTag && (
                  <div className={`rounded-xl border p-3 text-sm ${isAcrylicTag ? 'border-amber-200 bg-amber-50 text-amber-900' : 'border-slate-200 bg-slate-50 text-slate-700'}`}>
                    {isAcrylicTag
                      ? 'Acrylic Premium memakai priority WhatsApp alert lebih dulu, lalu otomatis fallback ke jalur standar bila kanal utama sedang bermasalah.'
                      : 'Sticker Vinyl memakai jalur WhatsApp standar dengan ringkasan notifikasi yang tetap cepat dan ringan.'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Scan History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  {isFreeTag ? 'Info Scan' : isStickerTag ? 'Riwayat Scan 30 Hari' : 'Riwayat Scan'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scans.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada scan tercatat
                  </p>
                ) : isFreeTag ? (
                  <div className="space-y-4">
                    <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <p className="text-sm font-medium text-slate-900">
                        Seseorang telah menscan digital tag Anda sebanyak {scans.length} kali.
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        Data scan tetap tercatat, tetapi detail lokasi akurat dan notifikasi WhatsApp kami simpan sebagai keuntungan Premium.
                      </p>
                    </div>
                    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                      <div className="flex items-start gap-3">
                        <Crown className="mt-0.5 h-5 w-5 text-amber-600" />
                        <div>
                          <p className="text-sm font-medium text-amber-950">
                            Ingin tracking lebih lengkap?
                          </p>
                          <p className="mt-1 text-sm leading-6 text-amber-800">
                            Upgrade ke Sticker Vinyl atau Acrylic Premium untuk mendapatkan positioning yang lebih meyakinkan, produk fisik yang tahan lama, dan teaser tracking yang lebih bernilai.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
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
                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                        Riwayat untuk Sticker Vinyl dibatasi ke 30 hari terakhir agar fokus pada scan yang paling relevan.
                      </div>
                    )}
                    {scans.map((scan) => (
                      <div key={scan.id} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 text-sm font-medium">
                            {scan.city || 'Lokasi tidak diketahui'}
                            {scan.deviceInfo && (
                              <span className="flex items-center gap-1 break-all text-xs text-gray-500">
                                <Smartphone className="h-3 w-3" />
                                {scan.deviceInfo}
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                            <Calendar className="h-3 w-3" />
                            {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </div>
                          {scan.ipAddress && scan.ipAddress !== 'unknown' && (
                            <div className="mt-1 break-all text-xs text-gray-400">
                              IP: {scan.ipAddress}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {!isFreeTag && (
              <Card>
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
                    <p className="py-4 text-center text-sm text-gray-500">
                      Belum ada attempt notifikasi WhatsApp tercatat.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {recentNotificationAttempts.map((attempt) => (
                        <div key={attempt.id} className="rounded-lg border bg-gray-50 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className={attempt.status === 'sent' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}>
                              {attempt.status === 'sent' ? 'Sent' : 'Failed'}
                            </Badge>
                            <Badge variant="outline" className={attempt.channel === 'priority' ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-white text-slate-700'}>
                              {attempt.channel === 'priority' ? 'Priority' : 'Standard'}
                            </Badge>
                            <span className="text-xs uppercase tracking-[0.16em] text-gray-500">{attempt.provider}</span>
                          </div>
                          <div className="mt-2 text-xs text-gray-500">
                            {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </div>
                          {attempt.errorMessage && (
                            <div className="mt-2 text-sm text-red-700">
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
