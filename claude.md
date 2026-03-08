Tentu! Ini adalah versi lengkap dari file `claude.md`. File ini dirancang khusus sebagai **"Manual Konteks"** agar ketika Anda memberikan file ini ke AI (seperti Claude atau Gemini), AI tersebut langsung memiliki pemahaman 100% tentang proyek **"Balikin"** tanpa Anda perlu menjelaskan dari nol lagi.

Silakan salin kode di bawah ini dan simpan dengan nama `claude.md` di root folder proyek Anda.

---

```markdown
# Project Context: Balikin (Smart Lost & Found QR Tag)

## 1. Vision & Core Concept
**Balikin** adalah platform "Smart Lost & Found" yang menghubungkan objek fisik (gantungan kunci/tag) dengan identitas digital dinamis. 
- **Masalah:** Kehilangan kunci/barang berharga seringkali buntu karena penemu tidak tahu cara menghubungi pemilik tanpa melanggar privasi (alamat rumah).
- **Solusi:** QR Code dinamis yang menempel pada barang. Jika di-scan, penemu dapat menghubungi pemilik via WhatsApp tanpa pemilik harus mencantumkan identitas permanen pada benda fisik.

## 2. Tech Stack (Strictly Followed)
- **Framework:** Next.js (App Router, Server Actions)
- **Database:** PostgreSQL via Supabase
- **ORM:** Drizzle ORM (Type-safe queries)
- **Authentication:** Better Auth (Focus: WhatsApp/Email OTP for ease of use)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui & Lucide React icons
- **Deployment:** Vercel (Utilizing Vercel Headers for Geo-location)

## 3. Database Schema (Drizzle ORM)
```typescript
// table: tags
// Menyimpan data setiap unit gantungan kunci
export const tags = pgTable("tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").unique().notNull(), // URL friendly ID (misal: nanoid)
  ownerId: text("owner_id").references(() => users.id), // Owner dari Better Auth
  name: text("name").notNull(), // Misal: "Kunci Nmax", "Tas Sekolah"
  status: text("status").default("normal").notNull(), // 'normal' | 'lost'
  contactWhatsapp: text("contact_whatsapp"),
  customMessage: text("custom_message"),
  rewardNote: text("reward_note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// table: scan_logs
// Mencatat riwayat scan untuk fitur deteksi lokasi
export const scanLogs = pgTable("scan_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  tagId: uuid("tag_id").references(() => tags.id),
  scannedAt: timestamp("scanned_at").defaultNow(),
  ipAddress: text("ip_address"),
  city: text("city"),
  latitude: text("latitude"),
  longitude: text("longitude"),
});

```

## 4. Key Business Logic & Rules

1. **Dynamic Redirection (`/p/[slug]`):**
* Jika `status === 'normal'`: Tampilkan profil ramah, foto keluarga/owner, dan pesan sapaan.
* Jika `status === 'lost'`: Tampilkan UI darurat (merah), tombol WhatsApp mencolok, dan info imbalan.


2. **Implicit Tracking:**
* Saat halaman `/p/[slug]` diakses dan status adalah 'lost', sistem WAJIB menjalankan Server Action untuk mencatat IP, Kota, dan Koordinat kasar dari Vercel Headers (`x-vercel-ip-city`, dll).


3. **Privacy First:**
* Nomor WhatsApp tidak boleh dirender sebagai teks statis di HTML untuk menghindari bot. Gunakan tombol yang memicu `window.open` ke API WhatsApp.


4. **Claim Mechanism:**
* Tag yang diproduksi vendor bersifat 'unclaimed' (ownerId is null).
* User yang melakukan scan pertama kali dan login akan 'mengklaim' tag tersebut ke akunnya.



## 5. UI/UX Principles

* **Mobile First:** Target utama adalah pengguna smartphone (penemu barang).
* **Empathy Driven:** Mode "Lost" harus menggugah rasa kemanusiaan penemu melalui foto dan pesan personal.
* **Minimalist Dashboard:** Pemilik hanya perlu melihat daftar tag mereka, mengganti status, dan melihat riwayat lokasi scan (peta sederhana).

## 6. Current Progress / Todo

* [ ] Setup Next.js with Drizzle & Supabase.
* [ ] Implement Better Auth with OTP.
* [ ] Create Public Profile Page (`/p/[slug]`) with conditional UI.
* [ ] Implement Scan Logging (Vercel Headers).
* [ ] Build User Dashboard for Tag Management.

```

---

### Cara Menggunakan File Ini:
1. **Simpan** file ini di proyek Anda.
2. **Saat chat dengan AI (Claude/Gemini):** Langsung *attach* file ini atau *copy-paste* isinya di awal percakapan.
3. **Katakan:** *"Gunakan konteks dari `claude.md` ini. Sekarang, bantu saya buatkan fungsi [nama fungsi] sesuai dengan tech stack yang ada."*


karena supabase yang saya gunakan juga digunakakn oleh aplikasi lain, maka semua tabel dari aplikasi ini harus punya prefix "balikin_" dan punya app_id "balikin_id" 
