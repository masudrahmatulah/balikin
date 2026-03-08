Tentu, ini adalah **Blueprint Pengembangan Aplikasi "TraceTag"** (nama usulan) yang bisa Anda jadikan panduan teknis dan operasional.

---

## **1. Ringkasan Aplikasi (Executive Summary)**

**TraceTag** adalah platform *Smart Lost & Found* yang menggabungkan produk fisik (gantungan kunci) dengan ekosistem digital. Aplikasi ini memungkinkan pemilik barang mengelola informasi kontak mereka secara dinamis melalui QR Code tanpa harus mengganti unit fisik jika terjadi perubahan data.

* **Tujuan:** Memberikan rasa aman bagi pemilik kunci/barang berharga dan memudahkan penemu barang untuk menghubungi pemilik secara instan dan aman.
* **User:** * **Owner (Pemilik):** Pembeli gantungan kunci yang mengelola profil dan status barang.
* **Finder (Penemu):** Orang yang melakukan scan QR saat menemukan barang.



---

## **2. Alur Aplikasi & Alur User**

### **Alur Aplikasi (Operational)**

1. **Pemesanan:** User memesan melalui landing page.
2. **Generasi Tag:** Sistem membuat ID unik dan URL dinamis di database.
3. **Produksi:** Admin/Vendor mencetak QR Code pada gantungan kunci.
4. **Aktivasi:** User menerima barang, scan QR, dan melakukan klaim (registrasi) barang ke akun mereka.

### **Alur User (Digital Journey)**

1. **Login:** User masuk menggunakan WhatsApp OTP (Better Auth).
2. **Management:** User mengisi data kontak (WhatsApp, Pesan Khusus).
3. **Mode Toggle:** User mengubah status barang antara **Normal** atau **Hilang** melalui dashboard.
4. **Scanning:** Saat di-scan oleh penemu, sistem mengecek status di database dan menampilkan halaman profil yang sesuai.

---

## **3. Core Features (Fitur Utama)**

* **Dynamic Redirection:** Mengarahkan satu QR Code ke berbagai aksi berdasarkan status di database.
* **Lost Mode Toggle:** Perubahan tampilan halaman profil secara *real-time* saat barang dinyatakan hilang.
* **WhatsApp Integration:** Tombol "Hubungi Pemilik" yang otomatis membuka chat WA dengan pesan *pre-filled*.
* **Privacy Masking:** Penemu tidak langsung melihat nomor HP di URL, melainkan melalui perantara tombol API WhatsApp.
* **Dashboard User:** Ruang bagi pemilik untuk mengelola banyak tag (jika punya lebih dari satu kunci).

---

## **4. Tech Stack**

* **Framework:** Next.js 14/15 (App Router).
* **Database:** PostgreSQL via Supabase.
* **ORM:** Drizzle ORM (untuk manajemen skema dan query yang *type-safe*).
* **Authentication:** **Better Auth** (mendukung OTP WhatsApp/Email dan sesi yang aman).
* **Styling:** Tailwind CSS.
* **UI Components:** shadcn/ui (untuk *dashboard* dan *form* yang rapi).
* **QR Generator:** `qrcode.react` atau library serupa untuk *preview* di dashboard.

---

## **5. Database Schema (Drizzle ORM)**

Berikut adalah gambaran struktur tabel utama:

```typescript
// Schema untuk tabel Tags/Gantungan Kunci
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(), // Contoh: "kunci-budi-01"
  ownerId: text("owner_id").references(() => users.id), // Relasi ke Better Auth
  name: text("name").notNull(), // Nama barang, misal: "Kunci Motor Nmax"
  status: text("status").default("normal").notNull(), // "normal" atau "lost"
  contactWhatsapp: text("contact_whatsapp"),
  customMessage: text("custom_message"),
  rewardNote: text("reward_note"), // Catatan imbalan jika ada
  createdAt: timestamp("created_at").defaultNow(),
});

// Schema untuk log Scan (Optional - untuk analytics)
export const scanLogs = pgTable("scan_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tagId: uuid("tag_id").references(() => tags.id),
  scannedAt: timestamp("scanned_at").defaultNow(),
  deviceInfo: text("device_info"),
});

```

---

## **6. Aturan Khusus & Business Logic**

1. **Privasi Data:** * Halaman profil tidak boleh menampilkan nomor HP dalam bentuk teks biasa untuk menghindari *web scraping*. Nomor hanya diletakkan di dalam fungsi `window.location.href` pada tombol "Hubungi".
2. **Unique Slug Logic:**
* Setiap QR mengandung URL seperti `tracetag.id/p/[slug]`. `slug` harus acak dan susah ditebak (misal: menggunakan `nanoid`) agar orang tidak bisa iseng mengganti URL untuk melihat data orang lain.


3. **Ownership Claim:**
* Gantungan kunci yang baru dicetak berstatus "Unclaimed". Siapa pun yang pertama kali scan dan login akan menjadi pemilik sah tag tersebut.


4. **Lost Mode Logic:**
* Jika `status === 'lost'`, maka halaman publik akan menampilkan warna merah mencolok, tombol hubungi pemilik di posisi paling atas, dan mengaktifkan deteksi lokasi kasar (IP based) untuk memberi tahu pemilik melalui email/WA bahwa barangnya baru saja di-scan.



