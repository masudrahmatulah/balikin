export const howItWorksSteps = [
  {
    step: 1,
    title: "Buat Tag",
    description:
      "Daftar akun, buat tag untuk kunci, tas, dompet, koper, atau barang pribadi lainnya. Sistem akan menghasilkan QR code unik yang terhubung ke halaman publik tag Anda.",
  },
  {
    step: 2,
    title: "Tempel atau Pasang",
    description:
      "Gunakan QR code digital atau upgrade ke gantungan kunci atau stiker premium. QR yang sama tetap bisa dipakai walaupun Anda mengganti nomor WhatsApp atau pesan yang ditampilkan.",
  },
  {
    step: 3,
    title: "Aktifkan Saat Dibutuhkan",
    description:
      "Dari dashboard, Anda bisa mengubah status barang menjadi normal atau hilang. Saat mode hilang aktif, halaman publik akan menampilkan tampilan yang lebih menonjol agar penemu segera tahu bahwa barang sedang dicari.",
  },
  {
    step: 4,
    title: "Penemu Scan dan Menghubungi Pemilik",
    description:
      "Penemu cukup scan QR code dengan kamera ponsel. Mereka akan melihat halaman yang mengarahkan ke WhatsApp pemilik tanpa perlu melihat nomor yang tercetak secara terbuka.",
  },
];

export const faqItems = [
  {
    question: "Apa itu Balikin?",
    answer:
      "Balikin adalah platform smart lost & found yang menggunakan QR code untuk menghubungkan barang fisik dengan identitas digital. Jika barang Anda hilang dan ditemukan orang lain, mereka bisa scan QR code dan menghubungi Anda tanpa melihat privasi Anda.",
  },
  {
    question: "Bagaimana cara kerja Balikin?",
    answer:
      '1) Daftar dan buat tag untuk barang Anda. 2) Download dan tempel QR code pada barang. 3) Jika barang hilang, ubah status ke "Hilang". 4) Penemu yang scan QR akan melihat info kontak Anda dan bisa menghubungi via WhatsApp.',
  },
  {
    question: "Apakah identitas saya aman?",
    answer:
      "Ya. Identitas Anda tidak ditampilkan pada benda fisik. Nomor WhatsApp tidak dicetak di tag dan penemu menghubungi Anda lewat tombol WhatsApp, sehingga privasi lebih terjaga.",
  },
  {
    question: "Berapa biaya menggunakan Balikin?",
    answer:
      "Versi digital Balikin gratis selamanya dengan maksimal 2 tag. Jika ingin produk fisik premium dan fitur tambahan, Anda bisa upgrade ke Premium seharga Rp35.000 per tag.",
  },
  {
    question: "Apakah perlu install aplikasi?",
    answer:
      "Tidak perlu. Balikin berbasis web dan bisa diakses langsung dari browser. Penemu cukup memakai kamera HP atau QR scanner bawaan.",
  },
  {
    question: "Bagaimana jika saya ganti nomor WhatsApp?",
    answer:
      "Anda bisa mengupdate nomor WhatsApp kapan saja lewat dashboard tanpa perlu mengganti QR code fisik, karena data tag bersifat dinamis.",
  },
  {
    question: "Apa yang terjadi jika barang saya hilang?",
    answer:
      'Ubah status tag ke "Hilang" di dashboard. Halaman publik akan berubah menjadi tampilan darurat dan setiap scan dapat dicatat untuk membantu pemilik mengetahui lokasi kasar terakhir.',
  },
  {
    question: "Apakah ada batas jumlah tag?",
    answer:
      "Untuk pengguna gratis, maksimal 2 tag digital. Untuk kebutuhan lebih banyak dan produk fisik premium, Anda bisa upgrade ke Premium.",
  },
];

