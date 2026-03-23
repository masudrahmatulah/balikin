import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { and, desc, eq, gte } from 'drizzle-orm';
import { logScan } from '@/app/actions/scan';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { ClaimCTA } from './claim-cta';
import { VerifiedBadge } from '@/components/verified-badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Gift, User, Award } from 'lucide-react';
import { buildMetadata } from '@/lib/seo';
import { getTagProductLabel, isAcrylicProduct, isFreeProduct, isStickerProduct } from '@/lib/product';

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

export const metadata: Metadata = buildMetadata({
  title: 'Tag Publik',
  description: 'Halaman publik tag Balikin.',
  path: '/p',
  noIndex: true,
});

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { slug } = await params;

  const tag = await db.query.tags.findFirst({
    where: eq(tags.slug, slug),
  });

  if (!tag) {
    notFound();
  }

  // Log scan if status is lost
  if (tag.status === 'lost') {
    // Run logging in background without blocking
    logScan(tag.id).catch(console.error);
  }

  const isLost = tag.status === 'lost';
  const isUnclaimed = !tag.ownerId;
  const isFreeTag = isFreeProduct(tag);
  const isStickerTag = isStickerProduct(tag);
  const isAcrylicTag = isAcrylicProduct(tag);
  const productLabel = getTagProductLabel(tag);
  const stickerHistoryCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Get recent scan logs for lost items
  let recentScans: typeof scanLogs.$inferSelect[] = [];
  if (isLost && !isFreeTag) {
    recentScans = await db.query.scanLogs.findMany({
      where: isStickerTag
        ? and(eq(scanLogs.tagId, tag.id), gte(scanLogs.scannedAt, stickerHistoryCutoff))
        : eq(scanLogs.tagId, tag.id),
      orderBy: [desc(scanLogs.scannedAt)],
      limit: 5,
    });
  }

  return (
    <div className={`min-h-screen ${isLost ? 'bg-red-50' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
      {/* Hero Finder Badge - Pahlawan Penemu */}
      <div className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 px-4 py-2 text-white">
        <div className="container mx-auto flex max-w-2xl items-center justify-center gap-2 text-center">
          <Award className="h-4 w-4" />
          <span className="font-semibold text-sm">
            Terima kasih sudah menjadi <span className="font-bold">Pahlawan Penemu</span>!
          </span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          {/* Hero Finder Badge - Appreciation */}
          <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border-2 border-green-300 bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 text-center text-sm font-medium text-green-800">
            <div>
              <Award className="h-4 w-4 text-green-600" />
            </div>
            <span className="break-words">Anda adalah orang baik yang menghargai milik orang lain!</span>
          </div>
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            isLost ? 'bg-red-100' : 'bg-blue-100'
          } mb-4`}>
            {isLost ? (
              <AlertTriangle className="w-10 h-10 text-red-600" />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <h1 className={`break-words text-3xl font-bold ${isLost ? 'text-red-900' : 'text-gray-900'}`}>
            {tag.name}
          </h1>
          <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
            {isLost && (
              <Badge variant="destructive" className="text-sm">
                HILANG / LOST
              </Badge>
            )}
            {isFreeTag ? (
              <Badge variant="outline" className="border-slate-300 bg-white text-slate-700">
                User Belum Terverifikasi
              </Badge>
            ) : (
              <VerifiedBadge
                tier={tag.tier as 'free' | 'premium' | null}
                productType={tag.productType as 'free' | 'sticker' | 'acrylic' | null}
                isVerified={tag.isVerified}
                size="md"
              />
            )}
          </div>
        </div>

        {/* Main Card */}
        <Card className={isLost ? 'border-red-200 shadow-red-100' : ''}>
          <CardHeader>
            <CardTitle className={isLost ? 'text-red-900' : ''}>
              {isLost ? 'BARANG INI HILANG' : 'Halo!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLost ? (
              <>
                {/* Hero Badge for Lost Items */}
                <div className="mb-4 rounded-xl border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-yellow-100 p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Award className="h-6 w-6 text-amber-600" />
                    <span className="font-bold text-amber-800 text-lg">
                      Anda adalah Pahlawan Penemu!
                    </span>
                  </div>
                  <p className="text-sm text-amber-700">
                    Terima kasih telah melakukan scan. Dengan menghubungi pemilik, Anda telah melakukan kebaikan yang sangat berarti.
                  </p>
                </div>

                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Pemilik sedang mencari barang ini!</AlertTitle>
                  <AlertDescription>
                    Jika Anda menemukan barang ini, mohon hubungi pemilik segera.
                    {tag.rewardNote && (
                      <p className="mt-2 font-medium flex items-center gap-1">
                        <Gift className="h-4 w-4" />
                        Imbalan: {tag.rewardNote}
                      </p>
                    )}
                  </AlertDescription>
                </Alert>

                {tag.customMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">{tag.customMessage}</p>
                  </div>
                )}

                {isFreeTag && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">
                      Ini adalah digital tag free milik pengguna Balikin. Jika Anda menemukan barang ini, silakan hubungi pemilik lewat tombol WhatsApp di bawah.
                    </p>
                  </div>
                )}

                {isStickerTag && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">
                      Pemilik menggunakan {productLabel} Balikin yang tahan air dan anti-UV agar barang lebih mudah kembali dengan aman.
                    </p>
                  </div>
                )}

                {isAcrylicTag && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-900">
                      Pemilik memakai {productLabel} dengan proteksi premium tingkat tinggi agar alert hilang bisa diproses lebih cepat dan barang lebih mudah kembali dengan aman.
                    </p>
                  </div>
                )}

                {tag.contactWhatsapp && (
                  <div className="flex justify-center">
                    <WhatsAppButton
                      phone={tag.contactWhatsapp}
                      message={
                        tag.customMessage
                          ? `Halo, saya menemukan barang "${tag.name}" yang Anda laporkan hilang. ${tag.customMessage}`
                          : `Halo, saya menemukan barang "${tag.name}" yang Anda laporkan hilang.`
                      }
                      label="Hubungi Pemilik via WhatsApp"
                      variant="destructive"
                      size="lg"
                      className="w-full px-6 py-6 text-base sm:w-auto sm:px-8"
                    />
                  </div>
                )}
              </>
            ) : (
              <>
                <p className="text-gray-700">
                  Ini adalah tag milik <strong>{tag.name}</strong>. Jika Anda menemukan
                  barang ini, terima kasih sudah mengunjungi halaman ini.
                </p>

                {tag.customMessage && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">{tag.customMessage}</p>
                  </div>
                )}

                {isFreeTag && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">
                      Profil ini dibuat dengan Balikin Free. Pemilik menggunakan digital tag DIY untuk memudahkan pengembalian barang secara aman.
                    </p>
                  </div>
                )}

                {isStickerTag && (
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-sm text-slate-700">
                      Ini adalah {productLabel} Balikin. Stiker vinyl ini dibuat untuk pemakaian harian di helm, koper, laptop, dan barang yang sering dibawa bepergian.
                    </p>
                  </div>
                )}

                {isAcrylicTag && (
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="text-sm text-amber-900">
                      Ini adalah {productLabel} Balikin dengan perlindungan premium tingkat tinggi, badge emas, dan prioritas alert saat pemilik mengaktifkan mode hilang.
                    </p>
                  </div>
                )}

                {tag.contactWhatsapp && (
                  <div className="text-center pt-4">
                    <WhatsAppButton
                      phone={tag.contactWhatsapp}
                      message={`Halo, saya ingin bertanya tentang tag "${tag.name}".`}
                      variant="outline"
                    />
                  </div>
                )}
              </>
            )}

            {/* Recent Scans for Lost Items */}
            {isLost && !isFreeTag && recentScans.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {isStickerTag ? 'Riwayat Scan 30 Hari Terakhir' : 'Riwayat Scan Terakhir'}
                </h3>
                <div className="space-y-2">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="rounded bg-gray-50 p-2 text-xs text-gray-600">
                      <div className="flex flex-col gap-1 sm:flex-row sm:justify-between">
                        <span>{scan.city || 'Lokasi tidak diketahui'}</span>
                        <span>
                          {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          }) : '-'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Powered by <span className="font-medium">Balikin</span> - Smart Lost & Found</p>
        </div>
      </div>

      {/* Claim CTA for unclaimed tags */}
      {isUnclaimed && <ClaimCTA tagId={tag.id} tagName={tag.name} />}
    </div>
  );
}
