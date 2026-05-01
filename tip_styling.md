Membangun konsistensi visual bukan sekadar menyalin elemen, melainkan membangun **Design System** atau "Bahasa Visual" yang terstandarisasi. Sebagai arsitek, saya akan mengarahkan Anda untuk berhenti berpikir per halaman dan mulai berpikir secara sistemik.

---

### Arsitektur Logika
Untuk mencapai konsistensi *production-ready*, kita menggunakan pendekatan **Atomic Design**. Kita akan memecah gaya dari landing page Anda menjadi unit terkecil (Tokens), membangun komponen dasar, lalu membungkusnya dalam sebuah Template global.

1.  **Extraction (Tokenisasi):** Mengambil variabel warna, tipografi, dan spasi dari landing page.
2.  **Global Styling:** Menerapkan variabel tersebut ke level paling dasar (Root).
3.  **Componentization:** Mengubah elemen yang berulang (Button, Input, Card) menjadi komponen yang *reusable*.
4.  **Layout Wrapper:** Membuat struktur kerangka tetap (Header, Footer, Sidebar).

---

### Implementasi Teknis (Best Practice)

#### 1. Definisikan Design Tokens (CSS Variables)
Jangan menggunakan *hardcoded* hex code di setiap file. Simpan semua "DNA" desain Anda di satu tempat.

```css
/* style/variables.css */
:root {
  /* Colors */
  --primary-color: #2563eb;
  --secondary-color: #64748b;
  --accent-color: #f59e0b;
  --bg-main: #ffffff;
  --text-dark: #1e293b;

  /* Typography */
  --font-main: 'Inter', sans-serif;
  --h1-size: 2.5rem;
  --body-size: 1rem;

  /* Spacing & Borders */
  --radius-md: 8px;
  --shadow-sm: 0 1px 3px rgba(0,0,0,0.1);
  --container-width: 1200px;
}
```

#### 2. Gunakan Utility Framework (Opsional namun Disarankan)
Jika Anda menggunakan **Tailwind CSS**, cara terbaik adalah memindahkan style landing page ke `tailwind.config.js`. Ini memastikan "style" Anda tersedia sebagai *class* di semua halaman.

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#2563eb',
          secondary: '#64748b',
        }
      },
      borderRadius: {
        'custom': '12px',
      }
    }
  }
}
```

#### 3. Implementasi Layout Wrapper (React/Next.js Example)
Agar Header dan Footer tidak ditulis ulang di setiap halaman, gunakan *Layout Pattern*.

```jsx
// components/Layout.js
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="main-wrapper" style={{ fontFamily: 'var(--font-main)' }}>
      <Navbar /> 
      {/* Konten halaman akan masuk ke sini */}
      <main className="container-center">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

---

### Trade-offs: Solusi Cepat vs Solusi Skalabel

| Fitur | Solusi Cepat (MVP) | Solusi Ideal (Scalable) |
| :--- | :--- | :--- |
| **Metode** | Copy-paste CSS ke file `style.css` global. | Menggunakan CSS Variables atau Tailwind Theme. |
| **Komponen** | Langsung tulis HTML di setiap file. | Membuat library komponen (Button.jsx, Card.jsx). |
| **Kecepatan** | Sangat cepat di awal. | Lambat di awal (setup), sangat cepat saat scaling. |
| **Maintenance** | Sulit. Ubah satu warna harus cari di semua file. | Mudah. Ubah satu variabel, semua halaman berubah. |

---

### Marketing & UX Lens
Konsistensi visual bukan hanya soal estetika, tapi soal **Trust (Kepercayaan)**. 
* **Cognitive Load:** Jika tombol "Beli" di landing page berwarna biru, jangan ubah menjadi hijau di halaman checkout. Inkonsistensi akan membuat pengguna ragu dan menurunkan konversi.
* **Brand Recognition:** Pastikan *spacing* (jarak antar elemen) konsisten. Desain yang "bernafas" dengan konsistensi yang sama di tiap halaman memberikan kesan aplikasi profesional dan mahal.

---

### Next Steps
1.  **Audit Landing Page:** Identifikasi 3 warna utama, 2 font utama, dan gaya border/shadow yang Anda gunakan.
2.  **Ekstraksi ke CSS Variables:** Masukkan nilai-nilai tersebut ke dalam file CSS global atau config framework Anda.
3.  **Buat Layout Utama:** Bungkus aplikasi Anda dengan komponen Header dan Footer yang sudah ada di landing page.
4.  **Refaktor Halaman Lain:** Ganti semua *inline style* atau *hardcoded color* di halaman lain dengan variabel yang sudah dibuat.

Apakah Anda saat ini menggunakan framework tertentu (seperti React, Vue, atau Laravel) atau hanya HTML/CSS murni? Saya bisa memberikan struktur folder yang lebih spesifik jika Anda menginfokannya.