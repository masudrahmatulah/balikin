# Spesifikasi Teknis & UI/UX Dashboard Admin Balikin

## 1. Pendahuluan

Dokumen ini merinci struktur navigasi, pengelompokan fitur, dan kontrol akses (RBAC) untuk Dashboard Internal Balikin. Dashboard ini berfungsi sebagai pusat kendali operasional yang memadukan manajemen aset digital (QR Codes) dengan aset fisik (Stiker/Akrilik).

## 2. Arsitektur Navigasi (Sidebar)

Navigasi akan dikelompokkan berdasarkan fungsi departemen untuk meminimalkan gangguan kognitif bagi admin.

### A. Modul: Overview (General)

**Tujuan:** Memberikan gambaran kesehatan ekosistem Balikin secara real-time.

#### Dashboard Summary
Widget angka besar untuk:
- Total Tag Aktif (Total klaim)
- Laporan Barang Hilang (Status: Open vs Resolved)
- Total Pendapatan (Harian/Bulanan)
- Stok Material Kritis (Alert jika stok akrilik menipis)

### B. Modul: Inventory & Production

**Tujuan:** Mengelola siklus hidup produk fisik dari pembuatan hingga siap kirim.

#### Generate New Tags (VDP Tool)
- Form input untuk jumlah batch (misal: 1000 pcs)
- Pemilihan tipe (Stiker/Akrilik)
- Button "Generate & Export" (Output: ZIP berisi individual QR atau PDF Grid siap cetak)

#### Print Queue (Antrean Cetak)
- Daftar batch yang baru di-generate
- Status: Pending, Printing, Quality Check, Ready for Stock

#### Material Logs (Manajemen Stok)
- Monitoring lembaran Akrilik dan roll Vinyl
- Log penggunaan material per batch produksi

### C. Modul: Sales & Orders

**Tujuan:** Memastikan cashflow lancar dan pengiriman tepat waktu.

#### Incoming Orders
- Filter berdasarkan metode pembayaran
- Notifikasi pesanan baru yang membutuhkan verifikasi manual (jika ada)

#### Shipping Status (Logistik)
- Integrasi API kurir (misal: JNE/Sicepat)
- Bulk Update Resi (Upload CSV untuk input resi massal)

### D. Modul: User Management

**Tujuan:** Moderasi komunitas dan manajemen tier akun.

#### Tier Management
- Daftar user dengan filter Free vs Premium (Gold Badge)
- Tool untuk upgrade manual (misal: untuk kemitraan atau influencer)

#### Suspension Tool
- Fitur "Blacklist" untuk User ID atau Device ID yang terindikasi melakukan penipuan/spam
- Audit Log: Catatan alasan kenapa user tersebut diblokir

## 3. Matriks Akses Peran (RBAC)

| Modul / Fitur | Super Admin | Admin Produksi | Admin Sales | Admin CS |
|--------------|-------------|----------------|-------------|----------|
| Overview (Stats) | Full Access | Ringkasan Produksi | Ringkasan Sales | Ringkasan User |
| VDP Tool | View/Edit | Full Access | No Access | No Access |
| Material Logs | View/Edit | Full Access | View Only | No Access |
| Incoming Orders | Full Access | No Access | Full Access | View Only |
| Shipping/Resi | Full Access | View Only | Full Access | View Only |
| User Data (PII) | Full Access | No Access | No Access | Masked View |
| Suspension Tool | Full Access | No Access | No Access | Full Access |

## 4. Standar UI & Interaksi

### Dasar Desain
- **Layout:** Sidebar (Fixed) dengan Topbar (Breadcrumbs & User Profile)
- **Warna Utama:** #FFD700 (Balikin Gold) untuk aksen, dengan latar belakang Dark Mode untuk kesan teknologi tinggi atau Light Mode bersih untuk operasional
- **Tipografi:** Sans-serif (Inter atau Roboto) untuk keterbacaan data tabel yang tinggi

### Fitur UX Kunci
- **Data Masking:** Nomor telepon user pada modul CS disembunyikan (0812-****-1234) dan hanya bisa dibuka jika admin mengklik tombol "Lihat Nomor" (tercatat di log)
- **Bulk Actions:** Kemampuan untuk mencentang banyak order dan mengubah statusnya sekaligus
- **Real-time Updates:** Menggunakan Supabase Realtime untuk dashboard Overview sehingga angka berubah tanpa perlu refresh halaman

## 5. Alur Kerja VDP (Variable Data Printing)

Untuk efisiensi, modul Produksi mengikuti alur berikut:

1. Admin menekan "Generate Batch"
2. Sistem membuat UUID unik di tabel tags dengan status unclaimed
3. Server memicu Worker untuk membuat file PDF layout cetak sesuai ukuran material (misal: 1 lembar A3 berisi 50 stiker)
4. Admin mengunduh PDF dan mengirimkannya ke mesin cetak/laser cut

## 6. Audit & Log Keamanan

Setiap tindakan "penghapusan" atau "perubahan status pesanan" harus menyimpan data:

- **admin_id:** Siapa yang melakukan
- **timestamp:** Kapan dilakukan
- **original_value vs new_value:** Apa yang diubah
- **ip_address:** Lokasi akses admin
