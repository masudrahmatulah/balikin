# Panduan Content Strategy Balikin

Panduan ini menjelaskan cara menggunakan Content Strategy Planner untuk merencanakan, membuat, dan menerbitkan artikel SEO Balikin.

## Tujuan

Content Strategy Planner digunakan untuk:

- Menyusun topic cluster.
- Membagi artikel menjadi pillar, supporting, dan commercial.
- Menentukan focus keyword setiap artikel.
- Mengatur status produksi artikel.
- Membuat draft artikel dengan AI berdasarkan rencana yang dipilih.
- Menjaga hubungan internal link antara artikel utama dan artikel pendukung.

## Akses Halaman

1. Login sebagai admin.
2. Buka menu **Content Strategy** di sidebar admin.
3. Atau buka URL berikut:

```text
/admin/blog/strategy
```

Halaman ini berada di dalam area admin dan membutuhkan autentikasi admin.

## Struktur Content Strategy

### Topic Cluster

Topic cluster adalah kelompok topik besar yang membahas satu tema utama.

Contoh cluster:

- Barang Hilang dan Ditemukan
- QR Smart Tag
- Koper dan Traveling
- Motor, Mobil, dan Kunci
- Pelajar dan Anak
- Hewan Peliharaan

### Pillar Article

Pillar adalah artikel utama yang membahas satu topik secara komprehensif.

Contoh:

```text
Panduan Lengkap Mengatasi Barang Hilang dan Ditemukan
```

Satu cluster idealnya memiliki satu pillar utama.

### Supporting Article

Supporting article membahas subtopik yang lebih spesifik dan mengarah ke pillar.

Contoh:

```text
Cara Melacak Barang Hilang dengan Langkah yang Benar
Apa yang Harus Dilakukan Saat Dompet Hilang?
Cara Meningkatkan Peluang Barang Hilang Kembali
```

### Commercial Article

Commercial article memiliki search intent yang lebih dekat dengan pembelian atau penggunaan produk.

Contoh:

```text
Beli QR Smart Tag untuk Perlindungan Barang
QR Tag Koper untuk Perjalanan Aman
```

Artikel jenis ini boleh mengarahkan pembaca ke halaman produk Balikin secara natural.

## Seed 60 Artikel

Jika database Content Strategy masih kosong, halaman akan menampilkan tombol:

```text
Seed 60 Artikel
```

Klik tombol tersebut satu kali untuk membuat rencana awal:

- 6 topic cluster.
- 6 pillar article.
- 48 supporting article.
- 6 commercial article.
- Total 60 rencana artikel.

Seed hanya dapat digunakan ketika belum ada cluster. Jika data sudah tersedia, tombol tidak dapat digunakan kembali untuk mencegah duplikasi.

## Membuat Cluster Manual

Gunakan tombol **Cluster** untuk menambah cluster baru.

Isi field berikut:

- **Nama cluster**: nama topik yang mudah dipahami.
- **Slug**: format URL sederhana dengan huruf kecil dan tanda hubung.
- **Keyword utama**: keyword utama cluster.
- **Deskripsi**: penjelasan singkat cakupan cluster.

Contoh:

```text
Nama cluster: Keamanan Tas dan Dompet
Slug: keamanan-tas-dompet
Keyword utama: keamanan tas dan dompet
```

## Membuat Rencana Artikel Manual

Gunakan tombol **Rencana Artikel**.

Isi field berikut:

- **Cluster**: topic cluster induk.
- **Judul artikel**: judul yang sesuai search intent.
- **Focus keyword**: satu keyword utama.
- **Tipe artikel**: pillar, supporting, atau commercial.
- **Target kata**: otomatis mengikuti tipe artikel dan dapat disesuaikan.
- **Brief artikel**: arahan isi artikel.

Focus keyword sebaiknya berupa frasa yang benar-benar digunakan calon pembaca, bukan kumpulan keyword yang terlalu panjang.

## Target Jumlah Kata

Target kata mengikuti jenis artikel:

| Jenis artikel | Target kata |
|---|---:|
| Pillar | 2.000-2.500 kata |
| Supporting | 800-1.500 kata |
| Commercial | 700-1.200 kata |

Minimum kata wajib terpenuhi sebelum artikel dari content plan dapat diterbitkan atau dijadwalkan. Batas maksimum berfungsi sebagai panduan editorial, bukan pemblokir, agar artikel yang membutuhkan pembahasan lebih lengkap tetap dapat diterbitkan.

## Status Workflow

Setiap rencana artikel memiliki status produksi:

| Status | Keterangan |
|---|---|
| `planned` | Rencana sudah dibuat tetapi belum dikerjakan. |
| `brief_ready` | Brief artikel sudah siap. |
| `ai_drafted` | Draft sudah dibuat dengan AI. |
| `review` | Draft sedang diperiksa editor. |
| `seo_ready` | Artikel sudah memenuhi pemeriksaan SEO. |
| `scheduled` | Artikel sudah dijadwalkan. |
| `published` | Artikel sudah diterbitkan. |

