import type { BrandPillar } from '@/lib/blog-content-strategy';

export type VideoIdea = {
  id: string;
  title: string;
  category: 'Masalah' | 'Edukasi' | 'Produk' | 'Trust';
  audience: string;
  brandPillar: BrandPillar;
  product: 'Katalog' | 'Free Pass' | 'Printable Premium' | 'Akrilik' | 'Sticker';
  hook: string;
  visual: string;
  takeaway: string;
  cta: string;
};

type VideoIdeaSeed = Omit<VideoIdea, 'brandPillar'>;

const VIDEO_IDEA_SEEDS: VideoIdeaSeed[] = [
  { id: 'mhs-01', title: 'Kalau Helm Hilang Hari Ini', category: 'Masalah', audience: 'Mahasiswa', product: 'Katalog', hook: 'Kalau helm kamu hilang hari ini, penemunya harus menghubungi siapa?', visual: 'Helm tertinggal di area parkir umum lalu ditemukan orang lain.', takeaway: 'QR Balikin memberi jalur kontak yang aman antara penemu dan pemilik.', cta: 'Lihat katalog Balikin di balikin.online/produk' },
  { id: 'mhs-02', title: 'Laptop Tertinggal di Tempat Umum', category: 'Masalah', audience: 'Mahasiswa', product: 'Katalog', hook: 'Laptop tertinggal. Bagaimana penemunya bisa menghubungi pemilik?', visual: 'Laptop tertinggal di ruang kerja bersama lalu ditemukan pengunjung lain.', takeaway: 'Identitas QR membuka jalur kontak tanpa mencetak nomor HP di barang.', cta: 'Lihat pilihan produk di balikin.online/produk' },
  { id: 'mhs-03', title: 'Barang di Ruang Bersama Tertukar', category: 'Masalah', audience: 'Mahasiswa', product: 'Sticker', hook: 'Barang di ruang bersama sering tertukar? Beri identitas yang mudah dikenali.', visual: 'Botol minum dan charger tertukar di ruang bersama.', takeaway: 'Identitas yang jelas membantu membedakan barang sehari-hari.', cta: 'Lihat pilihan sticker Balikin di balikin.online/stickers' },
  { id: 'mhs-04', title: 'Kunci Motor Terjatuh', category: 'Masalah', audience: 'Mahasiswa', product: 'Akrilik', hook: 'Kunci motor ditemukan di parkiran. Apa langkah baik berikutnya?', visual: 'Seseorang menemukan gantungan kunci di area parkir umum dan mencari cara menghubungi pemilik.', takeaway: 'Penemu dapat memindai QR untuk membuka jalur kontak pemilik.', cta: 'Lihat Gantungan Akrilik di balikin.online/produk' },
  { id: 'mhs-05', title: 'Tas Tertinggal di Kafe', category: 'Masalah', audience: 'Mahasiswa', product: 'Katalog', hook: 'Tas tertinggal di kafe bukan berarti selesai begitu saja.', visual: 'Tas tertinggal di kursi kafe, lalu QR pada tag terlihat.', takeaway: 'Satu scan dapat memberi notifikasi kepada pemilik.', cta: 'Pilih media QR di balikin.online/produk' },
  { id: 'mhs-06', title: 'Nomor HP di Barang Itu Aman?', category: 'Masalah', audience: 'Mahasiswa', product: 'Katalog', hook: 'Menulis nomor HP di barang memang mudah, tapi apakah aman?', visual: 'Close-up nomor HP di label barang berubah menjadi QR Balikin.', takeaway: 'Balikin memberi jalur kontak tanpa menampilkan nomor HP sebagai teks publik.', cta: 'Pelajari produk Balikin di balikin.online/produk' },
  { id: 'mhs-07', title: 'Barang Tertinggal Saat Bepergian', category: 'Masalah', audience: 'Mahasiswa', product: 'Katalog', hook: 'Barang tertinggal saat perjalanan. Masih ada peluang untuk menemukannya.', visual: 'Seseorang turun dari kendaraan, lalu menyadari tas kecilnya tertinggal.', takeaway: 'Identitas barang membantu penemu mengetahui cara menghubungi pemilik.', cta: 'Mulai dari katalog Balikin' },
  { id: 'mhs-08', title: 'TWS dan Charger Sulit Dikenali', category: 'Masalah', audience: 'Mahasiswa', product: 'Sticker', hook: 'Barang kecil seperti TWS dan charger paling mudah tertinggal.', visual: 'Barang kecil berpindah di antara meja belajar.', takeaway: 'Sticker Micro cocok untuk barang kecil yang rentan terselip.', cta: 'Lihat Sticker Micro di balikin.online/stickers' },
  { id: 'mhs-09', title: 'Satu Label untuk Banyak Barang', category: 'Masalah', audience: 'Mahasiswa', product: 'Sticker', hook: 'Kenapa satu sheet sticker bisa lebih berguna daripada satu label?', visual: 'Satu sheet sticker dipasang ke laptop, botol, dan charger.', takeaway: 'Paket Family membantu melindungi beberapa ukuran barang sekaligus.', cta: 'Lihat paket sticker Family di balikin.online/stickers' },
  { id: 'mhs-10', title: 'Sebelum Keluar Rumah', category: 'Masalah', audience: 'Mahasiswa', product: 'Katalog', hook: 'Sebelum pergi: cek kunci, dompet, dan identitas barang.', visual: 'Flat lay barang harian yang dibawa saat bepergian: kunci, dompet, botol minum, dan tas.', takeaway: 'Mengecek barang dan identitasnya bisa menjadi kebiasaan sederhana sebelum berangkat.', cta: 'Lihat katalog produk Balikin' },
  { id: 'mhs-11', title: 'Cara Scan QR Balikin', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Begini cara penemu menghubungi pemilik barang dalam beberapa detik.', visual: 'Tangan menemukan barang dan memindai QR menggunakan kamera HP.', takeaway: 'Penemu tidak perlu memasang aplikasi khusus untuk memulai kontak.', cta: 'Lihat cara kerja dan produk Balikin' },
  { id: 'mhs-12', title: 'Apa yang Terjadi Setelah Scan?', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Apa yang sebenarnya terjadi setelah QR barangmu dipindai?', visual: 'Urutan scan, halaman profil, tombol kontak, dan notifikasi pemilik.', takeaway: 'Scan tercatat dan pemilik dapat mengetahui ada orang yang menemukan barangnya.', cta: 'Coba sistemnya di balikin.online' },
  { id: 'mhs-13', title: 'Free Pass untuk Coba Dulu', category: 'Edukasi', audience: 'Mahasiswa', product: 'Free Pass', hook: 'Belum siap membeli produk fisik? Mulai dari QR digital gratis.', visual: 'Seseorang membuat akun dan menampilkan QR digital dari ponsel.', takeaway: 'Free Pass adalah cara termudah mencoba sistem Balikin.', cta: 'Mulai gratis di balikin.online/sign-up' },
  { id: 'mhs-14', title: 'Printable Tanpa Menunggu Kiriman', category: 'Edukasi', audience: 'Mahasiswa', product: 'Printable Premium', hook: 'Butuh QR premium hari ini dan bisa mencetak sendiri?', visual: 'File PNG dan PDF dibuka lalu dicetak di printer rumah atau percetakan.', takeaway: 'Printable Premium memberi file siap cetak tanpa watermark.', cta: 'Pilih Printable Premium di balikin.online/dashboard/printable' },
  { id: 'mhs-15', title: 'Perbedaan Free dan Premium', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Apa bedanya QR gratis dengan QR premium Balikin?', visual: 'Split screen Free Pass, Printable, Sticker, dan Akrilik.', takeaway: 'Pengguna dapat memilih tingkat perlindungan sesuai kebutuhan dan anggaran.', cta: 'Bandingkan semua produk di balikin.online/produk' },
  { id: 'mhs-16', title: 'Kontak Anonim untuk Pemilik', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Penemu bisa menghubungi kamu tanpa melihat nomor HP sebagai teks.', visual: 'Tampilan tombol kontak anonim dan notifikasi scan, tanpa data pribadi nyata.', takeaway: 'Balikin membantu menjaga privasi sambil tetap membuka jalur komunikasi.', cta: 'Pelajari sistem Balikin di balikin.online' },
  { id: 'mhs-17', title: 'Cara Memilih Media QR', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Sticker, akrilik, atau printable: mana yang cocok untuk barangmu?', visual: 'Tiga media diletakkan berdampingan dengan contoh barang.', takeaway: 'Pilih berdasarkan jenis barang, durabilitas, dan cara pemasangan.', cta: 'Lihat semua pilihan di balikin.online/produk' },
  { id: 'mhs-18', title: 'Kenapa QR Perlu Dinamis?', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Kalau nomor WhatsApp berubah, apakah label barang harus dicetak ulang?', visual: 'Profil kontak diperbarui di dashboard sementara QR fisik tetap sama.', takeaway: 'Data kontak dapat dikelola tanpa mengganti media QR.', cta: 'Mulai gunakan Balikin di balikin.online' },
  { id: 'mhs-19', title: 'Simulasi Lost Mode', category: 'Edukasi', audience: 'Mahasiswa', product: 'Katalog', hook: 'Satu tombol bisa mengubah halaman QR saat barang dinyatakan hilang.', visual: 'Dashboard mengubah status menjadi hilang lalu tampilan publik berubah.', takeaway: 'Lost Mode membantu membuat pesan kehilangan lebih jelas bagi penemu.', cta: 'Lihat cara kerja Balikin' },
  { id: 'mhs-20', title: 'Cara Memasang QR di Barang', category: 'Edukasi', audience: 'Mahasiswa', product: 'Sticker', hook: 'Jangan asal menempel QR. Pilih lokasi yang mudah terlihat dan tidak mengganggu.', visual: 'Demonstrasi pemasangan sticker pada laptop, botol, dan helm.', takeaway: 'Permukaan bersih dan lokasi yang terlihat membantu QR mudah ditemukan.', cta: 'Lihat varian sticker Balikin' },
  { id: 'mhs-21', title: 'Melihat Lebih Dekat Gantungan Akrilik', category: 'Produk', audience: 'Mahasiswa', product: 'Akrilik', hook: 'Apa yang perlu diperhatikan sebelum memilih gantungan QR?', visual: 'Unboxing dan close-up akrilik, ring, QR, dan detail material.', takeaway: 'Tunjukkan produk nyata dan detailnya agar orang dapat menilai dengan informasi yang jelas.', cta: 'Lihat detail Gantungan Akrilik di balikin.online/produk' },
  { id: 'mhs-22', title: 'Mengenal QR Printable Premium', category: 'Produk', audience: 'Mahasiswa', product: 'Printable Premium', hook: 'Ingin mencetak QR sendiri? Ini yang perlu kamu ketahui.', visual: 'Tampilan file PNG dan PDF, lalu proses cetak contoh.', takeaway: 'Jelaskan isi dan cara menggunakan file berdasarkan informasi produk yang tersedia.', cta: 'Pelajari QR Printable Premium di balikin.online/produk' },
  { id: 'mhs-23', title: 'Sticker Micro untuk Barang Kecil', category: 'Produk', audience: 'Mahasiswa', product: 'Sticker', hook: 'Barang kecil butuh QR yang kecil, bukan label yang mengganggu.', visual: 'Sticker Micro pada TWS, powerbank, charger, dan flashdisk.', takeaway: 'Ukuran Micro dirancang untuk barang kecil yang mudah terselip.', cta: 'Lihat Sticker Micro di balikin.online/stickers' },
  { id: 'mhs-24', title: 'Sticker Family untuk Barang Sehari-hari', category: 'Produk', audience: 'Mahasiswa', product: 'Sticker', hook: 'Satu sheet sticker untuk beberapa barang yang sering dibawa.', visual: 'Paket Family dibuka dan ditempel pada botol, koper, tas, dan perlengkapan sehari-hari.', takeaway: 'Paket Family memberi kombinasi ukuran untuk kebutuhan harian.', cta: 'Lihat Sticker Family di balikin.online/stickers' },
  { id: 'mhs-25', title: 'Akrilik vs Sticker', category: 'Produk', audience: 'Mahasiswa', product: 'Katalog', hook: 'Akrilik atau sticker? Jawabannya tergantung barang yang ingin kamu lindungi.', visual: 'Perbandingan akrilik pada kunci dan sticker pada laptop/botol.', takeaway: 'Akrilik cocok untuk gantungan; sticker cocok untuk permukaan barang.', cta: 'Bandingkan produk di balikin.online/produk' },
  { id: 'mhs-26', title: 'Unboxing Pesanan Balikin', category: 'Produk', audience: 'Mahasiswa', product: 'Katalog', hook: 'Apa saja isi paket Balikin saat sampai di tanganmu?', visual: 'Paket dibuka, produk diperiksa, dan QR ditunjukkan.', takeaway: 'Tampilkan produk nyata agar calon pembeli memahami isi pesanan.', cta: 'Lihat katalog Balikin' },
  { id: 'mhs-27', title: 'Untuk Barang yang Selalu Dibawa', category: 'Trust', audience: 'Mahasiswa', product: 'Katalog', hook: 'Setiap hari, barang kita ikut berpindah dari satu tempat ke tempat lain.', visual: 'Montage rumah, transportasi umum, tempat kerja, toko, dan ruang publik di Indonesia.', takeaway: 'Balikin membantu membuka jalur kontak ketika barang ditemukan di mana pun.', cta: 'Kenali cara kerja Balikin di balikin.online' },
  { id: 'mhs-28', title: 'Behind the Scenes QR', category: 'Trust', audience: 'Mahasiswa', product: 'Katalog', hook: 'Sebelum produk sampai, ini yang perlu disiapkan.', visual: 'Pengecekan QR, packing, dan persiapan pesanan.', takeaway: 'Proses yang terlihat membantu membangun kepercayaan calon pembeli.', cta: 'Lihat produk Balikin di katalog' },
  { id: 'mhs-29', title: 'Simulasi Barang Ditemukan', category: 'Trust', audience: 'Mahasiswa', product: 'Katalog', hook: 'Kami simulasikan apa yang terjadi ketika barang Balikin ditemukan.', visual: 'Skenario penemu, scan QR, kontak anonim, dan notifikasi.', takeaway: 'Video simulasi harus diberi label jelas dan tidak mengklaim kejadian nyata.', cta: 'Pelajari Balikin di balikin.online' },
  { id: 'mhs-30', title: 'Pilih Proteksimu', category: 'Trust', audience: 'Mahasiswa', product: 'Katalog', hook: 'Tidak semua barang butuh media yang sama. Yang penting, mulai dari QR.', visual: 'Free Pass, Printable, Sticker, dan Akrilik tersusun sebagai pilihan.', takeaway: 'Balikin memiliki jalur masuk untuk berbagai kebutuhan dan anggaran.', cta: 'Lihat semua produk di balikin.online/produk' },
];

const BRAND_PILLAR_BY_ID: Record<string, BrandPillar> = {
  'mhs-01': 'cerita-barang-kembali',
  'mhs-02': 'cerita-barang-kembali',
  'mhs-03': 'kebiasaan-jaga-barang',
  'mhs-04': 'kebaikan-si-penemu',
  'mhs-05': 'cerita-barang-kembali',
  'mhs-06': 'aman-jelas-transparan',
  'mhs-07': 'cerita-barang-kembali',
  'mhs-08': 'kebiasaan-jaga-barang',
  'mhs-09': 'kebiasaan-jaga-barang',
  'mhs-10': 'kebiasaan-jaga-barang',
  'mhs-11': 'kebaikan-si-penemu',
  'mhs-12': 'aman-jelas-transparan',
  'mhs-13': 'aman-jelas-transparan',
  'mhs-14': 'kebiasaan-jaga-barang',
  'mhs-15': 'aman-jelas-transparan',
  'mhs-16': 'aman-jelas-transparan',
  'mhs-17': 'kebiasaan-jaga-barang',
  'mhs-18': 'aman-jelas-transparan',
  'mhs-19': 'aman-jelas-transparan',
  'mhs-20': 'kebiasaan-jaga-barang',
  'mhs-21': 'aman-jelas-transparan',
  'mhs-22': 'aman-jelas-transparan',
  'mhs-23': 'kebiasaan-jaga-barang',
  'mhs-24': 'kebiasaan-jaga-barang',
  'mhs-25': 'aman-jelas-transparan',
  'mhs-26': 'aman-jelas-transparan',
  'mhs-27': 'cerita-barang-kembali',
  'mhs-28': 'aman-jelas-transparan',
  'mhs-29': 'kebaikan-si-penemu',
  'mhs-30': 'aman-jelas-transparan',
};

export const VIDEO_IDEAS: VideoIdea[] = VIDEO_IDEA_SEEDS.map((idea) => ({
  ...idea,
  audience: 'Pemilik barang dan masyarakat Indonesia',
  brandPillar: BRAND_PILLAR_BY_ID[idea.id],
}));
