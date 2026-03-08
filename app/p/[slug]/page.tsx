import { notFound } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { logScan } from '@/app/actions/scan';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { ClaimCTA } from './claim-cta';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { MapPin, AlertTriangle, Gift, User } from 'lucide-react';

interface ProfilePageProps {
  params: Promise<{ slug: string }>;
}

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

  // Get recent scan logs for lost items
  let recentScans: typeof scanLogs.$inferSelect[] = [];
  if (isLost) {
    recentScans = await db.query.scanLogs.findMany({
      where: eq(scanLogs.tagId, tag.id),
      orderBy: [desc(scanLogs.scannedAt)],
      limit: 5,
    });
  }

  return (
    <div className={`min-h-screen ${isLost ? 'bg-red-50' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${
            isLost ? 'bg-red-100' : 'bg-blue-100'
          } mb-4`}>
            {isLost ? (
              <AlertTriangle className="w-10 h-10 text-red-600" />
            ) : (
              <User className="w-10 h-10 text-blue-600" />
            )}
          </div>
          <h1 className={`text-3xl font-bold ${isLost ? 'text-red-900' : 'text-gray-900'}`}>
            {tag.name}
          </h1>
          {isLost && (
            <Badge variant="destructive" className="mt-2 text-sm">
              HILANG / LOST
            </Badge>
          )}
        </div>

        {/* Main Card */}
        <Card className={isLost ? 'border-red-200 shadow-red-100' : ''}>
          <CardHeader>
            <CardTitle className={isLost ? 'text-red-900' : ''}>
              {isLost ? '⚠️ BARANG INI HILANG' : 'Halo!'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLost ? (
              <>
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
                      className="text-base px-8 py-6"
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
            {isLost && recentScans.length > 0 && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Riwayat Scan Terakhir
                </h3>
                <div className="space-y-2">
                  {recentScans.map((scan) => (
                    <div key={scan.id} className="text-xs text-gray-600 bg-gray-50 rounded p-2">
                      <div className="flex justify-between">
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
