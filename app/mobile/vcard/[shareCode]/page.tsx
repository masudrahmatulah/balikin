import { notFound } from 'next/navigation';
import { User, Mail, Phone, Globe, Download, ArrowLeft } from 'lucide-react';
import { generateQRCodeSVG } from '@/lib/qrcode-generator';
import {
  generateVCardString,
  sanitizeVCardForDisplay,
  generateVCardFilename,
  isSafeUrl,
  type VCardData,
} from '@/lib/vcard';
import { getVCardByShareCode } from '@/app/actions/modules';
import { NotFoundError } from '@/lib/errors';
import Link from 'next/link';

interface VCardPageProps {
  params: Promise<{ shareCode: string }>;
}

async function getVCardData(shareCode: string) {
  const data = await getVCardByShareCode(shareCode);
  return data.vcardData;
}

export async function generateMetadata({ params }: VCardPageProps) {
  const { shareCode } = await params;

  try {
    const data = await getVCardData(shareCode);
    const { fullName, title, bio } = data;

    return {
      title: `${fullName || 'vCard'} - Internship Profile`,
      description: bio || `Hubungi ${fullName} melalui vCard ini`,
    };
  } catch (error) {
    return {
      title: 'vCard Not Found - Balikin',
    };
  }
}

export default async function MobileVCardPage({ params }: VCardPageProps) {
  const { shareCode } = await params;

  let vcardData: VCardData;
  try {
    const data = await getVCardData(shareCode);
    vcardData = data as VCardData;
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    notFound();
  }

  const sanitized = sanitizeVCardForDisplay(vcardData);
  const vcardString = generateVCardString(vcardData);
  const vcardFilename = `${generateVCardFilename(vcardData.fullName)}.vcf`;

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.masudrahmat.my.id';
  const publicUrl = `${baseUrl}/mobile/vcard/${shareCode}`;

  const qrCodeSvg = await generateQRCodeSVG(publicUrl, { size: 200, margin: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-b from-mobile-background to-mobile-background-to">
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-white/20">
        <div className="px-4 py-4">
          <Link href="/mobile">
            <div className="flex items-center gap-2 text-mobile-primary">
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Kembali</span>
            </div>
          </Link>
        </div>
      </header>

      <main className="px-4 py-6 max-w-md mx-auto space-y-4">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-mobile-primary-light to-mobile-primary text-white rounded-full mx-auto mb-4 flex items-center justify-center">
            <User className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            {sanitized.fullName}
          </h1>

          {sanitized.title && (
            <p className="text-base text-gray-600 mb-2">{sanitized.title}</p>
          )}

          {sanitized.bio && (
            <p className="text-sm text-gray-500 italic max-w-md mx-auto">
              "{sanitized.bio}"
            </p>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 space-y-3">
          {sanitized.email && (
            <a
              href={`mailto:${sanitized.email}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-10 h-10 bg-mobile-info-lighter text-mobile-info rounded-full flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium text-gray-900">{sanitized.email}</p>
              </div>
            </a>
          )}

          {sanitized.phone && (
            <a
              href={`tel:${sanitized.phone}`}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
            >
              <div className="w-10 h-10 bg-mobile-success-lighter text-mobile-success rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500">Telepon</p>
                <p className="text-sm font-medium text-gray-900">{sanitized.phone}</p>
              </div>
            </a>
          )}
        </div>

        {/* Professional Links */}
        {(sanitized.linkedinUrl || sanitized.portfolioUrl || sanitized.githubUrl) && (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Link Profesional</h2>

            <div className="space-y-2">
              {sanitized.linkedinUrl && isSafeUrl(sanitized.linkedinUrl) && (
                <a
                  href={sanitized.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl"
                >
                  <span className="w-8 h-8 flex items-center justify-center text-xl">💼</span>
                  <span className="text-sm font-medium text-gray-900">LinkedIn</span>
                </a>
              )}

              {sanitized.portfolioUrl && isSafeUrl(sanitized.portfolioUrl) && (
                <a
                  href={sanitized.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-green-50 rounded-xl"
                >
                  <Globe className="w-5 h-5 text-mobile-success" />
                  <span className="text-sm font-medium text-gray-900">Portfolio</span>
                </a>
              )}

              {sanitized.githubUrl && isSafeUrl(sanitized.githubUrl) && (
                <a
                  href={sanitized.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  <span className="w-8 h-8 flex items-center justify-center text-xl">⚡</span>
                  <span className="text-sm font-medium text-gray-900">GitHub</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* QR Code */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/20 text-center">
          <div className="bg-white p-4 rounded-xl border-2 inline-block">
            <div
              dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
              className="w-40 h-40"
            />
          </div>
          <p className="text-sm text-gray-500 mt-3">
            Scan QR code untuk menyimpan kontak
          </p>
        </div>

        {/* Download Button */}
        <a
          href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcardString)}`}
          download={vcardFilename}
          className="block"
        >
          <div className="bg-mobile-primary text-white py-4 rounded-2xl text-center font-semibold shadow-lg shadow-mobile-primary/30 btn-press flex items-center justify-center gap-2">
            <Download className="w-5 h-5" />
            Add to Contacts
          </div>
        </a>

        <footer className="text-center py-4">
          <p className="text-xs text-gray-500">Powered by Balikin Student Kit</p>
        </footer>

        <div className="h-8" />
      </main>
    </div>
  );
}
