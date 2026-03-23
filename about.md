# Blueprint Pengembangan Aplikasi "Balikin" (Smart Lost & Found QR Tag)

## 1. Ringkasan Aplikasi (Executive Summary)

**Balikin** adalah platform *Smart Lost & Found* yang menggabungkan produk fisik (gantungan kunci) dengan ekosistem digital. Aplikasi ini memungkinkan pemilik barang mengelola informasi kontak mereka secara dinamis melalui QR Code tanpa harus mengganti unit fisik jika terjadi perubahan data.

### Filosofi Strategi Hybrid: Freemium Digital & Premium Physical
Menghilangkan hambatan masuk (barrier to entry) dengan memberikan akses sistem digital secara gratis, namun mengonversi pengguna menjadi pembeli melalui nilai tambah pada kualitas material, keamanan ekstra, dan prestise.

* **Tujuan:** Memberikan rasa aman bagi pemilik kunci/barang berharga dan memudahkan penemu barang untuk menghubungi pemilik secara instan dan aman.
* **User Types:**
  * **Owner (Pemilik):** Pembeli gantungan kunci yang mengelola profil dan status barang.
  * **Finder (Penemu):** Orang yang melakukan scan QR saat menemukan barang.

---

## 2. Perbandingan Fitur (Tiering)

| Fitur | User Gratis (DIY - Digital Only) | User Premium (Physical Product) |
|-------|----------------------------------|---------------------------------|
| **Akses Dashboard** | Ya, terbatas pada 1-2 tag | Ya, tidak terbatas/sesuai pesanan |
| **Output QR Code** | Download file digital (PNG/PDF) | Produk fisik (Akrilik/Vinyl Premium) |
| **Halaman Profil** | Standar (Tanpa tanda verifikasi) | Verified Owner Badge (Emas/Biru) |
| **Kustomisasi** | Template desain standar | Bebas upload foto & desain kustom |
| **Notifikasi Scan** | Notifikasi via Dashboard/Email | Real-time WhatsApp Alert (Fonnte API) |
| **Tracking** | Estimasi lokasi berbasis IP | Estimasi lokasi + Izin GPS Presisi |
| **Daya Tahan** | Rendah (Tergantung cara cetak user) | Tinggi (Anti air, Anti pudar, UV Protected) |

---

## 3. Alur Aplikasi & Alur User

### Alur Aplikasi (Operational)

1. **Pemesanan:** User memesan melalui landing page.
2. **Generasi Tag:** Sistem membuat ID unik dan URL dinamis di database.
3. **Produksi:** Admin/Vendor mencetak QR Code pada gantungan kunci.
4. **Aktivasi:** User menerima barang, scan QR, dan melakukan klaim (registrasi) barang ke akun mereka.

### Alur User (Digital Journey)

1. **Login:** User masuk menggunakan WhatsApp OTP (Better Auth).
2. **Management:** User mengisi data kontak (WhatsApp, Pesan Khusus).
3. **Mode Toggle:** User mengubah status barang antara **Normal** atau **Hilang** melalui dashboard.
4. **Scanning:** Saat di-scan oleh penemu, sistem mengecek status di database dan menampilkan halaman profil yang sesuai.

---

## 4. Alur Konversi (Free to Premium Funnel)

1. **Acquisition:** User membuat akun gratis untuk mencoba sistem (misal: untuk wallpaper HP).
2. **Experience:** User merasakan kemudahan Dashboard dan simulasi scan.
3. **The Gap:** User menyadari label cetak sendiri mudah rusak dan tidak terlihat profesional.
4. **Upsell:** Di Dashboard user gratis, muncul tombol: *"Ubah Tag Digital ini menjadi Gantungan Kunci Akrilik Premium (Cuma Rp35rb)"*.
5. **Conversion:** User melakukan checkout karena data sudah terisi (tidak perlu input ulang).

---

## 5. Core Features (Fitur Utama)

* **Dynamic Redirection:** Mengarahkan satu QR Code ke berbagai aksi berdasarkan status di database.
* **Lost Mode Toggle:** Perubahan tampilan halaman profil secara *real-time* saat barang dinyatakan hilang.
* **WhatsApp Integration:** Tombol "Hubungi Pemilik" yang otomatis membuka chat WA dengan pesan *pre-filled*.
* **Privacy Masking:** Penemu tidak langsung melihat nomor HP di URL, melainkan melalui perantara tombol API WhatsApp.
* **Dashboard User:** Ruang bagi pemilik untuk mengelola banyak tag (jika punya lebih dari satu kunci).

---

