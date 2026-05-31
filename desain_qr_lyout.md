# Product Requirement Document (PRD)

## Modul PDF Generator — Balikin QR Tag (Cut & Fold)

---

### 1. Ringkasan Produk (Overview)
Modul ini berfungsi untuk menghasilkan dokumen PDF siap cetak berukuran A4 yang berisi lembaran *smart tag* QR untuk proyek **Balikin**. Dokumen dirancang menggunakan metode *Cut & Fold* (lipat dua sisi secara horizontal) agar pas saat dimasukkan ke dalam wadah akrilik fisik bertipe **Portrait** dengan ukuran **3 cm (lebar) x 3,7 cm (tinggi)**.

---

### 2. Spesifikasi Geometri & Desain Fisik
Untuk memastikan hasil cetak presisi dan muat ke dalam akrilik portrait, kalkulasi ukuran wajib menggunakan satuan milimeter ($mm$):

* **Ukuran Sisi Tunggal (Setelah Dilipat):** Lebar $30\,\text{mm}$ x Tinggi $37\,\text{mm}$
* **Total Ukuran Bentangan (Sebelum Dilipat):** Lebar $60\,\text{mm}$ x Tinggi $37\,\text{mm}$
* **Arah Lipatan:** Horizontal (Kiri ke Kanan)
* **Komponen Visual per Tag:**
  * **Sisi Kiri (Depan / Face):** Tempat QR Code berukuran besar dan teks instruksi penemu.
  * **Sisi Kanan (Belakang / Back):** Branding utama aplikasi *Balikin*.
  * **Garis Potong (*Cutting Mark*):** Garis solid tipis ($0.2\,\text{pt}$, warna abu-abu) di sekeliling area luar $60 \times 37\,\text{mm}$.
  * **Garis Lipat (*Folding Mark*):** Garis putus-putus (*dashed line*) vertikal tepat di tengah (titik milimeter ke-30 dari kiri).

---

### 3. Tata Letak Sisi Depan (Kiri) & Distribusi Ruang
Sisi depan dirancang sepadat mungkin agar QR mudah dipindai namun tetap informatif:

* **Ukuran QR Code:** Persegi $27\,\text{mm} \times 27\,\text{mm}$
* **Distribusi Ruang Horizontal (Lebar $30\,\text{mm}$):**
  * Sisa ruang total: $3\,\text{mm}$ ($30\,\text{mm} - 27\,\text{mm}$).
  * Diposisikan di tengah (*center*), menghasilkan margin kiri $1.5\,\text{mm}$ dan margin kanan $1.5\,\text{mm}$ (efek *borderless*).
* **Distribusi Ruang Vertikal (Tinggi $37\,\text{mm}$):**
  * Sisa ruang total: $10\,\text{mm}$ ($37\,\text{mm} - 27\,\text{mm}$).
  * *Margin Atas:* $2\,\text{mm}$ (jarak aman dari tepi atas akrilik).
  * *Area QR Code:* $27\,\text{mm}$.
  * *Sisa Area Teks (Bawah):* $8\,\text{mm}$ bersih.

#### Spesifikasi Teks Komunikatif (Di dalam area $8\,\text{mm}$ bawah QR):
* **Baris 1:** `BANTU BALIKIN BARANG INI` (Font $7.5\,\text{pt}$, Bold, uppercase)
* **Baris 2:** `Scan QR & Hubungi Pemiliknya` (Font $6.5\,\text{pt}$, Reguler/Muted)
* **Tujuan Psikologis:** Memanfaatkan nama branding untuk memperkuat *awareness* aplikasi **Balikin**, sekaligus memicu empati penemu barang agar segera memindai tag.

---

### 4. Tata Letak Grid Pada Kertas A4
Mengoptimalkan area cetak kertas A4 ($210\,\text{mm} \times 297\,\text{mm}$):

* **Margin Halaman:** Atas/Bawah/Kiri/Kanan ditentukan sebesar $10\,\text{mm}$
* **Konfigurasi Grid:** 
  * **3 Kolom** secara horizontal ($(3 \times 60\,\text{mm}) = 180\,\text{mm}$ + *gap*)
  * **7 Baris** secara vertikal ($(7 \times 37\,\text{mm}) = 259\,\text{mm}$ + *gap*)
  * *Total Tag per Halaman: 21 pcs*
* **Jarak Antar Tag (Gap):** $4\,\text{mm}$ sebagai ruang potong aman menggunakan gunting atau *cutter*.

---

### 5. Kebutuhan Teknis (Tech Stack)
* **Framework:** Next.js (App/Pages Router)
* **Library PDF:** `@react-pdf/renderer`
* **Database Input:** Supabase (array data berisi `id` dan `qrUrl`)
* **Struktur Komponen:**

```typescript
interface TagItem {
  id: string;
  qrUrl: string;
}