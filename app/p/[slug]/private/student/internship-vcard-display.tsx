'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Share2, Mail, Phone, Globe, User, QrCode } from 'lucide-react';
import { generateQRCodeDataURL } from '@/lib/qrcode-generator';
import type { StudentKitData } from '@/db/schema';

interface InternshipVCardDisplayProps {
  data: StudentKitData;
}

export function InternshipVCardDisplay({ data }: InternshipVCardDisplayProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const vcardData = data.vcardData ? JSON.parse(data.vcardData) : null;

  useEffect(() => {
    if (data.vcardShareCode) {
      // Generate public vCard URL
      const baseUrl = window.location.origin;
      const publicUrl = `${baseUrl}/vcard/${data.vcardShareCode}`;

      // Generate QR code
      generateQRCodeDataURL(publicUrl, {
        size: 300,
        margin: 2,
      }).then(setQrCodeUrl);
    }
  }, [data.vcardShareCode]);

  if (!vcardData) {
    return null;
  }

  const handleDownloadVCard = async () => {
    // Generate vCard string
    const lines: string[] = [];
    lines.push('BEGIN:VCARD');
    lines.push('VERSION:3.0');
    lines.push(`FN:${vcardData.fullName || ''}`);
    if (vcardData.title) lines.push(`TITLE:${vcardData.title}`);
    if (vcardData.email) lines.push(`EMAIL;TYPE=WORK:${vcardData.email}`);
    if (vcardData.phone) lines.push(`TEL;TYPE=CELL:${vcardData.phone}`);
    if (vcardData.linkedinUrl) lines.push(`URL;TYPE=LinkedIn:${vcardData.linkedinUrl}`);
    if (vcardData.portfolioUrl) lines.push(`URL;TYPE=Portfolio:${vcardData.portfolioUrl}`);
    if (vcardData.githubUrl) lines.push(`URL;TYPE=GitHub:${vcardData.githubUrl}`);
    if (vcardData.bio) {
      const truncatedBio = vcardData.bio.length > 200 ? vcardData.bio.substring(0, 197) + '...' : vcardData.bio;
      lines.push(`NOTE:${truncatedBio.replace(/\n/g, '\\n')}`);
    }
    lines.push('END:VCARD');

    const vcardString = lines.join('\n');
    const blob = new Blob([vcardString], { type: 'text/vcard;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${vcardData.fullName.replace(/\s+/g, '_').toLowerCase()}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5 text-purple-600" />
          Internship vCard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Profile Header */}
        <div className="text-center pb-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">{vcardData.fullName}</h3>
          {vcardData.title && (
            <p className="text-sm text-gray-600 mt-1">{vcardData.title}</p>
          )}
          {vcardData.bio && (
            <p className="text-sm text-gray-500 mt-2 italic line-clamp-2">
              "{vcardData.bio}"
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="space-y-2">
          {vcardData.email && (
            <div className="flex items-center gap-2 text-sm">
              <Mail className="w-4 h-4 text-gray-400" />
              <a
                href={`mailto:${vcardData.email}`}
                className="text-blue-600 hover:underline"
              >
                {vcardData.email}
              </a>
            </div>
          )}

          {vcardData.phone && (
            <div className="flex items-center gap-2 text-sm">
              <Phone className="w-4 h-4 text-gray-400" />
              <a
                href={`tel:${vcardData.phone}`}
                className="text-blue-600 hover:underline"
              >
                {vcardData.phone}
              </a>
            </div>
          )}
        </div>

        {/* Professional Links */}
        {(vcardData.linkedinUrl || vcardData.portfolioUrl || vcardData.githubUrl) && (
          <div className="space-y-2">
            {vcardData.linkedinUrl && (
              <a
                href={vcardData.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600"
              >
                <span className="w-4 h-4 inline-block text-center">💼</span>
                <span>LinkedIn</span>
              </a>
            )}

            {vcardData.portfolioUrl && (
              <a
                href={vcardData.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-green-600"
              >
                <Globe className="w-4 h-4" />
                <span>Portfolio</span>
              </a>
            )}

            {vcardData.githubUrl && (
              <a
                href={vcardData.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <span className="w-4 h-4 inline-block text-center">⚡</span>
                <span>GitHub</span>
              </a>
            )}
          </div>
        )}

        {/* QR Code Section */}
        {qrCodeUrl && (
          <div className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowQr(!showQr)}
              className="w-full mb-3"
            >
              <QRCode className="w-4 h-4 mr-2" />
              {showQr ? 'Sembunyikan' : 'Tampilkan'} QR Code
            </Button>

            {showQr && (
              <div className="bg-white p-4 rounded-lg border text-center">
                <img
                  src={qrCodeUrl}
                  alt="vCard QR Code"
                  className="mx-auto mb-2"
                />
                <p className="text-xs text-gray-500">
                  Scan untuk menambahkan kontak
                </p>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={handleDownloadVCard}
            className="flex-1"
          >
            <Download className="w-4 h-4 mr-2" />
            Download .vcf
          </Button>

          {data.vcardShareCode && (
            <Button
              variant="outline"
              onClick={() => {
                const baseUrl = window.location.origin;
                const shareUrl = `${baseUrl}/vcard/${data.vcardShareCode}`;
                navigator.clipboard.writeText(shareUrl);
                alert('Link berhasil disalin!');
              }}
              className="flex-1"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Link
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
