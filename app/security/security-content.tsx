"use client";

import { ShieldCheck, Database, Lock, Scale, User, Building, Contact, Award } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

export function SecurityContent() {
  return (
    <>
      {/* Hero Section */}
      <section className="mb-12 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 p-8 text-center">
        <ShieldCheck className="mx-auto mb-4 h-16 w-16 text-blue-600" />
        <h2 className="mb-2 text-2xl font-bold text-gray-900">Keamanan Data Anda Adalah Prioritas Kami</h2>
        <p className="text-gray-700">
          Balikin berkomitmen untuk melindungi privasi dan keamanan data Anda dengan standar
          keamanan kelas dunia dan kepatuhan penuh terhadap regulasi Indonesia.
        </p>
      </section>

      {/* Certifications Showcase */}
      <section className="mb-12">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Award className="h-6 w-6 text-blue-600" />
          Sertifikasi & Kepatuhan
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-col items-center gap-3 text-center">
              <motion.div
                className="relative h-20 w-20 rounded-xl border-2 border-blue-100 bg-white p-3 shadow-lg"
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)'
                }}
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              >
                <Image
                  src="/logo_trust/soc2.png"
                  alt="SOC 2 Type II"
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">SOC 2® Type II</h3>
            </div>
            <p className="text-sm text-gray-700 text-center">
              Audit keamanan yang ketat oleh pihak ketiga untuk memastikan kontrol keamanan
              yang memadai dalam melindungi data Anda.
            </p>
          </motion.div>

          <motion.div
            className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-col items-center gap-3 text-center">
              <motion.div
                className="relative h-20 w-20 rounded-xl border-2 border-blue-100 bg-white p-3 shadow-lg"
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)'
                }}
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 1.5
                }}
              >
                <Image
                  src="/logo_trust/iso27001.png"
                  alt="ISO 27001"
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">ISO 27001</h3>
            </div>
            <p className="text-sm text-gray-700 text-center">
              Sistem manajemen keamanan informasi yang terstandarisasi international untuk
              memastikan keamanan data berkelanjutan.
            </p>
          </motion.div>

          <motion.div
            className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-col items-center gap-3 text-center">
              <motion.div
                className="relative h-20 w-20 rounded-xl border-2 border-blue-100 bg-white p-3 shadow-lg"
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)'
                }}
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 3
                }}
              >
                <Image
                  src="/logo_trust/gdpr.png"
                  alt="GDPR Compliant"
                  width={80}
                  height={80}
                  className="h-full w-full object-contain"
                />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">GDPR Compliant</h3>
            </div>
            <p className="text-sm text-gray-700 text-center">
              Kepatuhan penuh terhadap General Data Protection Regulation Uni Eropa untuk
              perlindungan data pribadi yang komprehensif.
            </p>
          </motion.div>

          <motion.div
            className="rounded-lg border border-blue-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
          >
            <div className="mb-4 flex flex-col items-center gap-3 text-center">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-blue-100 bg-white p-3 shadow-lg"
                whileHover={{
                  scale: 1.1,
                  boxShadow: '0 16px 32px rgba(0, 0, 0, 0.15)'
                }}
                animate={{
                  scale: [1, 1.06, 1],
                }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: 4.5
                }}
              >
                <Lock className="h-10 w-10 text-blue-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">SSL/TLS Encryption</h3>
            </div>
            <p className="text-sm text-gray-700 text-center">
              Enkripsi end-to-end untuk semua transmisi data dengan protokol SSL/TLS modern
              dan certificate yang valid.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Data Storage */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Database className="h-6 w-6 text-blue-600" />
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
              <li>
                <strong>Supabase (AWS):</strong> Database dengan SOC2, ISO 27001, dan GDPR
                compliant
              </li>
              <li>
                <strong>Vercel:</strong> Hosting dengan SOC2 Type II dan ISO 27001 certified
              </li>
              <li>
                <strong>Lokasi Server:</strong> Singapore (ap-southeast-1) dan Indonesia
              </li>
            </ul>
          </div>
          <p className="text-sm text-gray-600">
            <a
              href="https://supabase.com/security"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Pelajari keamanan Supabase →
            </a>
          </p>
        </div>
      </section>

      {/* Encryption */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Lock className="h-6 w-6 text-blue-600" />
          Enkripsi Data
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Pesan dan data Anda dilindungi dengan enkripsi standar perbankan. Kami menerapkan
            enkripsi berlapis untuk memastikan data Anda tetap aman:
          </p>
          <ul className="mb-4 list-inside list-disc space-y-2 text-sm text-gray-700">
            <li>
              <strong>Enkripsi Transmisi:</strong> SSL/TLS 1.3 untuk semua data yang dikirim
              antara browser dan server
            </li>
            <li>
              <strong>Enkripsi Database:</strong> Data dienkripsi saat disimpan (at-rest
              encryption) dengan AES-256
            </li>
            <li>
              <strong>Enkripsi Backup:</strong> Semua backup data dienkripsi dan disimpan
              secara aman
            </li>
            <li>
              <strong>Secure Communication:</strong> WhatsApp dan Email terenkripsi untuk
              notifikasi OTP
            </li>
          </ul>
          <details className="rounded-lg bg-gray-50 p-4">
            <summary className="cursor-pointer text-sm font-semibold text-gray-900">
              Teknis Detail (Opsional)
            </summary>
            <div className="mt-3 text-xs text-gray-600">
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
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Scale className="h-6 w-6 text-blue-600" />
          Kepatuhan UU PDP No. 27 Tahun 2022
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Balikin berkomitmen penuh untuk mematuhi Undang-Undang Perlindungan Data Pribadi
            No. 27 Tahun 2022. Berikut adalah checklist kepatuhan kami:
          </p>
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Data Minimization</p>
                <p className="text-xs text-gray-600">
                  Hanya mengumpulkan data yang benar-benar diperlukan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Privacy Policy Jelas</p>
                <p className="text-xs text-gray-600">
                  Kebijakan privasi dalam bahasa Indonesia yang mudah dipahami
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Right to be Forgotten</p>
                <p className="text-xs text-gray-600">
                  Fitur hapus akun & data permanen untuk pengguna
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Data Access Request</p>
                <p className="text-xs text-gray-600">
                  Pengguna dapat meminta akses ke data yang disimpan
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Data Portability</p>
                <p className="text-xs text-gray-600">
                  Pengguna dapat meminta portabilitas data dalam format terbaca
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-lg bg-green-50 p-3">
              <span className="text-green-600">✅</span>
              <div>
                <p className="text-sm font-medium text-gray-900">Consent Management</p>
                <p className="text-xs text-gray-600">
                  Explicit consent untuk pengumpulan dan penggunaan data
                </p>
              </div>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Lihat kebijakan privasi lengkap kami di{" "}
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </a>
          </p>
        </div>
      </section>

      {/* User Rights */}
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <User className="h-6 w-6 text-blue-600" />
          Hak Anda Sebagai Pengguna
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Sebagai pengguna, Anda memiliki hak penuh atas data pribadi Anda sesuai dengan UU
            PDP:
          </p>
          <ul className="mb-6 space-y-3 text-sm text-gray-700">
            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                1
              </span>
              <div>
                <p className="font-semibold text-gray-900">Hak Akses Data</p>
                <p className="text-gray-600">
                  Anda dapat meminta salinan semua data pribadi yang kami simpan tentang Anda
                  kapan saja melalui dashboard.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                2
              </span>
              <div>
                <p className="font-semibold text-gray-900">Hak Koreksi</p>
                <p className="text-gray-600">
                  Anda dapat memperbaiki data yang tidak akurat atau melengkapi data yang
                  tidak lengkap melalui dashboard.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                3
              </span>
              <div>
                <p className="font-semibold text-gray-900">Hak Penghapusan</p>
                <p className="text-gray-600">
                  Anda dapat menghapus akun dan semua data terkait secara permanen melalui
                  dashboard. Penghapusan bersifat permanen dan tidak dapat dibatalkan.
                </p>
              </div>
            </li>

            <li className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold">
                4
              </span>
              <div>
                <p className="font-semibold text-gray-900">Hak Portabilitas</p>
                <p className="text-gray-600">
                  Anda dapat meminta data Anda dalam format terstruktur dan umum yang dapat
                  digunakan oleh sistem lain.
                </p>
              </div>
            </li>
          </ul>

          <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
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
      <section className="mb-12">
        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900">
          <Building className="h-6 w-6 text-blue-600" />
          Provider Infrastruktur
        </h2>
        <div className="rounded-lg border bg-white p-6">
          <p className="mb-4 text-gray-700">
            Kami bekerja sama dengan provider terpercaya yang memenuhi standar keamanan
            tertinggi:
          </p>
          <div className="mb-4 space-y-4">
            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Vercel (Hosting Platform)</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                <li>SOC 2 Type II Certified</li>
                <li>ISO 27001 Certified</li>
                <li>GDPR Compliant</li>
                <li>Automated security updates & patching</li>
              </ul>
              <p className="mt-2 text-xs">
                <a
                  href="https://vercel.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Pelajari keamanan Vercel →
                </a>
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold text-gray-900">Supabase & AWS (Database)</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                <li>SOC 2, ISO 27001, and GDPR Compliant</li>
                <li>AES-256 encryption at rest</li>
                <li>Continuous security monitoring</li>
                <li>Regular penetration testing</li>
              </ul>
              <p className="mt-2 text-xs">
                <a
                  href="https://supabase.com/security"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Pelajari keamanan Supabase →
                </a>
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <h3 className="mb-2 font-semibold text-gray-900">AWS Compliance</h3>
              <ul className="list-inside list-disc space-y-1 text-sm text-gray-700">
                <li>90+ security certifications and compliance programs</li>
                <li>ISO 27001, SOC 1/2/3, GDPR, HIPAA, PCI DSS</li>
                <li>24/7 security monitoring and incident response</li>
              </ul>
              <p className="mt-2 text-xs">
                <a
                  href="https://aws.amazon.com/compliance/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Pelajari compliance AWS →
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="rounded-lg bg-blue-50 p-8 text-center">
        <Contact className="mx-auto mb-4 h-12 w-12 text-blue-600" />
        <h2 className="mb-2 text-xl font-bold text-gray-900">Punya Pertanyaan Tentang Keamanan?</h2>
        <p className="mb-4 text-gray-700">
          Tim keamanan kami siap membantu menjawab pertanyaan Anda tentang keamanan data dan
          privasi.
        </p>
        <a
          href="/contact?subject=Pertanyaan%20Keamanan"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
        >
          Hubungi Tim Keamanan
        </a>
      </section>

      {/* Additional Resources */}
      <section className="mt-12 rounded-lg border border-dashed border-gray-300 bg-gray-50 p-6">
        <h3 className="mb-3 font-semibold text-gray-900">Sumber Daya Tambahan</h3>
        <ul className="space-y-2 text-sm">
          <li>
            <a href="/privacy-policy" className="text-blue-600 hover:underline">
              Kebijakan Privasi
            </a>
          </li>
          <li>
            <a href="/terms" className="text-blue-600 hover:underline">
              Syarat & Ketentuan
            </a>
          </li>
          <li>
            <a href="/contact" className="text-blue-600 hover:underline">
              Hubungi Kami
            </a>
          </li>
        </ul>
      </section>
    </>
  );
}
