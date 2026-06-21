# Rencana Pengembangan & To-Do List (Produksi): Balikin

**Versi**: 3.1 (Post-Grill Audit Edition)

**Tujuan**: Panduan langkah-demi-langkah implementasi Next.js, Supabase, dan VDP yang kebal terhadap kegagalan sistem fisik, keamanan, dan operasional.

---

## Struktur Fase Pengembangan

```
[FASE 1: Setup & DB] ──> [FASE 2: VDP & Buffer Guard] ──> [FASE 3: Transaksi & Sesi Cookie]
                                                                │
[FASE 6: Sliding pg_cron] <── [FASE 5: Debounced WA API] <── [FASE 4: Chat Guard & Limit]
```

---

## Checklist & To-Do List Detektif

### [ ] FASE 1: Setup Database, Autentikasi, & Batch Tracking

Fase ini meletakkan pondasi agar data tag tidak mengalami desinkronisasi saat proses cetak massal oleh vendor.

#### [ ] Skema Database Relasional

Implementasikan tabel-tabel database pada Postgres Supabase menggunakan Drizzle ORM atau SQL Editor:

- [ ] Tabel `print_batches` untuk melacak nomor lembar cetak A3
- [ ] Tabel `tags` (tambahkan kolom `activation_token_hash`, `activation_pin_hash`, `activation_pin_plain`, `serial_number`, `is_custom`, dan `batch_id`)
- [ ] Tabel `chat_rooms` (dengan kolom `updated_at` untuk mekanisme sliding window)
- [ ] Tabel `messages` (dengan status `is_read_by_owner`)

#### [ ] Fungsi Kriptografi Utilitas (`lib/crypto.ts`)

- [ ] Tulis fungsi enkripsi satu arah SHA-256 untuk hashing Token dan PIN sebelum disimpan ke database

#### [ ] Security Rule

- [ ] Pastikan tidak ada token atau PIN polos (plain text) yang tersimpan di dalam database demi menghindari kebocoran massal jika database diretas

#### [ ] Setup Autentikasi Pengguna

- [ ] Integrasikan Better Auth atau Supabase Auth untuk mengamankan sesi pendaftaran pembeli baru
- [ ] Konfigurasi rute login agar mendukung parameter `callbackUrl` yang dinamis

---

### [ ] FASE 2: VDP Engine, Memori-Aman (Anti-Crash Server), & Batch Reprint

Fase ini mencegah server Next.js Anda mengalami 'out of memory' saat me-render lembar A3 resolusi tinggi, serta mempermudah operasional cetak ulang.

#### [ ] Konfigurasi Batas Rendering Paralel (Anti RAM Bloat)

- [ ] Instal library `p-limit` atau buat antrean queue chunking di backend
- [ ] **Grill Guard 1.1**: Batasi proses rendering gambar menggunakan Sharp/PDFKit maksimal hanya 2-3 halaman secara bersamaan guna menekan lonjakan RAM server Next.js

#### [ ] Teknik Streaming Output (Direct Download)

- [ ] Modifikasi API route export PDF menggunakan ReadableStream
- [ ] **Grill Guard 1.1**: Kirimkan data byte gambar langsung ke browser pengguna saat digenerate secara bertahap, alih-alih menimbun seluruh file biner PDF di memori RAM server

#### [ ] Logika Layout VDP 9-Kolom Berdempetan (0mm Gap)

- [ ] Atur koordinat piksel stiker 90 × 45 mm agar terbagi presisi menjadi 3 elemen horizontal: Sisi Depan (30 mm), Sisi Belakang (30 mm), dan Stiker Aktivasi (30 mm)
- [ ] Tambahkan Nomor Seri Mikro (ukuran font 6pt warna abu-abu gelap) di margin bawah masing-masing kolom stiker untuk keperluan kendali mutu (quality control)
- [ ] Khusus Kolom 3 (Stiker Aktivasi), render QR Code dengan ukuran fisik 22 × 22 mm (skala DPI cetak), teks PIN polos, dan tulisan instruksi "SCAN UNTUK AKTIVASI"

#### [ ] Sistem Cetak Ulang Pintar (Batch Reprint)

- [ ] **Grill Guard 1.2**: Buat Server Action `generateBatchPdf(batchId: string)` yang mencari data tag lama di tabel `print_batches` dan mengemasnya kembali ke dalam PDF yang sama persis tanpa me-generate ulang token di database

---

### [ ] FASE 3: Transaksi Kebal Race Condition & Pengaman Sesi Registrasi

Fase ini menjamin proses klaim hak milik berjalan 100% sukses meski koneksi internet tidak stabil atau ada percobaan manipulasi request.

#### [ ] Pengunci Sesi Browser Sementara (Anti State Loss)

- [ ] **Grill Guard 2.1**: Saat pengguna anonim memindai QR Aktivasi, simpan parameter slug dan token ke dalam cookie enkripsi browser berumur pendek (30 menit) menggunakan library `iron-session` atau cookie bawaan Next.js
- [ ] Tulis middleware atau cek otomatis di halaman setelah registrasi selesai: Jika cookie tersebut ada, langsung eksekusi proses klaim kepemilikan tag secara otomatis tanpa bergantung pada parameter URL

