# Strategi Halaman Checkout Balikin Premium

Dokumen ini menyimpulkan rencana implementasi halaman checkout untuk aplikasi Balikin, yang dirancang untuk mengoptimalkan konversi penjualan, membangun database pemasaran (CRM) jangka panjang, serta mengamankan transaksi dari berbagai celah operasional dan keamanan.

---

## 1. Arsitektur Pengumpulan Data Pelanggan (CRM & Marketing Pipeline)

Halaman checkout dirancang tidak hanya untuk menyelesaikan transaksi, melainkan sebagai instrumen pengumpulan data (first-party data) yang sangat berharga untuk strategi pemasaran berkelanjutan.

### Data yang Dikumpulkan

| Field | Tipe | Status | Kegunaan |
|:--|:--|:--:|:--|
| Nama Lengkap | Text | Auto (dari sesi) | Identitas pembeli & invoice |
| Email | Email | Auto (dari sesi) | Retargeting Meta/Google Ads |
| Nomor WhatsApp | Phone | **Wajib** | Pengiriman resi, invoice, notifikasi keamanan |
| Segmentasi Pengguna | Dropdown | Wajib | CRM: Pribadi / Keluarga / Bisnis |

### Pemanfaatan Data Pasca-Pembayaran

**Meta & Google Ads Retargeting**
- Ekspor berkala data email dan nomor WhatsApp
- Mapping ke Custom Audiences dan Lookalike Audiences
- Tujuan: Menurunkan Customer Acquisition Cost (CAC)

**Automated CRM Engine**
- **H+3 pasca-pembelian**: Pengiriman WA otomatis untuk panduan aktivasi PIN fisik
- **H-30 sebelum expire**: Pengingat perpanjangan cloud murah (Rp 15.000/tahun) sebelum masa aktif WhatsApp Gateway habis

**B2B Sales Funnel**
- Memisahkan data pembeli kategori "Bisnis" ke pipeline penawaran kemitraan
- Fokus: Stiker custom logo usaha berskala besar

---

## 2. Penghitungan Ongkos Kirim & Sistem Kode Voucher

### Logistik Terintegrasi

**Titik Asal**: Gudang Hulu Sungai Selatan, Kalimantan Selatan

**Alamat Tujuan**: Cascading dropdown dinamis
```
Provinsi → Kota → Kecamatan
    ↓
API RajaOngkir / Biteship
    ↓
Kalkulasi ongkir real-time
```

### Sistem Voucher Fleksibel

Mendukung:
- **Potongan Tetap** (fixed): Diskon Rp X.XXX
- **Potongan Persen** (percentage): Diskon X% dari total
- **Limitasi**: Kuota penggunaan + tanggal kedaluwarsa

Tersimpan di tabel: `vouchers` (code, discount_type, discount_value, quota, used_count, expires_at)

### Kalkulasi Grand Total (Server-side Locking)

$$Grand\ Total = Base\ Price + Shipping\ Cost - Discount$$

**Penting**: Seluruh kalkulasi matematis akhir berjalan di sisi **Next.js backend** untuk mencegah manipulasi harga dari browser pengguna.

---

## 3. Prioritas Pembayaran QRIS Midtrans (UX Frictionless)

### Metode Pembayaran Utama

**CTA Tombol Tunggal**: Pembayaran instan QRIS
- GoPay
- ShopeePay
- E-wallet lokal lainnya

**Menu Sekunder** (accordion): Virtual Account bank & metode lain

### Webhook Sinkronisasi Instan

Setelah transaksi lunas, webhook Midtrans memicu:
1. Ubah status order → `settlement`
2. Buat PIN aktivasi unik
3. Antrekan orderan ke VDP Tool (admin gudang)

---

## 4. Solusi Keamanan & Operasional

Untuk memastikan sistem tidak mengalami kerugian finansial, kegagalan sistem, maupun kebocoran privasi, 4 pengaman teknis berikut **wajib diterapkan**:

```
                [PENGAMAN TRANSAKSI CHECKOUT]
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
  [Anti-Race          [Fallback          [Deep-Link
   Condition]         Ongkir]            Mobile]
  Kunci kuota         Biaya flat-rate    Bypass
  voucher lewat       jika API           screenshot
  kueri atomik.       logistik timeout.  QRIS.
```

### A. Pencegahan Kebocoran Voucher (Race Condition)

**Masalah**: Pembelian serentak berisiko membuat kuota voucher jebol melebihi batas karena keterlambatan update database.

**Solusi**: Validasi kuota digabung dalam satu kueri update **atomik PostgreSQL**:

```sql
UPDATE vouchers 
SET used_count = used_count + 1 
WHERE code = 'X' 
  AND used_count < quota;
```

Jika baris tidak berubah (0 rows affected) → sistem menolak diskon.

### B. Ketahanan Sistem Logistik (Try-Catch Fallback)

**Masalah**: API RajaOngkir/Biteship mengalami gangguan (down/timeout), menghentikan checkout total.

**Solusi**: 
- Timeout maksimal: **4 detik**
- Jika API tidak merespons → gunakan **Tarif Flat Cadangan**:
  - Regional Kalimantan Selatan: Rp 15.000
  - Luar Kalimantan: Rp 35.000

Transaksi tetap bisa diselesaikan.

### C. Optimalisasi Pembayaran di HP (Bypass Screenshot QRIS)

**Masalah**: Pengguna HP kesulitan scan QR Code yang tampil di layarnya sendiri.

**Solusi**: Midtrans Snap Redirect dengan deteksi perangkat dinamis
- **Desktop**: Tampilkan gambar QRIS
- **Mobile**: Tampilkan tombol deep-link ("Bayar via GoPay/ShopeePay")
  - Langsung buka aplikasi e-wallet (1 ketuk)

### D. Keamanan Data Pelanggan (UU PDP / Anti-Enumeration)

**Masalah**: ID pesanan berurutan membuat data nama, alamat, WA pembeli rentan di-enumerate.

**Solusi**:
- Format ID acak: **nanoid** (untuk `order_id`)
- Row Level Security (RLS) ketat di tabel `orders` Supabase
- Kebijakan: `auth.uid() == user_id`
- Hasil: Pembeli hanya bisa melihat pesanannya sendiri

---

## 5. Ringkasan Teknis

| Komponen | Teknologi | Keamanan |
|:--|:--|:--|
| **Database** | PostgreSQL (Supabase) | RLS (Row Level Security) |
| **Kalkulasi** | Next.js Server Actions | Server-side locking |
| **Pembayaran** | Midtrans QRIS | Webhook sinkronisasi |
| **Logistik** | RajaOngkir / Biteship | Fallback flat-rate |
| **ID Order** | Nanoid (acak) | Anti-enumeration |
| **Voucher** | Atomic SQL UPDATE | Anti-race condition |

---

## 6. Checklist Implementasi

- [ ] Setup cascading dropdown (Provinsi → Kota → Kecamatan)
- [ ] Integrasi API RajaOngkir / Biteship
- [ ] Implementasi Tarif Flat Cadangan dengan timeout 4 detik
- [ ] Konfigurasi Midtrans QRIS + webhook
- [ ] Deep-link mobile untuk e-wallet (GoPay, ShopeePay)
- [ ] Validasi voucher dengan SQL atomik
- [ ] Setup RLS di tabel `orders` (Supabase)
- [ ] Generate `order_id` menggunakan nanoid
- [ ] Automated WA trigger (H+3, H-30) via CRM engine
- [ ] Audit keamanan & penetration testing
