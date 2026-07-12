# Fitur Aktivasi QR Code Stiker (Lembaran / Sheet)

## 1. Deskripsi Fitur

Fitur ini memfasilitasi aktivasi dan klaim kepemilikan untuk produk Stiker Balikin yang dijual dalam format lembaran (sheet). Satu lembar stiker terdiri dari beberapa QR Code (misal: 20 QR Code per lembar).

Untuk memberikan pengalaman pengguna (user experience) yang terbaik dan efisien, sistem menggunakan metode **Master Activation Key (Lazy Activation)**. Pengguna cukup memasukkan 1 Master PIN untuk mengaktifkan seluruh lembaran stiker secara otomatis pada saat stiker pertama kali digunakan.

## 2. Alur Pengguna (User Journey)

### A. Penggunaan & Aktivasi Pertama (Stiker ke-1)

1. **Pembelian**: Pengguna membeli 1 pack stiker isi 20 QR. Di dalam kemasan, terdapat selebaran berisi Master PIN (misal: 6-8 digit alfanumerik).
2. **Penempelan & Scan**: Pengguna menempelkan salah satu stiker ke barangnya (misal: Laptop), lalu melakukan scan QR code tersebut menggunakan smartphone.
3. **Deteksi Sistem**: Sistem membaca bahwa QR code ini berstatus `unlinked` dan lembaran stiker (sheet) terkait berstatus `inactive`.
4. **Halaman Aktivasi**: Sistem mengarahkan pengguna ke halaman aktivasi dan meminta pengguna memasukkan Master PIN yang ada di dalam kemasan.
5. **Validasi & Klaim**:
   - Pengguna memasukkan Master PIN.
   - Jika PIN valid, sistem mengubah status Lembaran Stiker menjadi `active` dan menetapkan pengguna tersebut sebagai pemilik (`owner_id`).
   - Sistem mengubah status QR code yang di-scan menjadi `linked`, lalu meminta pengguna memasukkan nama barang (misal: "Laptop Kerja").

### B. Penggunaan Stiker Selanjutnya (Stiker ke-2 s.d ke-20)

1. **Penempelan & Scan**: Pengguna menempelkan stiker ke-2 ke barang lain (misal: Helm), lalu melakukan scan QR-nya.
2. **Deteksi Otomatis (Tanpa PIN)**: Sistem mendeteksi bahwa QR ini terikat pada Lembaran Stiker yang sudah aktif dan dimiliki oleh pengguna yang sedang login tersebut.
3. **Bypass PIN**: Sistem melewati (bypass) form input PIN dan langsung menampilkan halaman pengisian nama barang (misal: "Helm NHK").
4. **Selesai**: Stiker ke-2 berhasil aktif secara instan.

## 3. Skema Database (Database Schema)

Untuk mendukung relasi antara 1 lembar stiker dengan banyak QR code satuan, diimplementasikan relasi One-to-Many antara tabel `sticker_sheets` dan `qr_tags`.

```typescript
// 1. Tabel Lembaran Stiker (Master Sheet)
export const stickerSheets = pgTable("sticker_sheets", {
  id: uuid("id").primaryKey().defaultRandom(),
  sheetCode: text("sheet_code").unique().notNull(),      // Kode internal/serial lembaran
  activationPin: text("activation_pin").notNull(),       // PIN aktivasi unik per lembar
  status: text("status").default("inactive").notNull(),  // 'inactive' | 'active'
  ownerId: uuid("owner_id").references(() => users.id),  // ID Pengguna pemilik lembar stiker
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Tabel QR Code Satuan (Stiker Fisik)
export const qrTags = pgTable("qr_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  qrCode: text("qr_code").unique().notNull(),             // String unik di dalam QR Code fisik
  sheetId: uuid("sheet_id").references(() => stickerSheets.id), // Relasi ke lembarannya
  itemName: text("item_name"),                            // Nama barang (diisi oleh user)
  status: text("status").default("unlinked").notNull(),  // 'unlinked' | 'linked'
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

## 4. Logika Validasi & Backend (Pseudo-code)

Ketika sebuah QR Code di-scan, backend harus memproses permintaan berdasarkan kondisi kepemilikan lembaran stiker:

```typescript
async function handleQrScan(scannedQrCode, currentUser) {
  // 1. Cari QR Tag beserta informasi Lembarannya
  const tag = await db.query.qrTags.findFirst({
    where: eq(qrTags.qrCode, scannedQrCode),
    with: { sheet: true }
  });

  if (!tag) {
    return { status: "ERROR", message: "QR Code tidak terdaftar." };
  }

  const sheet = tag.sheet;

  // SKENARIO A: QR sudah aktif & ditautkan ke barang (Normal Balikin flow)
  if (tag.status === "linked") {
    return {
      status: "FOUND_PAGE",
      message: "Tampilkan halaman Hubungi Pemilik",
      data: { ownerId: sheet.ownerId, itemName: tag.itemName }
    };
  }

  // SKENARIO B: QR belum aktif, dan Lembarannya juga belum diaktivasi oleh siapa pun
  if (tag.status === "unlinked" && sheet.status === "inactive") {
    return {
      status: "REQUIRE_ACTIVATION",
      message: "Minta user masukkan Master PIN untuk mengaktifkan lembar stiker.",
      data: { sheetId: sheet.id, tagId: tag.id }
    };
  }

  // SKENARIO C: QR belum aktif, tetapi Lembarannya SUDAH diaktivasi oleh user yang men-scan
  if (tag.status === "unlinked" && sheet.status === "active" && sheet.ownerId === currentUser.id) {
    return {
      status: "DIRECT_LINK",
      message: "Bypass PIN, langsung minta user mengisi nama barang.",
      data: { tagId: tag.id }
    };
  }

  // SKENARIO D: QR belum aktif, Lembaran sudah aktif tapi milik user LAIN
  if (tag.status === "unlinked" && sheet.status === "active" && sheet.ownerId !== currentUser.id) {
    return {
      status: "FORBIDDEN",
      message: "Stiker ini adalah bagian dari lembaran milik orang lain dan belum digunakan."
    };
  }
}
```

## 5. Keuntungan & Skenario Batasan (Edge Cases)

### Keuntungan Utama

- **UX Mulus**: Pengguna tidak merasa terbebani untuk melakukan aktivasi berulang-ulang.
- **Biaya Cetak Rendah**: PIN hanya perlu dicetak satu kali per kemasan, bukan satu PIN per stiker kecil yang akan menyulitkan layout desain stiker.

### Penanganan Kasus Khusus (Edge Cases)

**Bagaimana jika lembaran stiker dibeli patungan/dibagi ke orang lain?**

Sesuai rancangan dasar Strategi 1, satu lembar stiker akan terikat pada satu akun (`owner_id`). Jika stiker ingin dibagi-bagi ke anggota keluarga, seluruh anggota keluarga tersebut direkomendasikan untuk masuk menggunakan akun keluarga yang sama, atau stiker tersebut memang didedikasikan untuk satu penanggung jawab utama. (Jika ingin dibagi silang antar akun berbeda, harus menggunakan pendekatan Just-in-Time Activation / Strategi 3).

**Kehilangan Kartu PIN sebelum diaktivasi:**

Jika pengguna kehilangan selebaran PIN sebelum sempat mengaktifkan stiker pertama, mereka harus menghubungi CS Balikin untuk dibantu aktivasi manual menggunakan kode seri unik lembaran (`sheet_code`) yang dicetak kecil di pojok stiker sebagai bukti kepemilikan fisik.