#### [ ] Alur Validasi Klaim Transaksional (Anti Race Condition)

- [ ] **Grill Guard 2.2**: Di dalam Server Action `processActivation`, bungkus seluruh baris query cek status unclaimed dan update ke claimed di dalam transaksi database (`db.transaction`)
- [ ] Terapkan metode Row Locking (gunakan instruksi `SELECT FOR UPDATE` pada PostgreSQL) agar baris tag tersebut dikunci penuh selama transaksi berjalan, mencegah bot mengklaim tag yang sama secara simultan

#### [ ] Halaman Klaim `/claim-required`

- [ ] Desain UI form input yang elegan bagi pembeli yang ingin mengetikkan PIN Manual Fallback jika stiker QR di lembar panduannya rusak fisik

---

### [ ] FASE 4: Obrolan Realtime, Tameng Spam, & Kontrol Blokir

Fase ini memastikan kenyamanan dan privasi pemilik barang terjaga penuh dari teror penemu anonim.

#### [ ] Halaman Obrolan `/chat/[roomId]` (Supabase Websocket)

- [ ] Hubungkan komponen chat menggunakan Supabase Realtime Channel
- [ ] Konfigurasi hak akses: Penemu masuk sebagai Guest Anonim tanpa login, pemilik masuk dengan akun terverifikasi

#### [ ] Sistem Batasan Pesan (Guest Rate Limiting)

- [ ] **Grill Guard 2.1**: Pada Server Action pengiriman pesan, pasang query pengecekan ke tabel `messages`. Jika pengirim adalah finder dan sudah mengirim ≥ 5 pesan dalam 1 menit terakhir, tolak request pesan berikutnya

#### [ ] Saringan Teks Kotor (Anti-Abuse Filter)

- [ ] Buat fungsi utilitas pembersih kata kasar (menggunakan kamus sensor lokal) dan deteksi pola regex tautan mencurigakan (spam links) sebelum data disimpan ke database

#### [ ] Fungsi Pemutus Sesi Sepihak (Block Penemu)

- [ ] Sediakan tombol "Blokir Penemu / Tutup Obrolan" di dashboard pemilik
- [ ] Saat diklik, ubah status `isActive` pada tabel `chat_rooms` menjadi false. Tutup koneksi websocket dan tampilkan pesan "Sesi chat ini telah ditutup oleh pemilik" di browser penemu

---

### [ ] FASE 5: Sistem Notifikasi Cadangan & Agregasi WhatsApp (Cost Control)

Fase ini menjamin pemilik segera tahu barangnya ditemukan tanpa menguras kuota tagihan API WhatsApp Anda.

#### [ ] Modul Notifikasi Dasar

- [ ] Konfigurasi Push Notification PWA menggunakan Service Worker di Next.js untuk perangkat Android dan iOS modern

#### [ ] Sistem Penunda & Agregasi Peringatan (WhatsApp Debouncer)

- [ ] **Grill Guard 3.1**: Jangan kirim notifikasi WhatsApp per pesan masuk
- [ ] Buat sistem background queue (menggunakan BullMQ, Inngest, atau Upstash): Saat ada pesan chat baru, jalankan delay waktu selama 2 menit di server
- [ ] Selama masa delay 2 menit tersebut, jika ada pesan chat tambahan masuk dari penemu, kumpulkan jumlahnya
- [ ] Setelah 2 menit habis, cek apakah status pesan-pesan tersebut sudah dibaca (`isReadByOwner = true`). Jika belum dibaca, gabungkan pesan tersebut menjadi tepat 1 pesan ringkasan ("Balikin Alert: Ada [X] pesan belum dibaca dari penemu...") dan kirimkan via WhatsApp API

#### [ ] Security Limit

- [ ] Batasi pengiriman pesan WhatsApp peringatan ini maksimal hanya 1 kali dalam 5 menit per pengguna

---

### [ ] FASE 6: Pembersihan Pintar (Sliding Window pg_cron) & Uji Coba Fisik

Fase penutupan untuk meminimalkan penumpukan data sampah di server serta pengujian kelayakan cetak fisik.

#### [ ] Skrip Pembersihan Otomatis (Anti-Zombie Chat)

- [ ] **Grill Guard 3.2**: Jalankan query SQL pg_cron di editor Supabase Anda
- [ ] **Kunci Utama**: Gunakan filter waktu berdasarkan aktivitas terakhir (`updatedAt < NOW() - INTERVAL '2 days'`) bukannya waktu pembuatan chat room. Hal ini memastikan obrolan penting yang sedang berlangsung antara pemilik dan penemu tidak terhapus otomatis secara mendadak di tengah malam

#### [ ] Uji Coba Lapangan (QC Fisik & Digital)

- [ ] Cetak file PDF hasil ekspor VDP A3 di kertas biasa. Periksa keterbacaan "Nomor Seri Mikro" ukuran 6pt secara visual
- [ ] Jalankan simulasi alur unboxing: scan QR Aktivasi → registrasi panjang di browser seluler internal → pastikan cookie temporer berhasil memicu klaim kepemilikan otomatis pasca-registrasi
- [ ] Berikan draf PDF layout A3 dengan gap pisau potong 2mm ke vendor cetak stiker lokal Anda untuk divalidasi presisinya

---

*End of Document*
