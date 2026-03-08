import { notFound, redirect } from 'next/navigation';
import { db } from '@/db';
import { tags, scanLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getSession } from '@/lib/session';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, ArrowLeft, MapPin, Calendar, Download, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

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

  const scans = await db.query.scanLogs.findMany({
    where: eq(scanLogs.tagId, tag.id),
    orderBy: (scanLogs, { desc }) => [desc(scanLogs.scannedAt)],
    limit: 10,
  });

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
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Dashboard
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="grid md:grid-cols-2 gap-6">
          {/* QR Code Card */}
          <Card>
            <CardHeader>
              <CardTitle>QR Code untuk {tag.name}</CardTitle>
              <CardDescription>
              Scan untuk melihat profil tag ini
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white p-4 rounded-lg border flex justify-center">
                <img src={qrCode} alt={`QR Code untuk ${tag.name}`} className="w-full max-w-[250px]" />
              </div>
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <a href={qrCode} download={`balikin-${tag.slug}.png`}>
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </a>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <a href={`/p/${slug}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Buka Halaman Publik
                  </a>
                </Button>
              </div>
              <div className="text-xs text-gray-500 text-center">
                URL: <span className="font-mono">{qrUrl}</span>
              </div>
            </CardContent>
          </Card>

          {/* Tag Info & Scans */}
          <div className="space-y-6">
            {/* Tag Info */}
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{tag.name}</CardTitle>
                    <CardDescription>/p/{tag.slug}</CardDescription>
                  </div>
                  <Badge variant={tag.status === 'lost' ? 'destructive' : 'success'}>
                    {tag.status === 'lost' ? 'Hilang' : 'Normal'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <div className="text-sm font-medium text-gray-700">Nomor WhatsApp</div>
                  <div className="text-gray-900">{tag.contactWhatsapp}</div>
                </div>
                {tag.customMessage && (
                  <div>
                    <div className="text-sm font-medium text-gray-700">Pesan Personal</div>
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
              </CardContent>
            </Card>

            {/* Scan History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Riwayat Scan
                </CardTitle>
              </CardHeader>
              <CardContent>
                {scans.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Belum ada scan tercatat
                  </p>
                ) : (
                  <div className="space-y-3">
                    {scans.map((scan) => (
                      <div key={scan.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {scan.city || 'Lokasi tidak diketahui'}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {scan.scannedAt ? new Date(scan.scannedAt).toLocaleString('id-ID', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            }) : '-'}
                          </div>
                          {scan.ipAddress && scan.ipAddress !== 'unknown' && (
                            <div className="text-xs text-gray-400 mt-1">
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
          </div>
        </div>
      </div>
    </div>
  );
}
