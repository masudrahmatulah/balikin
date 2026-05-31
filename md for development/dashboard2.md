# Blueprint Desain Dashboard Admin - Balikin v1.0

Dokumen ini berisi panduan desain antarmuka (UI) dan pengalaman pengguna (UX) untuk sistem internal Balikin, yang dirancang menggunakan Next.js, Tailwind CSS, dan Shadcn UI.

---

## 1. Arsitektur Dashboard Utama

Dashboard menggunakan tata letak **Sidebar Navigation** dengan **Role-Based Access Control (RBAC)**. Artinya, menu yang muncul akan menyesuaikan dengan divisi staf yang login.

### Global Header

- **Search Bar Global**: Mampu mencari berdasarkan Email User, Nama, atau Nanoid Tag (12 Karakter).
- **WITA Clock**: Jam digital real-time (Asia/Makassar) untuk sinkronisasi jadwal pengiriman dan produksi.
- **Notification Bell**: Alert untuk pesanan baru atau barang berstatus "Lost" yang baru saja di-scan.

---

## 2. Divisi Produksi: "The Manufacturing Hub"

**Fokus**: Kecepatan akses data cetak, efisiensi batching, dan manajemen stok fisik.

### Fitur Utama

**Print Queue Manager (DataTable)**:
- Filter: Waiting to Print, In Production, Ready to Ship.
- Kolom: Tipe Produk (Akrilik/Vinyl), Bentuk (Circle/Rect), Ukuran, dan Preview QR.
- Action: Tombol "Download Print Asset" (PDF/PNG resolusi tinggi).

**Bulk QR Generator Module**:
- Input: Jumlah batch (Max 100), Prefix (misal: STUDENT-01).
- Output: Zip file berisi kumpulan QR Code dengan penamaan file sesuai ID nanoid.

**Stock Status Indicator**:
- Progress bar yang menunjukkan jumlah QR yang sudah diproduksi vs yang sudah diklaim oleh user.

### Desain Element

- Menggunakan Badge berwarna oranye untuk status In Production dan hijau untuk Ready.
- Tombol "Bulk Update" untuk mengubah status 50 pesanan sekaligus menjadi Shipped.

---

## 3. Divisi Customer Service (CS): "The Support Center"

**Fokus**: Validasi transaksi, lookup data cepat, dan mitigasi masalah user.

### Fitur Utama

**Payment Verification Wall**:
- Tampilan kartu (Card View) berisi bukti transfer (Image Preview) dari user.
- Tombol "Approve" (otomatis mengirim pesan WA via Fonnte) atau "Reject" (dengan template alasan).

**User 360 View**:
- Halaman detail user yang menampilkan semua tag yang dimiliki.
- Emergency Toggle: CS bisa mengaktifkan "Lost Mode" secara manual jika user kehilangan akses akun.

**WhatsApp Quick-Link**:
- Integrasi tombol "Chat Owner" yang langsung membuka WhatsApp Web dengan nomor user yang terdaftar.

### Desain Element

- Menggunakan Dialog (Modal) untuk menampilkan foto bukti pembayaran berukuran besar tanpa meninggalkan halaman tabel.
- Input Search dengan fitur debounce untuk pencarian instan.

---

## 4. Divisi Marketing: "The Growth & Analytics Lab"

**Fokus**: Monitoring konversi, retensi user, dan efektivitas modul premium.

### Fitur Utama

**Conversion Funnel Chart**:
- Visualisasi: Berapa banyak user gratis (Free Tier) yang mengklik iklan premium di dashboard mereka.
- Metric: Conversion Rate dari scan digital ke pembelian fisik.

**Module Performance Analytics**:
- Ranking modul yang paling sering diaktivasi (Contoh: Student Kit menduduki 60% aktivasi).
- Data ini digunakan untuk menentukan arah promo bundle berikutnya.

**Finder-to-Buyer Loop Tracker**:
- Statistik unik: Berapa banyak orang yang awalnya men-scan barang hilang (Finder) akhirnya mendaftar menjadi pengguna Balikin.

### Desain Element

- Menggunakan Charts (Recharts atau Chart.js) dengan warna brand Balikin.
- Tabs untuk memisahkan laporan harian, mingguan, dan bulanan.

---

## 5. Komponen Shadcn UI yang Direkomendasikan

| Komponen | Implementasi di Admin Balikin |
|----------|------------------------------|
| DataTable | Standar utama untuk list Clients, Tags, dan Orders. |
| Tabs | Berpindah antar kategori Modul (Student, Otomotif, dsb). |
| Switch | Mengaktifkan/Mematikan fitur spesifik pada Tag tertentu. |
| Alert Dialog | Konfirmasi kritis saat hendak menghapus data Client atau Tag. |
| Sheet | Menampilkan log scan detail dari samping (side-drawer) saat klik satu Tag. |
| Breadcrumb | Navigasi hierarki: Admin > Client Management > Detail User > Tag ID. |

---

## 6. Business Logic & Security untuk Admin

- **Audit Log**: Setiap aksi admin (ubah status, hapus tag) harus tercatat: Siapa, Melakukan Apa, Kapan.
- **Privacy Masking**: Admin CS hanya bisa melihat 4 digit terakhir nomor HP user demi keamanan data, kecuali saat klik tombol "Buka Kontak".
- **Auto-Refresh**: Tabel Lost Items melakukan polling setiap 60 detik untuk memastikan CS selalu mendapatkan info terbaru jika ada laporan kehilangan.

---

## 7. Saran Workflow Produksi (WITA Timezone)

Karena operasional menggunakan WITA, sistem pengingat produksi harus diatur:

- **08:00 WITA**: Auto-generate laporan pesanan masuk semalam.
- **14:00 WITA**: Deadline "Daily Pick-up" ekspedisi; sistem memberikan peringatan bagi pesanan yang statusnya masih In Production tapi harus dikirim hari ini.

---

*Dibuat untuk pengembangan sistem internal Balikin - Smart Lost & Found.*
