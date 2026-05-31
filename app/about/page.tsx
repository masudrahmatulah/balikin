import type { Metadata } from 'next';
import { buildMetadata, getSiteUrl } from '@/lib/seo';
import { MarketingShell } from '@/components/marketing-shell';

export const metadata: Metadata = buildMetadata({
  title: 'Tentang Balikin',
  description:
    'Pelajari tentang Balikin, misi smart lost & found berbasis QR code, dan alasan produk ini dibuat untuk membantu barang hilang kembali ke pemilik.',
  path: '/about',
  keywords: ['tentang balikin', 'about balikin', 'smart lost and found indonesia'],
});

function AboutJsonLd() {
  const siteUrl = getSiteUrl();

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Balikin',
          description:
            'Balikin adalah aplikasi smart lost & found yang menghubungkan produk fisik seperti gantungan kunci atau stiker QR dengan profil digital yang bisa diperbarui kapan saja.',
          url: siteUrl,
          logo: `${siteUrl}/logo-icon.png`,
          sameAs: [],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            areaServed: 'ID',
            availableLanguage: 'Indonesian',
          },
        }),
      }}
    />
  );
}

const sections = [
  {
    id: 'what-is',
    heading: 'Apa itu Balikin',
    content:
      'Balikin adalah aplikasi smart lost & found yang menghubungkan produk fisik seperti gantungan kunci atau stiker QR dengan profil digital yang bisa diperbarui kapan saja.',
  },
  {
    id: 'problem',
    heading: 'Masalah yang Dihadapi',
    content:
      'Banyak barang hilang sebenarnya ditemukan orang lain, tetapi penemu tidak tahu bagaimana cara menghubungi pemilik dengan aman. Menuliskan nama dan nomor WhatsApp langsung di barang juga menimbulkan risiko privasi.',
  },
  {
    id: 'mission',
    heading: 'Misi',
    content:
      'Misi Balikin adalah membuat proses mengembalikan barang menjadi lebih mudah, lebih aman, dan lebih cepat. Pemilik mendapatkan rasa tenang, sementara penemu mendapatkan cara yang jelas untuk berbuat baik.',
  },
  {
    id: 'how-it-works',
    heading: 'Bagaimana Balikin Bekerja',
    content:
      'Setiap tag memiliki QR code dinamis. Saat di-scan, sistem menampilkan halaman publik sesuai status barang. Jika barang hilang, pemilik dapat mengaktifkan mode hilang agar penemu segera melihat cara menghubungi pemilik.',
  },
  {
    id: 'why-different',
    heading: 'Kenapa Balikin Berbeda',
    items: [
      'Privasi lebih aman karena nomor tidak dicetak terbuka di barang.',
      'Data kontak dapat diperbarui tanpa mengganti QR code.',
      'Tersedia versi gratis dan versi produk fisik premium.',
    ],
  },
] as const;

export default function AboutPage() {
  return (
    <>
      <AboutJsonLd />
      <MarketingShell
        title="Tentang Balikin"
        description="Balikin dibuat untuk memudahkan orang baik mengembalikan barang yang ditemukan tanpa mengorbankan privasi pemilik."
      >
        {sections.map((section) => (
          <section key={section.id} aria-labelledby={`${section.id}-heading`}>
            <h2
              id={`${section.id}-heading`}
              className="scroll-mt-20 text-2xl font-semibold text-gray-900"
            >
              {section.heading}
            </h2>
            {section.items ? (
              <ul className="mt-2 space-y-1 text-gray-700 list-disc pl-6">
                {section.items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-gray-700">{section.content}</p>
            )}
          </section>
        ))}
      </MarketingShell>
    </>
  );
}