## 6. Strategi "Verified Owner Badge"

Badge ini ditampilkan pada halaman publik yang di-scan oleh penemu (Finder):

* **Tujuan Trust:** Menyakinkan penemu bahwa pemilik adalah orang asli yang terverifikasi.
* **Tujuan Gengsi:** Memberikan kepuasan visual bagi pembeli produk fisik.
* **Tujuan Marketing:** Penemu barang yang melihat badge keren ini akan tertarik untuk memiliki sistem serupa (Finder-to-Buyer Loop).

---

## 7. Monetisasi (Revenue Streams)

1. **Direct Sales:** Penjualan satuan gantungan kunci dan stiker pack.
2. **Corporate/B2B:** Paket custom untuk sekolah (tag tas), komunitas motor, atau tour & travel.
3. **Premium Features (SaaS):** Biaya langganan kecil (misal Rp5rb/bulan) untuk fitur "Premium Tracking History" atau asuransi kehilangan.

---

## 8. Tech Stack

* **Framework:** Next.js 14/15 (App Router).
* **Database:** PostgreSQL via Supabase.
* **ORM:** Drizzle ORM (untuk manajemen skema dan query yang *type-safe*).
* **Authentication:** **Better Auth** (mendukung OTP WhatsApp/Email dan sesi yang aman).
* **Styling:** Tailwind CSS.
* **UI Components:** shadcn/ui (untuk *dashboard* dan *form* yang rapi).
* **QR Generator:** `qrcode.react` atau library serupa untuk *preview* di dashboard.

---

## 9. Database Schema (Drizzle ORM)

> **Catatan Penting:** Karena Supabase digunakan oleh aplikasi lain, semua tabel menggunakan prefix `balikin_` dan memiliki `app_id` bernilai `"balikin_id"`.

```typescript
// Schema untuk tabel Tags/Gantungan Kunci
export const balikin_tags = pgTable("balikin_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  appId: text("app_id").default("balikin_id").notNull(),
  slug: text("slug").unique().notNull(), // Contoh: "kunci-budi-01"
  ownerId: text("owner_id").references(() => users.id), // Relasi ke Better Auth
  name: text("name").notNull(), // Nama barang, misal: "Kunci Motor Nmax"
  status: text("status").default("normal").notNull(), // "normal" atau "lost"
  contactWhatsapp: text("contact_whatsapp"),
  customMessage: text("custom_message"),
  rewardNote: text("reward_note"), // Catatan imbalan jika ada
  tier: text("tier").default("free").notNull(), // "free" atau "premium"
  isVerified: boolean("is_verified").default(false), // Untuk Verified Owner Badge
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema untuk log Scan (Optional - untuk analytics)
export const balikin_scan_logs = pgTable("balikin_scan_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  appId: text("app_id").default("balikin_id").notNull(),
  tagId: uuid("tag_id").references(() => balikin_tags.id),
  scannedAt: timestamp("scanned_at").defaultNow(),
  deviceInfo: text("device_info"),
  ipAddress: text("ip_address"),
  city: text("city"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});
```

---

## 10. Aturan Khusus & Business Logic

1. **Privasi Data:**
   * Halaman profil tidak boleh menampilkan nomor HP dalam bentuk teks biasa untuk menghindari *web scraping*. Nomor hanya diletakkan di dalam fungsi `window.location.href` pada tombol "Hubungi".

2. **Unique Slug Logic:**
   * Setiap QR mengandung URL seperti `balikin.id/p/[slug]`. `slug` harus acak dan susah ditebak (misal: menggunakan `nanoid`) agar orang tidak bisa iseng mengganti URL untuk melihat data orang lain.

3. **Ownership Claim:**
   * Gantungan kunci yang baru dicetak berstatus "Unclaimed". Siapa pun yang pertama kali scan dan login akan menjadi pemilik sah tag tersebut.

4. **Lost Mode Logic:**
   * Jika `status === 'lost'`, maka halaman publik akan menampilkan warna merah mencolok, tombol hubungi pemilik di posisi paling atas, dan mengaktifkan deteksi lokasi kasar (IP based) untuk memberi tahu pemilik melalui email/WA bahwa barangnya baru saja di-scan.

---

## 11. Target Pengembangan MVP (Minimal Viable Product)

* **Digital:** Sistem registrasi (Better Auth), Dashboard Management, dan Public Profile Page.
* **Physical:** Template standar gantungan kunci akrilik yang siap diproduksi vendor.
* **Marketing:** Landing page yang menawarkan kedua opsi (Gratis vs Berbayar) secara transparan.