export const marketingNavLinks = [
  { href: "/about", label: "Tentang" },
  { href: "/how-it-works", label: "Cara Kerja" },
  { href: "/stickers", label: "Sticker" },
  { href: "/pricing", label: "Harga" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Kontak" },
];

export const privacyPolicySections = [
  {
    id: "data-collection",
    title: "Data yang Kami Kumpulkan",
    content:
      "Balikin dapat memproses data akun seperti nomor WhatsApp, email, data tag, pesan khusus, serta informasi aktivitas seperti waktu scan dan perkiraan lokasi scan jika fitur terkait diaktifkan.",
  },
  {
    id: "data-usage",
    title: "Tujuan Penggunaan Data",
    items: [
      "Menyediakan layanan smart lost & found.",
      "Menghubungkan penemu barang dengan pemilik secara aman.",
      "Mengelola autentikasi, dashboard, dan status tag.",
      "Meningkatkan keamanan dan keandalan layanan.",
    ],
  },
  {
    id: "contact-privacy",
    title: "Privasi Kontak",
    content:
      "Balikin berupaya mengurangi eksposur nomor kontak dengan tidak menampilkannya secara terbuka pada media fisik. Kontak diarahkan melalui tombol aksi yang relevan.",
  },
  {
    id: "data-security",
    title: "Penyimpanan dan Keamanan",
    content:
      "Kami mengambil langkah yang wajar untuk menjaga keamanan data. Namun, tidak ada sistem yang dapat dijamin 100% bebas risiko.",
  },
];

export const termsOfServiceSections = [
  {
    id: "service-usage",
    title: "Penggunaan Layanan",
    content:
      "Balikin disediakan untuk membantu pemilik barang mengelola tag QR code dan membantu penemu menghubungi pemilik. Pengguna bertanggung jawab atas data yang mereka masukkan ke dalam sistem.",
  },
  {
    id: "tag-ownership",
    title: "Kepemilikan Tag",
    content:
      "Tag yang belum diklaim dapat dihubungkan ke akun pengguna pertama yang melakukan proses klaim sesuai alur sistem yang berlaku.",
  },
  {
    id: "liability",
    title: "Batas Tanggung Jawab",
    content:
      "Balikin membantu mempertemukan penemu dan pemilik, tetapi tidak dapat menjamin bahwa setiap barang yang hilang akan kembali.",
  },
  {
    id: "misuse",
    title: "Penyalahgunaan",
    content:
      "Pengguna dilarang memakai layanan untuk penipuan, pelanggaran privasi, atau aktivitas yang melanggar hukum.",
  },
];

export const contactSections = [
  {
    id: "whatsapp",
    title: "WhatsApp",
    description: "Pemesanan paling cepat bisa dilakukan lewat WhatsApp",
    type: "contact",
  },
  {
    id: "use-cases",
    title: "Kebutuhan yang Bisa Dibantu",
    items: [
      "Pemesanan gantungan kunci atau stiker QR code premium.",
      "Paket keluarga, sekolah, komunitas, dan corporate.",
      "Pertanyaan seputar privasi, aktivasi, atau upgrade tag.",
    ],
  },
  {
    id: "response-time",
    title: "Jam Respons",
    content:
      "Kami mengupayakan respons secepat mungkin pada jam kerja. Untuk kebutuhan pemesanan, sertakan nama, jumlah tag, dan tujuan penggunaan agar proses lebih cepat.",
  },
];

export const securityCertifications = [
  {
    id: "soc2",
    title: "SOC 2® Type II",
    image: "/logo_trust/soc2.png",
    description:
      "Audit keamanan yang ketat oleh pihak ketiga untuk memastikan kontrol keamanan yang memadai dalam melindungi data Anda.",
  },
  {
    id: "iso27001",
    title: "ISO 27001",
    image: "/logo_trust/iso27001.png",
    description:
      "Sistem manajemen keamanan informasi yang terstandarisasi international untuk memastikan keamanan data berkelanjutan.",
  },
  {
    id: "gdpr",
    title: "GDPR Compliant",
    image: "/logo_trust/gdpr.png",
    description:
      "Kepatuhan penuh terhadap General Data Protection Regulation Uni Eropa untuk perlindungan data pribadi yang komprehensif.",
  },
  {
    id: "ssl",
    title: "SSL/TLS Encryption",
    icon: "lock",
    description:
      "Enkripsi end-to-end untuk semua transmisi data dengan protokol SSL/TLS modern dan certificate yang valid.",
  },
];

export const securityDataProviders = [
  {
    name: "Supabase (AWS)",
    certifications: "SOC2, ISO 27001, dan GDPR compliant",
  },
  {
    name: "Vercel",
    certifications: "SOC 2 Type II dan ISO 27001 certified",
  },
  {
    name: "Lokasi Server",
    certifications: "Singapore (ap-southeast-1) dan Indonesia",
  },
];

export const encryptionFeatures = [
  {
    label: "Enkripsi Transmisi",
    description: "SSL/TLS 1.3 untuk semua data yang dikirim antara browser dan server",
  },
  {
    label: "Enkripsi Database",
    description: "Data dienkripsi saat disimpan (at-rest encryption) dengan AES-256",
  },
  {
    label: "Enkripsi Backup",
    description: "Semua backup data dienkripsi dan disimpan secara aman",
  },
  {
    label: "Secure Communication",
    description: "WhatsApp dan Email terenkripsi untuk notifikasi OTP",
  },
];

export const pdpComplianceItems = [
  { title: "Data Minimization", description: "Hanya mengumpulkan data yang benar-benar diperlukan" },
  { title: "Privacy Policy Jelas", description: "Kebijakan privasi dalam bahasa Indonesia yang mudah dipahami" },
  { title: "Right to be Forgotten", description: "Fitur hapus akun & data permanen untuk pengguna" },
  { title: "Data Access Request", description: "Pengguna dapat meminta akses ke data yang disimpan" },
  { title: "Data Portability", description: "Pengguna dapat meminta portabilitas data dalam format terbaca" },
  { title: "Consent Management", description: "Explicit consent untuk pengumpulan dan penggunaan data" },
];

export const userRights = [
  {
    id: 1,
    title: "Hak Akses Data",
    description:
      "Anda dapat meminta salinan semua data pribadi yang kami simpan tentang Anda kapan saja melalui dashboard.",
  },
  {
    id: 2,
    title: "Hak Koreksi",
    description:
      "Anda dapat memperbaiki data yang tidak akurat atau melengkapi data yang tidak lengkap melalui dashboard.",
  },
  {
    id: 3,
    title: "Hak Penghapusan",
    description:
      "Anda dapat menghapus akun dan semua data terkait secara permanen melalui dashboard. Penghapusan bersifat permanen dan tidak dapat dibatalkan.",
  },
  {
    id: 4,
    title: "Hak Portabilitas",
    description:
      "Anda dapat meminta data Anda dalam format terstruktur dan umum yang dapat digunakan oleh sistem lain.",
  },
];

export const infrastructureProviders = [
  {
    name: "Vercel (Hosting Platform)",
    certifications: ["SOC 2 Type II Certified", "ISO 27001 Certified", "GDPR Compliant", "Automated security updates & patching"],
    link: "https://vercel.com/security",
    linkLabel: "Pelajari keamanan Vercel",
  },
  {
    name: "Supabase & AWS (Database)",
    certifications: ["SOC 2, ISO 27001, and GDPR Compliant", "AES-256 encryption at rest", "Continuous security monitoring", "Regular penetration testing"],
    link: "https://supabase.com/security",
    linkLabel: "Pelajari keamanan Supabase",
  },
  {
    name: "AWS Compliance",
    certifications: ["90+ security certifications and compliance programs", "ISO 27001, SOC 1/2/3, GDPR, HIPAA, PCI DSS", "24/7 security monitoring and incident response"],
    link: "https://aws.amazon.com/compliance/",
    linkLabel: "Pelajari compliance AWS",
  },
];