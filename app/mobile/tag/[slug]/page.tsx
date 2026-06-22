import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs, notificationLogs, userModuleSelections } from '@/db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { ArrowLeft, QrCode, MapPin, Calendar, Smartphone, BellRing, ExternalLink, FileText, GraduationCap, Crown, Shield } from 'lucide-react';
import { TagEditPanel } from '@/components/tag-edit-panel';
import Link from 'next/link';
import QRCode from 'qrcode';
import { getTagProductLabel, isAcrylicProduct, isFreeProduct, isStickerProduct } from '@/lib/product';

interface TagDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function MobileTagDetailPage({ params }: TagDetailPageProps) {
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

  const [scans, recentNotificationAttempts, studentKitModule] = await Promise.all([
    db.query.scanLogs.findMany({
      where: isStickerTag
        ? and(eq(scanLogs.tagId, tag.id), gte(scanLogs.scannedAt, stickerHistoryCutoff))
        : eq(scanLogs.tagId, tag.id),
      orderBy: [desc(scanLogs.scannedAt)],
      limit: 10,
    }),
    !isFreeTag
      ? db.query.notificationLogs.findMany({
          where: eq(notificationLogs.tagId, tag.id),
          orderBy: [desc(notificationLogs.createdAt)],
          limit: 5,
        })
      : Promise.resolve([]),
    db.query.userModuleSelections.findFirst({
      where: and(
        eq(userModuleSelections.userId, session.user.id),
        eq(userModuleSelections.moduleType, 'student'),
        eq(userModuleSelections.isActive, true)
      ),
    }),
  ]);

  const hasStudentKit = !!studentKitModule;

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
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile/profile/tags">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* QR Code Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="text-center mb-4">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              {isFreeTag ? 'Digital Tag' : productLabel}
            </h2>
            <p className="text-sm text-gray-500">{tag.name}</p>
          </div>

          <div className="bg-white rounded-xl p-4 mb-4">
            <img src={qrCode} alt={`QR Code untuk ${tag.name}`} className="w-full max-w-[200px] mx-auto" />
          </div>

          <div className="space-y-2">
            {tag.hasTabTwoEnabled && hasStudentKit && (
              <Link href={`/p/${slug}/private/student`} className="block">
                <div className="bg-purple-600 text-white py-3 rounded-xl text-center font-semibold flex items-center justify-center gap-2 btn-press">
                  <GraduationCap className="h-5 w-5" />
                  Buka Student Kit
                </div>
              </Link>
            )}
            <Link href={`/dashboard/tag/${slug}/qr`} className="block">
              <div className="bg-gray-100 text-gray-900 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                <FileText className="h-5 w-5" />
                Download PDF
              </div>
            </Link>
            <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer" className="block">
              <div className="bg-gray-100 text-gray-900 py-3 rounded-xl text-center font-medium flex items-center justify-center gap-2">
                <ExternalLink className="h-5 w-5" />
                Buka Halaman Publik
              </div>
            </a>
          </div>

          {isFreeTag && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
              <p>Digital tag free cocok untuk lockscreen atau cetak mandiri. Upgrade ke Sticker/Acrylic untuk hasil lebih tahan lama.</p>
            </div>
          )}
        </div>

        {/* Tag Info */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">{tag.name}</h3>
              <p className="text-xs text-gray-500 mt-1">/p/{tag.slug}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              tag.status === 'lost'
                ? 'bg-mobile-danger-lighter text-mobile-danger'
                : 'bg-mobile-success-lighter text-mobile-success'
            }`}>
              {tag.status === 'lost' ? 'HILANG' : 'NORMAL'}
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">WhatsApp</p>
              <p className="text-sm font-semibold text-gray-900">{tag.contactWhatsapp}</p>
            </div>

            {tag.customMessage && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Pesan Sapaan</p>
                <div className="bg-blue-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-900">{tag.customMessage}</p>
                </div>
              </div>
            )}

            {tag.rewardNote && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Imbalan</p>
                <div className="bg-green-50 p-3 rounded-xl">
                  <p className="text-sm text-gray-900">{tag.rewardNote}</p>
                </div>
              </div>
            )}

            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Dibuat</p>
              <p className="text-sm text-gray-600">
                {tag.createdAt ? new Date(tag.createdAt).toLocaleString('id-ID', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                }) : '-'}
              </p>
            </div>
          </div>

          <div className="mt-4">
            <TagEditPanel
              tagId={tag.id}
              tagName={tag.name}
              contactWhatsapp={tag.contactWhatsapp ?? ''}
              customMessage={tag.customMessage ?? null}
              rewardNote={tag.rewardNote ?? null}
              variant="mobile"
            />
          </div>
        </div>

        {/* Scan History */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-mobile-primary" />
            Riwayat Scan
          </h3>

          {scans.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">Belum ada scan tercatat</p>
          ) : isFreeTag ? (
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-900">
                  Digital tag Anda telah di-scan {scans.length} kali
                </p>
                <p className="mt-1 text-xs text-gray-600">
                  Upgrade ke Premium untuk tracking lokasi akurat dan notifikasi WhatsApp.
                </p>
              </div>
              {scans[0]?.scannedAt && (
                <p className="text-xs text-gray-500 text-center">
                  Scan terakhir: {new Date(scans[0].scannedAt).toLocaleString('id-ID')}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {scans.map((scan) => (
                <div key={scan.id} className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl">
                  <div className="w-10 h-10 bg-mobile-primary-lighter rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-4 w-4 text-mobile-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {scan.city || 'Lokasi tidak diketahui'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="h-3 w-3" />
                      {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : '-'}
                    </div>
                    {scan.deviceInfo && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                        <Smartphone className="h-3 w-3" />
                        {scan.deviceInfo}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Logs (Premium only) */}
        {!isFreeTag && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BellRing className="h-5 w-5 text-mobile-primary" />
              Log Notifikasi
            </h3>

            {recentNotificationAttempts.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Belum ada notifikasi terkirim</p>
            ) : (
              <div className="space-y-3">
                {recentNotificationAttempts.map((attempt) => (
                  <div key={attempt.id} className="bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        attempt.status === 'sent'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {attempt.status === 'sent' ? 'Terkirim' : 'Gagal'}
                      </span>
                      {attempt.channel === 'priority' && (
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700">
                          Priority
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {attempt.createdAt ? new Date(attempt.createdAt).toLocaleString('id-ID') : '-'}
                    </p>
                    {attempt.errorMessage && (
                      <p className="text-xs text-red-600 mt-1">{attempt.errorMessage}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tier Info Card */}
        {isAcrylicTag && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900">Acrylic Premium</p>
                <p className="text-xs text-amber-700 mt-1">
                  Priority WhatsApp alert dengan fallback otomatis ke jalur standar
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="h-8" />
      </main>
    </div>
  );
}
