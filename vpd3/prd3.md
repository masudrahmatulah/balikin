# PRD & Spesifikasi Teknis (V2): Sistem Aktivasi Aman & VDP Adaptif (BALIKIN)

Dokumen ini merupakan pembaruan komprehensif (v2) dari spesifikasi sistem Balikin setelah melalui audit keamanan, fungsionalitas, privasi, dan ketahanan fisik. Gunakan dokumen ini sebagai acuan mutlak dalam pengembangan perangkat lunak dan proses produksi fisik.

---

## PART 1: PRODUCT REQUIREMENT DOCUMENT (PRD)

### 1. Masalah & Solusi yang Disempurnakan

#### A. Claim Hijacking & Keamanan Token Visual

**Masalah**: QR Aktivasi di buku manual berisiko di-scan secara tidak sah (misal menggunakan lensa zoom dari luar kemasan transparan) sebelum unboxing dilakukan.

**Solusi**:
- **Keamanan Fisik**: Buku manual/brosur panduan wajib dilipat dan direkatkan menggunakan segel lem fisik (seperti amplop PIN ATM bank). QR Aktivasi dan PIN diletakkan di bagian dalam lipatan tertutup.
- **Hash Token**: Token aktivasi di database tidak boleh disimpan dalam format teks polos (plain text), melainkan harus melalui enkripsi satu arah (SHA-256).

#### B. Kegagalan Scan Fisik (Kerusakan QR)

**Masalah**: QR Aktivasi di kertas manual fotokopi berisiko luntur, basah, atau sobek, sehingga pembeli asli gagal men-scan.

**Solusi**: Sistem menyediakan fitur **Manual PIN Fallback**. Di bawah QR Aktivasi di Kolom 3, dicetak kode unik alfanumerik pendek yang mudah dibaca (Contoh: `PIN: 9A3-K82`). Pembeli dapat mengetik kode ini secara manual di halaman aktivasi jika proses scan QR gagal.

#### C. Perlindungan Privasi & Penyalahgunaan Chat (Spam Shield)

**Masalah**: Penemu barang anonim berpotensi melakukan spamming, teror, atau pengiriman pesan kasar kepada pemilik barang.

**Solusi**:
- **Rate Limiting**: Batasi maksimal 5 pesan per menit untuk pengguna anonim di ruang chat.
- **Blokir Instan (Block/Report)**: Pemilik memiliki tombol kontrol untuk menutup ruang chat dan memblokir sesi penemu secara sepihak.
- **Sensor Teks**: Otomatisasi penyaringan kata kunci kasar/tautan mencurigakan di sisi server sebelum diteruskan ke pemilik.

#### D. Kegagalan Notifikasi di Sisi Pemilik

**Masalah**: Notifikasi PWA seringkali terhambat oleh kebijakan sistem operasi HP pemilik (mode hemat baterai, pemblokiran browser, iOS versi lama).

**Solusi (Sistem Notifikasi Berlapis)**:
- **Detik 1 - 30**: Sistem mengirim notifikasi instan melalui PWA Push Notification.
- **Menit ke-2** (Jika pesan belum dibaca/dibuka): Sistem secara otomatis mengirimkan notifikasi cadangan via WhatsApp API (Fonnte/Whacenter):
  > "🚨 Balikin Alert! Seseorang men-scan barang Anda (Seri B01-042) dan mengirim pesan anonim. Balas di sini: [Link_Chat]"

#### E. Ketahanan Fisik Gantungan Kunci

**Masalah**: Stiker lipat di bagian luar akrilik cepat baret dan terkelupas akibat gesekan kunci logam di dalam saku celana.

**Solusi**: Gantungan kunci diproduksi menggunakan **Metode Sandwich Acrylic** (stiker diletakkan di bagian dalam di antara dua keping akrilik bening yang disatukan secara permanen). Ini melindungi stiker 100% dari baret, air, dan gesekan fisik luar.

#### F. Adaptabilitas Layout Cetak (VDP)

**Masalah**: Pesanan kustom foto (Custom Order) tidak memerlukan lembar QR Aktivasi (karena pre-activated). Menyertakan Kolom 3 hanya akan membingungkan pembeli dan membuang-buang bahan kertas.

**Solusi**: VDP Tool harus menghasilkan layout dinamis berdasarkan parameter `is_custom`:
- `is_custom: false` (Massal) → Output 3 Kolom (QR Utama + Logo + QR Aktivasi)
- `is_custom: true` (Kustom) → Output 2 Kolom (QR Utama + Foto Kustom milik user)

---

### 2. Alur Pengguna (Revised User Flows)

#### A. Alur Aktivasi Berhasil (Dengan PIN Fallback)

