"use client";

import { ShieldCheck, Database, Lock, Scale, User, Building, Contact, Award } from "lucide-react";
import Image from "next/image";
import {
  securityCertifications,
  securityDataProviders,
  encryptionFeatures,
  pdpComplianceItems,
  userRights,
  infrastructureProviders,
} from "@/lib/site-content";

export function SecurityContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="mb-12 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-8 text-center">
        <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-blue-600" aria-hidden="true" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">
          Keamanan Data Anda Adalah Prioritas Kami
        </h2>
        <p className="text-gray-700">
          Balikin berkomitmen untuk melindungi privasi dan keamanan data Anda dengan standar
          keamanan kelas dunia dan kepatuhan penuh terhadap regulasi Indonesia.
        </p>
      </section>

      {/* Certifications Showcase */}
      <section className="mb-12" aria-labelledby="certifications-heading">
        <h2 id="certifications-heading" className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Award className="h-6 w-6 text-blue-600" aria-hidden="true" />
          Sertifikasi & Kepatuhan
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          {securityCertifications.map((cert, index) => (
            <article
              key={cert.id}
              className="security-card rounded-lg border border-blue-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4 flex flex-col items-center gap-3 text-center">
                <div className="security-logo-container relative h-20 w-20 rounded-xl border-2 border-blue-100 bg-white p-3 shadow-lg">
                  {cert.icon ? (
                    <Lock className="h-10 w-10 text-blue-600 mx-auto" aria-hidden="true" />
                  ) : (
                    <Image
                      src={cert.image}
                      alt={cert.title}
                      width={80}
                      height={80}
                      className="h-full w-full object-contain"
                      loading="lazy"
                    />
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{cert.title}</h3>
              </div>
              <p className="text-sm text-gray-700 text-center">{cert.description}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Data Storage */}
      <section className="mb-12" aria-labelledby="data-storage-heading">
        <h2 id="data-storage-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Database className="h-6 w-6 text-blue-600" aria-hidden="true" />
          Penyimpanan Data
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Data Anda disimpan di pusat data kelas dunia yang diaudit secara rutin untuk
            keamanan maksimal. Kami menggunakan infrastruktur cloud terpercaya dengan
            lokasi server di Singapore dan Indonesia untuk performa optimal dan kepatuhan
            regulasi setempat.
          </p>
          <div className="mb-4">
            <h3 className="mb-2 font-semibold text-gray-900">Provider Penyimpanan:</h3>
            <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
              {securityDataProviders.map((provider) => (
                <li key={provider.name}>
                  <strong>{provider.name}:</strong> {provider.certifications}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            <a
              href="https://supabase.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
            >
              Pelajari keamanan Supabase →
            </a>
          </p>
        </div>
      </section>

      {/* Encryption */}
      <section className="mb-12" aria-labelledby="encryption-heading">
        <h2 id="encryption-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Lock className="h-6 w-6 text-blue-600" aria-hidden="true" />
          Enkripsi Data
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Pesan dan data Anda dilindungi dengan enkripsi standar perbankan. Kami menerapkan
            enkripsi berlapis untuk memastikan data Anda tetap aman:
          </p>
          <ul className="mb-4 list-inside list-disc space-y-2 text-sm text-gray-700">
            {encryptionFeatures.map((feature) => (
              <li key={feature.label}>
                <strong>{feature.label}:</strong> {feature.description}
              </li>
            ))}
          </ul>
          <details className="rounded-lg bg-gray-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
              Teknis Detail (Opsional)
            </summary>
            <div className="mt-3 text-xs text-gray-600" aria-live="polite">
              <p className="mb-2">
                <strong>Protokol:</strong> TLS 1.3 dengan cipher suites modern (AES-256-GCM,
                ChaCha20-Poly1305)
              </p>
              <p className="mb-2">
                <strong>Key Management:</strong> Hardware Security Modules (HSM) untuk key
                management
              </p>
              <p>
                <strong>Compliance:</strong> Memenuhi standar NIST, FIPS 140-2 Level 3, dan
                PCI DSS
              </p>
            </div>
          </details>
        </div>
      </section>

      {/* UU PDP Compliance */}
      <section className="mb-12" aria-labelledby="pdp-compliance-heading">
        <h2 id="pdp-compliance-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Scale className="h-6 w-6 text-blue-600" aria-hidden="true" />
          Kepatuhan UU PDP No. 27 Tahun 2022
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Balikin berkomitmen penuh untuk mematuhi Undang-Undang Perlindungan Data Pribadi
            No. 27 Tahun 2022. Berikut adalah checklist kepatuhan kami:
          </p>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            {pdpComplianceItems.map((item) => (
              <div key={item.title} className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
                <span className="text-green-600" aria-label="Compliant">✅</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600">
            Lihat kebijakan privasi lengkap kami di{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </section>

      {/* User Rights */}
      <section className="mb-12" aria-labelledby="user-rights-heading">
        <h2 id="user-rights-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <User className="h-6 w-6 text-blue-600" aria-hidden="true" />
          Hak Anda Sebagai Pengguna
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Sebagai pengguna, Anda memiliki hak penuh atas data pribadi Anda sesuai dengan UU
            PDP:
          </p>
          <ul className="mb-6 space-y-3 text-sm text-gray-700">
            {userRights.map((right) => (
              <li key={right.id} className="flex items-start gap-3">
                <span
                  className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold"
                  aria-label={`Step ${right.id}`}
                >
                  {right.id}
                </span>
                <div>
                  <p className="font-semibold text-gray-900">{right.title}</p>
                  <p className="text-gray-600">{right.description}</p>
                </div>
              </li>
            ))}
          </ul>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4" role="alert">
            <p className="text-sm font-medium text-gray-900 mb-2">
              🗑️ Ingin Menghapus Akun & Data?
            </p>
            <p className="text-xs text-gray-700 mb-3">
              Pergi ke Dashboard Pengguna → Pengaturan Akun → Hapus Akun. Tindakan ini tidak
              dapat dibatalkan.
            </p>
          </div>
        </div>
      </section>

      {/* Infrastructure Providers */}
      <section className="mb-12" aria-labelledby="infrastructure-heading">
        <h2 id="infrastructure-heading" className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Building className="h-6 w-6 text-blue-600" aria-hidden="true" />
          Provider Infrastruktur
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Kami bekerja sama dengan provider terpercaya yang memenuhi standar keamanan
            tertinggi:
          </p>
          <div className="mb-4 space-y-4">
            {infrastructureProviders.map((provider) => (
              <article key={provider.name} className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold text-gray-900">{provider.name}</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                  {provider.certifications.map((cert) => (
                    <li key={cert}>{cert}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs">
                  <a
                    href={provider.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded"
                  >
                    {provider.linkLabel} →
                  </a>
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="rounded-lg bg-blue-50 p-8 text-center" aria-labelledby="contact-cta-heading">
        <Contact className="mx-auto mb-4 h-12 w-12 text-blue-600" aria-hidden="true" />
        <h2 id="contact-cta-heading" className="mb-2 text-xl font-bold text-gray-900">
          Punya Pertanyaan Tentang Keamanan?
        </h2>
        <p className="mb-4 text-gray-700">
          Tim keamanan kami siap membantu menjawab pertanyaan Anda tentang keamanan data dan
          privasi.
        </p>
        <a
          href="/contact?subject=Pertanyaan%20Keamanan"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
        >
          Hubungi Tim Keamanan
        </a>
      </section>

      {/* Additional Resources */}
      <nav className="mt-12 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6" aria-label="Additional resources">
        <h3 className="mb-3 font-semibold text-gray-900">Sumber Daya Tambahan</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/privacy-policy" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
              Kebijakan Privasi
            </a>
          </li>
          <li>
            <a href="/terms" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
              Syarat & Ketentuan
            </a>
          </li>
          <li>
            <a href="/contact" className="text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-600 rounded">
              Hubungi Kami
            </a>
          </li>
        </ul>
      </nav>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        .security-card {
          animation: fadeInUp 0.6s ease-out both;
        }

        .security-logo-container {
          animation: pulse 5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}