Status dapat diubah langsung melalui dropdown pada tabel Editorial Roadmap.

## Membuat Draft dengan AI

1. Pilih rencana dengan status `Planned`.
2. Klik **Generate Draft**.
3. Sistem membuka editor artikel baru.
4. Topik dan focus keyword otomatis diisi dari content plan.
5. Klik tombol generate di panel AI.
6. Periksa hasil artikel sebelum menyimpan.

AI menerima konteks berikut:

- Judul rencana.
- Focus keyword.
- Artikel published yang tersedia untuk internal link.
- Knowledge base produk Balikin.
- Aturan soft-selling produk.

## Validasi SEO Otomatis

Draft AI harus memenuhi beberapa aturan sebelum digunakan:

- Slug mengandung focus keyword dalam format URL.
- Focus keyword muncul minimal dua kali di content.
- Content memenuhi minimum target kata berdasarkan tipe artikel. Artikel tanpa content plan menggunakan minimum 300 kata.
- Meta description tersedia.
- Internal link digunakan jika artikel relevan tersedia.
- Link produk hanya menggunakan URL produk yang diizinkan.

Jika focus keyword belum muncul minimal dua kali, hasil AI dianggap tidak valid dan sistem akan mencoba fallback model/API key.

## Workflow Editorial yang Disarankan

Gunakan alur berikut untuk setiap artikel:

```text
Planned
  ↓
Brief Ready
  ↓
AI Drafted
  ↓
Human Review
  ↓
SEO Ready
  ↓
Scheduled
  ↓
Published
```

Editor tetap wajib memeriksa:

- Akurasi fakta.
- Kesesuaian search intent.
- Naturalitas penggunaan keyword.
- Kualitas internal link.
- Kesesuaian CTA.
- Ejaan dan gaya bahasa Indonesia.
- Kesesuaian klaim produk dengan knowledge base.

## Internal Linking

Setiap supporting article sebaiknya memiliki:

- Satu link ke pillar induk.
- Satu sampai tiga link ke supporting article yang relevan.
- Satu link ke halaman produk jika sesuai konteks.

Pillar article sebaiknya memiliki:

- Link ke seluruh supporting article penting.
- Link ke halaman produk utama.
- Ringkasan singkat setiap subtopik.

Gunakan anchor text yang deskriptif:

```markdown
Pelajari juga cara melacak barang hilang dengan langkah yang benar.
```

Hindari anchor text generik:

```markdown
Klik di sini.
```

## Target Publikasi 3 Bulan

Target awal yang direkomendasikan:

- 6 pillar article.
- 48 supporting article.
- 6 commercial article.
- Rata-rata 5 artikel per minggu.

Pillar sebaiknya diterbitkan terlebih dahulu. Supporting article dapat diterbitkan setelah pillar tersedia agar internal linking langsung dapat diterapkan.

## Penggunaan Filter

Gunakan filter cluster untuk melihat roadmap satu topik. Gunakan filter status untuk menemukan pekerjaan yang perlu ditindaklanjuti.

Contoh penggunaan:

- Filter `QR Smart Tag` + `Planned` untuk mencari ide yang belum dibuat.
- Filter `AI Drafted` untuk mencari artikel yang perlu direview.
- Filter `Published` untuk mengevaluasi cluster yang sudah berjalan.

## Troubleshooting

### Tombol Seed Tidak Aktif

Seed hanya aktif ketika belum ada cluster. Jika cluster sudah ada, buat cluster dan rencana artikel secara manual.

### Generate Draft Gagal

Periksa hal berikut:

- Gemini API key tersedia.
- Topik memiliki minimal 5 karakter.
- Focus keyword sudah diisi.
- Rate limit generate AI belum tercapai.
- Artikel memenuhi minimal 300 kata dan focus keyword muncul dua kali.

### Artikel Tidak Terhubung ke Content Plan

Gunakan tombol **Generate Draft** dari halaman Content Strategy, bukan membuka halaman artikel baru secara langsung. Dengan cara tersebut `planId` ikut dikirim ke editor dan status content plan dapat disinkronkan.

## Prinsip Editorial

- Jangan menerbitkan artikel hanya untuk mengejar jumlah.
- Satu artikel harus menjawab satu search intent utama.
- Hindari membuat beberapa artikel dengan keyword dan maksud pencarian yang sama.
- Tambahkan pengalaman, contoh, data, atau sudut pandang yang orisinal.
- Perbarui pillar article setelah beberapa supporting article diterbitkan.
- Evaluasi performa melalui Google Search Console setelah 8–12 minggu.
