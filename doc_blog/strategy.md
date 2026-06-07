# 🚀 SEO & Content Uniqueness Spec: BALIKIN Blog Platform

Untuk mengalahkan kompetitor dan menduduki halaman pertama Google, blog BALIKIN tidak boleh hanya mengandalkan teks pasif. Google sangat menyukai konten yang memiliki **High E-E-A-T** (Experience, Expertise, Authoritativeness, Trustworthiness) dan menyediakan **Interactivity** (membuat pengunjung betah lama-lama di halaman Anda, yang meningkatkan metrik Dwell Time).

Berikut adalah fitur tambahan yang wajib diintegrasikan ke dalam CMS dan halaman blog `balikin.online/blog`:

---

## 🛡️ 1. Google E-E-A-T Booster (Kredibilitas Penulis & Reviewer)

Google mendegradasi konten yang ditulis oleh AI tanpa pengawasan ahli. Untuk itu, kita harus menambahkan modul **Dual-Author** di setiap artikel: **Penulis Konten** dan **Pakar Peninjau (Reviewed By)**.

### Struktur Data pada Admin Editor

Saat membuat artikel, admin dapat memilih:

- **Author Profile**: (Contoh: Tim Penulis BALIKIN)
- **Reviewed By Profile**: (Contoh: "Ditinjau dari segi keamanan oleh: Andi Pratama, Certified Information Security Professional" atau "Ditinjau oleh Tim Legal BALIKIN" untuk artikel pengurusan dokumen hilang)

### Dampak SEO

Menghasilkan Schema markup `ReviewedBy` di dalam JSON-LD metadata, memberikan sinyal kuat kepada robot Google bahwa artikel ini akurat secara hukum/teknis dan aman bagi pembaca.

---

## 📑 2. Skema JSON-LD Otomatis (Dynamic Rich Snippets)

Agar artikel kita tampil menonjol di Google (misalnya muncul dengan bintang rating, daftar FAQ langsung di hasil pencarian, atau produk terkait), blog BALIKIN harus mengenerate **Structured Data secara dinamis** berdasarkan modul yang dipasang oleh admin.

Setiap kali halaman `/blog/[slug]` dirender, sistem akan menyisipkan tag `<script type="application/ld+json">` yang divalidasi secara dinamis:

### A. Jika artikel memiliki modul FAQ

Sistem otomatis membuat skema `FAQPage`:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Bagaimana cara kerja tag QR BALIKIN?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Penemu cukup memindai QR code di tag Anda untuk menghubungi Anda dengan aman."
      }
    }
  ]
}
```

### B. Hubungan Blog ke Produk (Product Loop Schema)

Jika artikel membahas tentang "Cara mengamankan koper saat traveling", sistem akan menyisipkan skema `Product` BALIKIN di bawah artikel agar Google tahu bahwa artikel ini memiliki solusi komersial yang relevan.

---

## 💬 3. Modul UGC: "Success Stories & Community Map"

Keunikan terbesar BALIKIN adalah cerita-cerita nyata tentang bagaimana barang berhasil kembali. Kita bisa membuat komponen dinamis bernama **"Kisah Penyelamatan"**.

### Di Dashboard Admin

Fitur untuk menandai testimoni atau cerita pengembalian barang yang sukses.

### Di Sisi Blog

Widget interaktif yang menampilkan peta anonim atau counter jumlah barang yang berhasil diselamatkan dengan tag BALIKIN.

### Mengapa ini bagus untuk SEO?

Ini menghasilkan konten unik yang terus diperbarui (**fresh content**), yang merupakan salah satu sinyal ranking paling positif bagi Google.

---

## ✍️ 4. Checklist SEO On-Page Otomatis di Dashboard Admin

Agar admin tidak lupa melakukan optimasi dasar sebelum menerbitkan (publish) artikel, buatlah panel **SEO Checklist** di sisi kanan editor blog:

- [ ] **Slug Optimization**: Apakah slug mengandung kata kunci utama? (Maksimal 4 kata)
- [ ] **Focus Keyword Density**: Apakah kata kunci utama muncul di paragraf pertama, sub-judul (H2), dan Meta Description?
- [ ] **Alt Image Text**: Apakah gambar cover dan galeri sudah memiliki deskripsi alternatif (alt tag) untuk Google Image Search?
- [ ] **Internal Linking**: Apakah artikel ini sudah menyertakan minimal 1 link ke halaman produk BALIKIN dan 1 link ke artikel blog lainnya?
- [ ] **Word Count**: Apakah panjang konten teks utama minimal sudah mencapai 600 kata?