```
[Unboxing Box] ──> [Buka Segel Amplop Manual] ──> [Pilih Metode]
                                                        │
                         ┌──────────────────────────────┴──────────────────────────────┐
                         ▼ (Opsi 1)                                                    ▼ (Opsi 2)
                 [Scan QR Aktivasi]                                            [Ketik PIN Manual di Web]
                         │                                                             │
                         └──────────────────────────────┬──────────────────────────────┘
                                                        ▼
                                          [Sistem Validasi Database]
                                                        │
                                                        ▼
                                             [Klaim Hak Milik Sukses]
```

---

## PART 2: TECHNICAL SPECIFICATION (TECH SPEC)

### 1. Skema Database yang Diperbarui (Drizzle ORM & Postgres)

Tabel `tags` dan tabel `chat` disesuaikan untuk mengakomodasi token hash, PIN manual, serta kebutuhan optimalisasi ruang server.

```typescript
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

// Tabel Utama Aset / Gantungan Kunci
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  ownerId: text("owner_id").references(() => users.id), // Null jika belum diaktifkan
  productSlug: text("product_slug").unique().notNull(), // URL Publik penemu
  activationTokenHash: text("activation_token_hash").notNull(), // SHA-256 hash untuk QR Aktivasi
  activationPinHash: text("activation_pin_hash").notNull(), // SHA-256 hash untuk PIN manual
  activationPinPlain: text("activation_pin_plain").notNull(), // PIN polos tersensor untuk buku manual (VDP)
  serialNumber: text("serial_number").notNull(), // Kode fisik QC (e.g., "B01-042")
  status: text("status").default("unclaimed").notNull(), // 'unclaimed' | 'claimed' | 'lost'
  isCustom: boolean("is_custom").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabel Manajemen Sesi Chat Anonim
export const chatRooms = pgTable("chat_rooms", {
  id: uuid("id").primaryKey().defaultRandom(),
  tagId: uuid("tag_id").references(() => tags.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Tabel Riwayat Pesan Chat
export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  roomId: uuid("room_id").references(() => chatRooms.id).notNull(),
  senderType: text("sender_type").notNull(), // 'owner' | 'finder'
  messageText: text("message_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

---

### 2. Logika VDP Adaptif & Kalkulasi Grid Kertas

#### A. Spesifikasi Dimensi Satuan Paket Cetak (Untuk `is_custom: false`)

Setiap baris cetak horizontal terdiri dari **9 Kolom Berdempetan** (mengakomodasi 2 paket stiker sekaligus) dengan dimensi total **180 × 45 mm**.

```
         TOTAL LEBAR BARIS CETAK: 180 mm (Tinggi: 45 mm)
+-----------------------+-----------------------+
|  PAKET 1 (Seri A)     |  PAKET 2 (Seri B)     |
|  Lebar: 90 mm         |  Lebar: 90 mm         |
+---+---+---------------+---+---+---------------+
| K1| K2| K3 (Aktivasi) | K4| K5| K6 (Aktivasi) |
|QR |Lgo| QR + PIN      |QR |Lgo| QR + PIN      |
+---+---+---------------+---+---+---------------+
```

- **Kolom 1 & 4 (QR Utama)**: 30 × 45 mm (Portrait)
- **Kolom 2 & 5 (Logo Balikin)**: 30 × 45 mm (Portrait)
- **Kolom 3 & 6 (Stiker Aktivasi)**: 30 × 45 mm (Portrait) → Berisi gambar QR Aktivasi di tengah (22 × 22 mm), teks "SCAN UNTUK AKTIVASI" di bagian atas, dan teks PIN polos serta nomor seri mikro di bagian paling bawah.

#### B. Rumus Grid Kertas A3 (297 × 420 mm) - Posisi Landscape

- **Margin Aman**: 10 mm di setiap sisi luar kertas
- **Jeda Jarak Pemotongan (Gap)**: 2 mm secara horizontal dan vertikal

**Lebar Cetak Bersih**: 420 mm - 20 mm = **400 mm**  
**Tinggi Cetak Bersih**: 297 mm - 20 mm = **277 mm**

**Kalkulasi kapasitas maksimal baris dan kolom paket**:

- **Kapasitas Kolom Horizontal (Col_max)**:
  ```
  Col_max = ⌊ 400 mm / (90 mm + 2 mm) ⌋ = 4 Kolom Paket
  ```

- **Kapasitas Baris Vertikal (Row_max)**:
  ```
  Row_max = ⌊ 277 mm / (45 mm + 2 mm) ⌋ = 5 Baris (Rows)
  ```

- **Total Output Matang Lembar A3**: 4 × 5 = **20 Paket Stiker Lengkap** per lembar (total 60 stiker individual simetris).

---

### 3. API Aktivasi Aman dengan Token Enkripsi & PIN (Next.js Server Actions)

Sistem memverifikasi integritas aktivasi menggunakan enkripsi SHA-256 untuk memastikan kecocokan token fisik.

```typescript
// app/actions/activate.ts
"use server";

