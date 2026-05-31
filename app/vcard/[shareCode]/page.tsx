import { notFound } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { User, Mail, Phone, Globe, Download } from 'lucide-react';
import { generateQRCodeSVG } from '@/lib/qrcode-generator';
import {
  generateVCardString,
  sanitizeVCardForDisplay,
  generateVCardFilename,
  isSafeUrl,
  type VCardData,
} from '@/lib/vcard';
import { getVCardByShareCode } from '@/app/actions/modules';
import { PersonJsonLd } from '@/components/json-ld';
import { NotFoundError } from '@/lib/errors';

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

export default async function VCardPage({ params }: VCardPageProps) {
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

  // Sanitize data for display
  const sanitized = sanitizeVCardForDisplay(vcardData);

  // Generate vCard string for download
  const vcardString = generateVCardString(vcardData);
  const vcardFilename = `${generateVCardFilename(vcardData.fullName)}.vcf`;

  // Generate public URL
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.masudrahmat.my.id';
  const publicUrl = `${baseUrl}/vcard/${shareCode}`;

  // Generate QR code as SVG
  const qrCodeSvg = await generateQRCodeSVG(publicUrl, { size: 200, margin: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <PersonJsonLd
        name={vcardData.fullName}
        description={vcardData.bio}
        email={vcardData.email}
        telephone={vcardData.phone}
        url={publicUrl}
        jobTitle={vcardData.title}
        worksFor="Balikin Student Kit"
      />
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <header className="text-center mb-6">
              <div
                className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center"
                aria-hidden="true"
              >
                <User className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {sanitized.fullName}
              </h1>
              {sanitized.title && (
                <p className="text-lg text-gray-600">{sanitized.title}</p>
              )}
              {sanitized.bio && (
                <p
                  className="text-sm text-gray-500 mt-3 italic max-w-md mx-auto"
                  aria-label="Bio: {sanitized.bio}"
                >
                  "{sanitized.bio}"
                </p>
              )}
            </header>

            <nav className="space-y-3 mb-6" aria-label="Contact information">
              {sanitized.email && (
                <a
                  href={`mailto:${sanitized.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="bg-blue-100 p-2 rounded-full" aria-hidden="true">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{sanitized.email}</p>
                  </div>
                </a>
              )}

              {sanitized.phone && (
                <a
                  href={`tel:${sanitized.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="bg-green-100 p-2 rounded-full" aria-hidden="true">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="text-gray-900">{sanitized.phone}</p>
                  </div>
                </a>
              )}
            </nav>

            {(sanitized.linkedinUrl || sanitized.portfolioUrl || sanitized.githubUrl) && (
              <nav
                className="mb-6"
                aria-label="Professional links"
              >
                <h2 className="text-sm font-semibold text-gray-700 mb-3">
                  Link Profesional
                </h2>
                <div className="space-y-2">
                  {sanitized.linkedinUrl && isSafeUrl(sanitized.linkedinUrl) && (
                    <a
                      href={sanitized.linkedinUrl}
                      target="_blank"
                      rel="external noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span
                        className="w-5 h-5 inline-block text-center text-2xl"
                        aria-hidden="true"
                      >
                        💼
                      </span>
                      <span className="text-gray-900">LinkedIn Profile</span>
                    </a>
                  )}

                  {sanitized.portfolioUrl && isSafeUrl(sanitized.portfolioUrl) && (
                    <a
                      href={sanitized.portfolioUrl}
                      target="_blank"
                      rel="external noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <Globe className="w-5 h-5 text-green-600" aria-hidden="true" />
                      <span className="text-gray-900">Portfolio</span>
                    </a>
                  )}

                  {sanitized.githubUrl && isSafeUrl(sanitized.githubUrl) && (
                    <a
                      href={sanitized.githubUrl}
                      target="_blank"
                      rel="external noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <span
                        className="w-5 h-5 inline-block text-center text-2xl"
                        aria-hidden="true"
                      >
                        ⚡
                      </span>
                      <span className="text-gray-900">GitHub</span>
                    </a>
                  )}
                </div>
              </nav>
            )}

            <div className="mb-6 text-center">
              <div
                className="bg-white p-4 rounded-lg border-2 inline-block"
                aria-label="QR Code untuk menyimpan kontak"
              >
                <div
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                  className="w-48 h-48"
                  aria-hidden="true"
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Scan QR code untuk menyimpan kontak
              </p>
            </div>

            <div className="space-y-2">
              <a
                href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcardString)}`}
                download={vcardFilename}
                className="block"
              >
                <Button className="w-full" size="lg" aria-label="Add to Contacts">
                  <Download className="w-5 h-5 mr-2" aria-hidden="true" />
                  Add to Contacts
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        <footer className="text-center mt-6 text-sm text-gray-500">
          <p>Powered by Balikin Student Kit</p>
        </footer>
      </div>
    </div>
  );
}