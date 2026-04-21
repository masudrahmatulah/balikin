import { notFound } from 'next/navigation';
import { getVCardByShareCode } from '@/app/actions/modules';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Mail, Phone, Globe, Download, Calendar } from 'lucide-react';
import { generateQRCodeDataURL } from '@/lib/qrcode-generator';

interface VCardPageProps {
  params: Promise<{ shareCode: string }>;
}

export async function generateMetadata({ params }: VCardPageProps) {
  const { shareCode } = await params;

  try {
    const data = await getVCardByShareCode(shareCode);
    const { vcardData } = data;

    return {
      title: `${vcardData.fullName || 'vCard'} - Internship Profile`,
      description: vcardData.bio || `Hubungi ${vcardData.fullName} melalui vCard ini`,
    };
  } catch {
    return {
      title: 'vCard Not Found',
    };
  }
}

export default async function VCardPage({ params }: VCardPageProps) {
  const { shareCode } = await params;

  let vcardData: any;
  try {
    const data = await getVCardByShareCode(shareCode);
    vcardData = data.vcardData;
  } catch (error) {
    notFound();
  }

  // Generate vCard string for download
  const generateVCardString = () => {
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
    return lines.join('\n');
  };

  const vcardString = generateVCardString();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://balikin.masudrahmat.my.id';
  const publicUrl = `${baseUrl}/vcard/${shareCode}`;
  const qrCodeUrl = await generateQRCodeDataURL(publicUrl, { size: 300, margin: 2 });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Main Card */}
        <Card className="shadow-xl">
          <CardContent className="p-8">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                <User className="w-10 h-10" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {vcardData.fullName}
              </h1>
              {vcardData.title && (
                <p className="text-lg text-gray-600">{vcardData.title}</p>
              )}
              {vcardData.bio && (
                <p className="text-sm text-gray-500 mt-3 italic max-w-md mx-auto">
                  "{vcardData.bio}"
                </p>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-3 mb-6">
              {vcardData.email && (
                <a
                  href={`mailto:${vcardData.email}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{vcardData.email}</p>
                  </div>
                </a>
              )}

              {vcardData.phone && (
                <a
                  href={`tel:${vcardData.phone}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="bg-green-100 p-2 rounded-full">
                    <Phone className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Telepon</p>
                    <p className="text-gray-900">{vcardData.phone}</p>
                  </div>
                </a>
              )}
            </div>

            {/* Professional Links */}
            {(vcardData.linkedinUrl || vcardData.portfolioUrl || vcardData.githubUrl) && (
              <div className="mb-6">
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Link Profesional</h2>
                <div className="space-y-2">
                  {vcardData.linkedinUrl && (
                    <a
                      href={vcardData.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="w-5 h-5 inline-block text-center text-2xl">💼</span>
                      <span className="text-gray-900">LinkedIn Profile</span>
                    </a>
                  )}

                  {vcardData.portfolioUrl && (
                    <a
                      href={vcardData.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <Globe className="w-5 h-5 text-green-600" />
                      <span className="text-gray-900">Portfolio</span>
                    </a>
                  )}

                  {vcardData.githubUrl && (
                    <a
                      href={vcardData.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <span className="w-5 h-5 inline-block text-center text-2xl">⚡</span>
                      <span className="text-gray-900">GitHub</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* QR Code */}
            <div className="mb-6 text-center">
              <div className="bg-white p-4 rounded-lg border-2 inline-block">
                <img src={qrCodeUrl} alt="Scan to save contact" className="w-48 h-48" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Scan QR code untuk menyimpan kontak
              </p>
            </div>

            {/* Download Button */}
            <div className="space-y-2">
              <a
                href={`data:text/vcard;charset=utf-8,${encodeURIComponent(vcardString)}`}
                download={`${vcardData.fullName.replace(/\s+/g, '_').toLowerCase()}.vcf`}
                className="block"
              >
                <Button className="w-full" size="lg">
                  <Download className="w-5 h-5 mr-2" />
                  Add to Contacts
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Powered by Balikin Student Kit</p>
        </div>
      </div>
    </div>
  );
}