import { db } from "@/db";
import { tags } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import crypto from "crypto";

// Fungsi pembantu untuk enkripsi SHA-256
function hashValue(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export async function processActivation(userId: string, data: { slug: string; tokenOrPin: string }) {
  const hashInput = hashValue(data.tokenOrPin.trim().toUpperCase());

  // Cari tag yang cocok dengan SHA-256 hash di database (Bisa menggunakan Token atau PIN)
  const tag = await db.query.tags.findFirst({
    where: and(
      eq(tags.productSlug, data.slug),
      eq(tags.status, "unclaimed")
    ),
  });

  if (!tag) {
    return { success: false, error: "Aset tidak ditemukan atau sudah diaktifkan." };
  }

  // Validasi kecocokan hash token dari QR ATAU hash PIN dari input manual
  const isValid = tag.activationTokenHash === hashInput || tag.activationPinHash === hashInput;

  if (!isValid) {
    return { success: false, error: "Kode Aktivasi atau PIN tidak cocok. Silakan coba lagi." };
  }

  // Update kepemilikan tag
  await db.update(tags)
    .set({
      ownerId: userId,
      status: "claimed"
    })
    .where(eq(tags.id, tag.id));

  return { success: true, serialNumber: tag.serialNumber };
}
```

---

### 4. Manajemen Chat Anonim & Sistem Keamanan (Anti-Spam)

#### A. Kontrol Rate Limiting & Filter Spam di Sisi Server

Setiap pengiriman pesan anonim harus melewati validasi di Server Action untuk memblokir kata-kata kotor dan spam.

```typescript
// app/actions/send-message.ts
"use server";

import { db } from "@/db";
import { messages, chatRooms } from "@/db/schema";
import { and, eq, gte } from "drizzle-orm";

const SENSOR_WORDS = ["anjing", "kasar", "bangsat", "scamlink", "penipu"]; // Ganti dengan daftar kamus yang lengkap

export async function sendMessage(roomId: string, senderType: "owner" | "finder", text: string) {
  // 1. Validasi Status Room Chat
  const room = await db.query.chatRooms.findFirst({
    where: eq(chatRooms.id, roomId),
  });

  if (!room || !room.isActive) {
    return { success: false, error: "Ruang obrolan sudah ditutup oleh pemilik." };
  }

  // 2. Sensor Filter Kata-kata Kasar/Spam
  const isSpam = SENSOR_WORDS.some(word => text.toLowerCase().includes(word));
  if (isSpam) {
    return { success: false, error: "Pesan Anda diblokir karena mengandung konten tidak pantas." };
  }

  // 3. Rate Limiting untuk Pengguna Anonim (Finder)
  if (senderType === "finder") {
    const oneMinuteAgo = new Date(Date.now() - 60000);
    const recentMessages = await db.query.messages.findMany({
      where: and(
        eq(messages.roomId, roomId),
        eq(messages.senderType, "finder"),
        gte(messages.createdAt, oneMinuteAgo)
      )
    });

    if (recentMessages.length >= 5) {
      return { success: false, error: "Batas pengiriman pesan terlampaui. Tunggu 1 menit." };
    }
  }

  // 4. Simpan Pesan ke Database
  await db.insert(messages).values({
    roomId,
    senderType,
    messageText: text,
  });

  return { success: true };
}
```

#### B. Database Cleanup Otomatis (Supabase PgCron)

Untuk mencegah pembengkakan ukuran database (Database Bloat) akibat tumpukan pesan sampah dari obrolan anonim, jalankan SQL query ini di Editor SQL Supabase untuk menghapus riwayat obrolan yang usianya sudah melewati 48 jam secara berkala setiap tengah malam.

```sql
-- Aktifkan ekstensi cron jika belum aktif
create extension if not exists pg_cron;

-- Jadwalkan fungsi pembersihan otomatis setiap hari pada pukul 00:00 UTC
select cron.schedule(
  'cleanup-expired-chats',
  '0 0 * * *',
  $$
    -- Hapus pesan di dalam room chat yang tidak aktif atau berumur > 48 jam
    delete from messages
    where room_id in (
      select id from chat_rooms
      where created_at < now() - interval '2 days'
    );

    -- Hapus entri room chat yang berumur > 48 jam
    delete from chat_rooms
    where created_at < now() - interval '2 days';
  $$
);
```

---

*End of Document*
