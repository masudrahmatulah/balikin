# 🚀 PRD & Technical Specification: BALIKIN Custom Blog, UGC & Admin Dashboard

Dokumen ini adalah acuan tunggal (single source of truth) untuk pembangunan platform blog balikin.online/blog beserta dashboard admin pengelolaannya. Sistem ini dirancang untuk:

- Mendongkrak SEO (Domain Authority)
- Meningkatkan Dwell Time melalui interaktivitas
- Menggerakkan pertumbuhan fisik (growth hacking) menggunakan sistem kuis berhadiah, giveaway komentar, kampanye video kisah nyata (True Story), peta titik rawan, polling instan, dan galeri pamer setup barang.

---

## 🎯 1. Ringkasan Eksekutif & Goal Produk

### Keunikan Konten
Menghindari artikel pasif yang membosankan dengan menyisipkan modul interaktif seperti:
- Kuis Berhadiah Stiker
- Kolom Diskusi Interaktif (Giveaway Komentar)
- Peta Titik Rawan Hilang
- Polling Instan

### Social Proof Tingkat Tinggi
Menyediakan wadah bagi pengguna setia BALIKIN untuk mengirimkan video pembuktian (True Story) berhadiah:
- Jaket Eksklusif BALIKIN
- Lencana digital (Hero Badge)

### Strategi SEO
- Menggunakan subfolder `/blog` di domain utama untuk akumulasi nilai SEO
- Mengotomatisasi E-E-A-T metadata (penulis asli, peninjau ahli)
- Struktur data JSON-LD dinamis, didukung oleh teks organik kiriman pembaca (User Generated Content)

---

## 🗺️ 2. Fitur & Alur Pengguna (User Flow)

### A. Alur Publik (Pembaca Blog)

**1. Membaca Artikel**  
Pembaca membuka salah satu artikel berkualitas tinggi di `balikin.online/blog/[slug]`.

**2. Mengisi Kuis & Giveaway (Tipe Artikel A)**  
- Di akhir artikel, pembaca ditantang untuk mengikuti kuis pemahaman materi artikel berhadiah 2 Pcs Stiker Kustom BALIKIN
- Jika berhasil menjawab minimal kriteria kelulusan (skor ≥ 80%), form pengiriman barang akan terbuka secara dinamis

**3. Menulis Cerita & Giveaway Komentar (Tipe Artikel B)**  
- Pembaca membagikan pengalaman pribadinya terkait topik bahasan artikel di kolom komentar bawah
- Admin memilih komentar terbaik mingguan untuk dihadiahkan stiker gratis dan badge pemenang

**4. Klaim Kisah Nyata (Halaman Khusus / Hero Form)**  
- Pengguna lama BALIKIN yang barangnya berhasil kembali berkat pindaian QR Code mengunggah video pendek ke TikTok/Instagram/Drive
- Mereka mendaftarkan tautan video beserta ID Tag BALIKIN mereka di form klaim berhadiah Jaket Eksklusif BALIKIN

**5. Interaksi Pendukung (Titik Rawan & Polling)**  
- Pembaca dapat memberikan suara sekali klik pada widget jajak pendapat (polling)
- Berkontribusi melaporkan nama fasilitas umum tempat mereka pernah kehilangan barang (UGC Crowdsourced)

### B. Alur Dashboard Admin (Pengelola)

**1. Manajemen Artikel (CRUD)**  
Admin membuat, mengedit, menyimpan draft, atau menerbitkan artikel blog beserta blok modul dinamisnya (Kuis, Polling, Peta, dll).

**2. Manajemen Pengiriman Giveaway (Fulfillment Panel)**  
- Admin melihat daftar klaim dari pemenang kuis dan giveaway komentar
- Admin mengubah status klaim: `Pending → Approved → Shipped` (disertai pengisian nomor resi)

**3. Moderasi Komentar & Pemilihan Pemenang**  
- Admin menyetujui, menyembunyikan, atau menandai komentar terbaik
- Menentukan pemenang giveaway stiker mingguan

**4. Kurasi Kampanye True Story**  
- Admin meninjau video kisah nyata yang dikirimkan
- Memberikan lencana digital (verified hero badge) ke profil pembaca
- Memproses logistik hadiah jaket

---

## 🗄️ 3. Arsitektur Database & Tipe Data (Drizzle ORM)

Skema database diimplementasikan menggunakan PostgreSQL dan Drizzle ORM.

### Skema Tabel: `src/db/schema.ts`

```typescript
import { pgTable, uuid, text, timestamp, jsonb, boolean, integer } from 'drizzle-orm/pg-core';

// 1. Tabel Utama Posting Blog
export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  title: text('title').notNull(),
  slug: text('slug').notNull().unique(),
  summary: text('summary').notNull(),
  coverImage: text('cover_image'), 
  content: text('content').notNull(), // Format Markdown
  
  // JSONB untuk menampung array modul dinamis secara berurutan
  modules: jsonb('modules').default([]).$type<Array<any>>(), 
  
  // Sinyal E-E-A-T
  authorName: text('author_name').default('Tim Penulis BALIKIN').notNull(),
  authorAvatar: text('author_avatar'),
  reviewedBy: text('reviewed_by'), // Contoh: "Andi Pratama, Certified Security Professional"
  reviewedByTitle: text('reviewed_by_title'),

  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Tabel Klaim Giveaway Stiker (Fulfillment dari Kuis)
export const giveawayClaims = pgTable('giveaway_claims', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  quizId: text('quiz_id').notNull(),
  
  fullName: text('full_name').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  shippingAddress: text('shipping_address').notNull(),
  score: integer('score').notNull(),
  
  status: text('status').default('pending').notNull(), // 'pending', 'approved', 'shipped', 'rejected'
  trackingNumber: text('tracking_number'),
  notes: text('notes'),
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 3. Tabel Kolom Komentar Publik & Giveaway Komentar
export const blogComments = pgTable('blog_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  
  name: text('name').notNull(),
  commentText: text('comment_text').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(), // Disembunyikan dari publik, hanya terlihat oleh admin
  
  isApproved: boolean('is_approved').default(true).notNull(), // Filter anti-spam
  isGiveawayWinner: boolean('is_giveaway_winner').default(false).notNull(), // Penanda pemenang stiker
  hasHeroBadge: boolean('has_hero_badge').default(false).notNull(), // Lencana khusus jika dia alumni video kisah nyata
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 4. Tabel Kiriman Kampanye Video Kisah Nyata (True Story)
export const trueStorySubmissions = pgTable('true_story_submissions', {
  id: uuid('id').defaultRandom().primaryKey(),
  fullName: text('full_name').notNull(),
  whatsappNumber: text('whatsapp_number').notNull(),
  balikinTagId: text('balikin_tag_id').notNull(), // Validasi ID produk fisik
  
  storyTitle: text('story_title').notNull(),
  storyText: text('story_text').notNull(),
  videoUrl: text('video_url').notNull(), // Link TikTok/Reels/Google Drive
  jacketSize: text('jacket_size').notNull(), // S, M, L, XL, XXL
  shippingAddress: text('shipping_address').notNull(),
  
  status: text('status').default('pending').notNull(), // 'pending', 'verified', 'winner_jacket', 'rejected'
  trackingNumber: text('tracking_number'), // Resi pengiriman jaket
  
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 5. Tabel Laporan Crowdsourced Titik Rawan Hilang
export const lostLocationsReport = pgTable('lost_locations_report', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  locationName: text('location_name').notNull(), // cth: "Parkiran Stasiun Kandangan"
  locationType: text('location_type').notNull(), // cth: "Parkiran", "Kafe", "Stasiun"
  cityName: text('city_name').notNull(), // cth: "Kandangan"
  lostItemType: text('lost_item_type').notNull(), // cth: "Kunci Motor"
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// 6. Tabel Data Voting Real-Time untuk Komponen Polling
export const pollVotes = pgTable('poll_votes', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id').references(() => blogPosts.id, { onDelete: 'cascade' }).notNull(),
  pollId: text('poll_id').notNull(),
  selectedOptionIndex: integer('selected_option_index').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
```

### Definisi Tipe TypeScript: `src/types/blog.ts`

```typescript
export type FAQItem = {
  question: string;
  answer: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  correctAnswerIndex: number; // 0-3
};

export type BlogModule = 
  | { type: 'faq'; data: FAQItem[] }
  | { type: 'gallery'; images: string[] }
  | { type: 'ad_baris'; text: string; link: string; badge?: string }
  | { type: 'crowdsourced_map'; mapRegionId: string }
  | { type: 'instant_poll'; pollId: string; question: string; options: string[] }
  | { type: 'setup_showoff'; galleryId: string; incentiveDiscount: number }
  | { 
      type: 'quiz_giveaway'; 
      quizId: string; 
      rewardText: string; 
      minScoreToWin: number; // Skala 0-100
      questions: QuizQuestion[]; 
    };
```

---

## 🖥️ 4. Komponen UI Interaktif (Frontend Next.js)

### A. Modul Kuis & Form Klaim Hadiah (`src/components/blog/quiz-module.tsx`)

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, AlertTriangle, Gift, ArrowRight, ClipboardCheck } from "lucide-react";

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

interface QuizModuleProps {
  quizId: string;
  rewardText: string;
  minScoreToWin: number;
  questions: QuizQuestion[];
  postId: string;
}

export function BlogQuizModule({ quizId, rewardText, minScoreToWin, questions, postId }: QuizModuleProps) {
  const [step, setStep] = useState<'intro' | 'active_quiz' | 'result_fail' | 'claim_form' | 'success'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({ name: '', whatsapp: '', address: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculatedScore, setCalculatedScore] = useState(0);

  const currentQuestion = questions[currentQuestionIndex];

  const handleNext = () => {
    if (selectedAnswer === null) return;
    
    const newAnswers = [...answers, selectedAnswer];
    setAnswers(newAnswers);
    setSelectedAnswer(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      let correctCount = 0;
      newAnswers.forEach((ans, idx) => {
        if (ans === questions[idx].correctAnswerIndex) correctCount++;
      });
      
      const finalScore = Math.round((correctCount / questions.length) * 100);
      setCalculatedScore(finalScore);

      if (finalScore >= minScoreToWin) {
        setStep('claim_form');
      } else {
        setStep('result_fail');
      }
    }
  };

  const handleReset = () => {
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setStep('active_quiz');
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/blog/giveaway-claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId,
          quizId,
          fullName: formData.name,
          whatsappNumber: formData.whatsapp,
          shippingAddress: formData.address,
          score: calculatedScore
        })
      });

      if (res.ok) {
        setStep('success');
      } else {
        alert("Terjadi kesalahan teknis. Coba beberapa saat lagi.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border-2 border-primary/20 bg-primary/5 rounded-2xl p-6 md:p-8 max-w-2xl mx-auto my-10 shadow-sm transition-all duration-300">
      {step === 'intro' && (
        <div className="text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Gift className="w-6 h-6 animate-bounce" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight">Kuis Berhadiah Stiker BALIKIN!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Yuk uji pemahamanmu dari materi artikel di atas! Jawab kuis singkat ini dengan benar dan dapatkan <span className="font-semibold text-foreground underline decoration-primary decoration-2">{rewardText}</span> secara gratis dikirim ke rumahmu.
          </p>
          <div className="text-xs text-muted-foreground bg-card border py-2 px-4 rounded-full inline-block">
            Target kelulusan: minimal <span className="font-bold text-primary">{minScoreToWin}%</span> jawaban benar
          </div>
          <br/>
          <Button onClick={() => setStep('active_quiz')} className="px-6 font-semibold">Mulai Kuis <ArrowRight className="ml-2 w-4 h-4" /></Button>
        </div>
      )}

      {step === 'active_quiz' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center text-xs text-muted-foreground font-semibold">
            <span className="uppercase tracking-wider text-primary">Kuis Interaktif</span>
            <span>Pertanyaan {currentQuestionIndex + 1} dari {questions.length}</span>
          </div>
          
          <div className="w-full bg-muted rounded-full h-1.5">
            <div className="bg-primary h-1.5 rounded-full transition-all duration-300" style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}></div>
          </div>

          <h4 className="text-lg font-bold text-foreground">{currentQuestion.question}</h4>

          <RadioGroup value={selectedAnswer?.toString() || ""} onValueChange={(v) => setSelectedAnswer(parseInt(v))} className="space-y-3">
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className={`flex items-center space-x-3 border p-4 rounded-xl cursor-pointer transition-all hover:bg-card/50 ${selectedAnswer === idx ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card'}`}>
                <RadioGroupItem value={idx.toString()} id={`opt-${idx}`} />
                <Label htmlFor={`opt-${idx}`} className="w-full cursor-pointer text-sm font-medium text-foreground">{option}</Label>
              </div>
            ))}
          </RadioGroup>

          <Button onClick={handleNext} className="w-full py-6 font-semibold" disabled={selectedAnswer === null}>
            {currentQuestionIndex + 1 === questions.length ? "Lihat Hasil Kuis" : "Lanjutkan Pertanyaan"}
          </Button>
        </div>
      )}

      {step === 'result_fail' && (
        <div className="text-center space-y-4 py-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold">Skor Kamu Belum Mencapai Target</h3>
          <p className="text-sm text-muted-foreground">
            Kamu mendapatkan skor <span className="font-bold text-destructive">{calculatedScore}%</span>. Sayang sekali, batas minimal kelulusan untuk klaim hadiah stiker adalah <span className="font-semibold text-foreground">{minScoreToWin}%</span>.
          </p>
          <p className="text-xs text-muted-foreground">Tip: Baca kembali artikel di atas dengan teliti dan coba lagi!</p>
          <Button variant="outline" onClick={handleReset} className="mt-2">Coba Kuis Lagi</Button>
        </div>
      )}

      {step === 'claim_form' && (
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div className="text-center mb-4 space-y-1">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-emerald-600">Luar Biasa, Kamu Lolos! 🎉</h3>
            <p className="text-xs text-muted-foreground">Skor kamu: <span className="font-bold">{calculatedScore}%</span>. Isi formulir kurir pengiriman di bawah untuk klaim stiker.</p>
          </div>

          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Nama Lengkap Penerima</Label>
              <Input id="name" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="Masukkan nama untuk label kurir" className="bg-card" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="whatsapp" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">No. WhatsApp Aktif</Label>
              <Input id="whatsapp" type="tel" required value={formData.whatsapp} onChange={(e) => setFormData({...formData, whatsapp: e.target.value})} placeholder="Contoh: 081234567xxx (Untuk pengiriman info resi)" className="bg-card" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alamat Lengkap Pengiriman</Label>
              <Textarea id="address" required value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Nama jalan, Nomor rumah, RT/RW, Kelurahan, Kecamatan, Kabupaten/Kota, Kode Pos" className="bg-card min-h-[100px]" />
            </div>
          </div>

          <Button type="submit" className="w-full py-6 font-semibold mt-4" disabled={isSubmitting}>
            {isSubmitting ? "Sedang Mengirim..." : "Klaim & Kirim Stiker Saya!"}
          </Button>
        </form>
      )}

      {step === 'success' && (
        <div className="text-center space-y-4 py-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600">Data Pengiriman Tersimpan!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Hore! Permintaan stiker gratis Anda sedang diproses oleh admin BALIKIN. Kami akan segera mengirimkan paket stiker dan mengonfirmasi nomor resi via WhatsApp. Terima kasih sudah ikut berpartisipasi!
          </p>
        </div>
      )}
    </div>
  );
}
```

### B. Modul Kolom Diskusi & Giveaway Komentar (`src/components/blog/comment-section.tsx`)

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Award } from "lucide-react";

interface Comment {
  id: string;
  name: string;
  commentText: string;
  isGiveawayWinner: boolean;
  hasHeroBadge: boolean;
  createdAt: string;
}

export function BlogCommentSection({ postId, initialComments }: { postId: string; initialComments: Comment[] }) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [form, setForm] = useState({ name: '', whatsapp: '', commentText: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg("");

    try {
      const res = await fetch('/api/blog/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, ...form })
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setForm({ name: '', whatsapp: '', commentText: '' });
        setSuccessMsg("Komentar berhasil dipublikasikan! Semoga beruntung mendapatkan stiker.");
      }
    } catch (err) {
      console.error("Gagal mengirim komentar", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 my-12 border-t pt-8 max-w-2xl mx-auto">
      <div>
        <h3 className="text-xl font-bold flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary" /> Kolom Cerita & Giveaway 🎁
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Punya pengalaman kehilangan barang? Tulis ceritamu di bawah! Tiap minggu, **3 komentar paling menarik** mendapatkan **2 stiker eksklusif BALIKIN** gratis.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 bg-muted/40 p-4 rounded-xl border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input placeholder="Nama Panggilan" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="bg-card" />
          <Input placeholder="No. WhatsApp (Disembunyikan dari publik)" type="tel" required value={form.whatsapp} onChange={e => setForm({...form, whatsapp: e.target.value})} className="bg-card" />
        </div>
        <Textarea placeholder="Ceritakan kepanikanmu, atau bagaimana caramu mencari barang tersebut..." rows={3} required value={form.commentText} onChange={e => setForm({...form, commentText: e.target.value})} className="bg-card" />
        
        {successMsg && <p className="text-xs text-emerald-600 font-semibold">{successMsg}</p>}
        
        <Button size="sm" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Mengirim..." : "Kirim Cerita & Ikut Giveaway"}
        </Button>
      </form>

      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Diskusi Pembaca ({comments.length})</h4>
        {comments.length === 0 ? (
          <p className="text-xs text-muted-foreground italic">Belum ada cerita masuk. Mulai diskusi pertamamu!</p>
        ) : (
          comments.map((comment) => (
            <Card key={comment.id} className={`border transition-all ${comment.isGiveawayWinner ? 'border-primary/50 bg-primary/5 ring-1 ring-primary/20' : 'bg-card'}`}>
              <CardContent className="p-4 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{comment.name}</span>
                    {comment.hasHeroBadge && (
                      <span className="flex items-center gap-1 bg-amber-500/10 text-amber-600 border border-amber-500/25 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        <Award className="w-3 h-3" /> Hero Survivor
                      </span>
                    )}
                    {comment.isGiveawayWinner && (
                      <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/25 px-1.5 py-0.5 rounded text-[10px] font-semibold">
                        🏆 Winner
                      </span>
                    )}
                  </div>
                  <span className="text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{comment.commentText}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
```

### C. Form Kampanye Kisah Nyata Video (`src/components/blog/true-story-form.tsx`)

```tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Award, CheckCircle } from "lucide-react";

export function TrueStorySubmissionForm() {
  const [form, setForm] = useState({
    fullName: '',
    whatsappNumber: '',
    balikinTagId: '',
    storyTitle: '',
    storyText: '',
    videoUrl: '',
    jacketSize: 'L',
    shippingAddress: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/blog/true-story', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });

      if (res.ok) {
        setIsSuccess(true);
      } else {
        alert("Gagal mengirimkan klaim. Pastikan semua kolom terisi dengan benar.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="border border-border bg-card p-6 md:p-8 rounded-2xl max-w-2xl mx-auto shadow-sm my-10">
      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center space-y-2 mb-6">
            <div className="mx-auto w-12 h-12 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold">Klaim Jaket BALIKIN & Hero Badge</h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-md mx-auto">
              Koper, kunci, atau dompetmu berhasil kembali berkat pindaian QR Code BALIKIN? Buat video pendek (TikTok/Reels/Drive) dan dapatkan **Jaket Eksklusif BALIKIN** serta lencana profil digital secara gratis!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Nama Lengkap</Label>
              <Input required value={form.fullName} onChange={e => setForm({...form, fullName: e.target.value})} placeholder="Sesuai KTP" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">No. WhatsApp</Label>
              <Input required type="tel" value={form.whatsappNumber} onChange={e => setForm({...form, whatsappNumber: e.target.value})} placeholder="Contoh: 0812xxx" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">ID Tag BALIKIN Anda</Label>
              <Input required value={form.balikinTagId} onChange={e => setForm({...form, balikinTagId: e.target.value})} placeholder="Contoh: BLK-99238" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-semibold">Ukuran Jaket</Label>
              <select 
                value={form.jacketSize} 
                onChange={e => setForm({...form, jacketSize: e.target.value})}
                className="w-full p-2 border rounded-md text-sm bg-background text-foreground h-[40px]"
              >
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Tautan Video Pendek (UGC)</Label>
            <Input required type="url" value={form.videoUrl} onChange={e => setForm({...form, videoUrl: e.target.value})} placeholder="Link Video TikTok / Instagram Reels / Google Drive" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Judul Kisah Nyatamu</Label>
            <Input required value={form.storyTitle} onChange={e => setForm({...form, storyTitle: e.target.value})} placeholder="Contoh: Selamatnya Helm KYT Saya di Parkiran Mall" />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Cerita Singkat Kronologis</Label>
            <Textarea required value={form.storyText} onChange={e => setForm({...form, storyText: e.target.value})} placeholder="Tuliskan detail kronologi kehilangan hingga barang berhasil dikembalikan..." rows={4} />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-semibold">Alamat Lengkap Pengiriman Jaket</Label>
            <Textarea required value={form.shippingAddress} onChange={e => setForm({...form, shippingAddress: e.target.value})} placeholder="Alamat lengkap kurir penerimaan hadiah" rows={2} />
          </div>

          <Button type="submit" className="w-full py-6 font-bold" disabled={isSubmitting}>
            {isSubmitting ? "Mengirimkan Data..." : "Kirim Kisah & Klaim Jaket Saya!"}
          </Button>
        </form>
      ) : (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10" />
          </div>
          <h3 className="text-2xl font-bold text-emerald-600 font-sans">Kisah Sukses Terkirim!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            Luar biasa! Terima kasih telah membagikan kebahagiaan penyelamatan barang Anda bersama BALIKIN. Tim kami akan segera melakukan verifikasi ID Tag dan video Anda. Konfirmasi pengiriman Jaket akan dikabarkan via WhatsApp.
          </p>
        </div>
      )}
    </div>
  );
}
```

---

## 🛠️ 5. Dashboard Pengelolaan & API Routes

### A. API Kiriman Kisah Nyata (`app/api/blog/true-story/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { trueStorySubmissions } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fullName, whatsappNumber, balikinTagId, storyTitle, storyText, videoUrl, jacketSize, shippingAddress } = body;

    if (!fullName || !whatsappNumber || !balikinTagId || !videoUrl || !shippingAddress) {
      return NextResponse.json({ error: 'Data wajib diisi belum lengkap' }, { status: 400 });
    }

    const submission = await db.insert(trueStorySubmissions).values({
      fullName,
      whatsappNumber,
      balikinTagId,
      storyTitle,
      storyText,
      videoUrl,
      jacketSize,
      shippingAddress,
      status: 'pending'
    }).returning();

    return NextResponse.json({ success: true, submissionId: submission[0].id }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### B. API Routing Komentar (`app/api/blog/comments/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { blogComments } from '@/db/schema';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { postId, name, commentText, whatsapp } = body;

    if (!postId || !name || !commentText || !whatsapp) {
      return NextResponse.json({ error: 'Informasi komentar tidak lengkap' }, { status: 400 });
    }

    const comment = await db.insert(blogComments).values({
      postId,
      name,
      commentText,
      whatsappNumber: whatsapp,
      isApproved: true,
      isGiveawayWinner: false,
      hasHeroBadge: false
    }).returning();

    return NextResponse.json(comment[0], { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
```

### C. Alur Admin Panel Dashboard

**Fulfillment Panel Kuis**
- Admin memverifikasi skor kuis
- Mengunduh data label pengiriman stiker
- Merilis status resi kurir

**Moderasi Diskusi & Winner Picker**
- Admin menyaring teks komentar
- Menentukan pemenang giveaway komentar mingguan dengan satu klik tombol "Tandai Pemenang"
- Memicu status `isGiveawayWinner: true`

**True Story Campaign Management**
- Admin meninjau kesesuaian video
- Mencentang verifikasi untuk otomatis menyematkan lencana digital pada akun pemenang di basis database komentar
- Memproses logistik hadiah jaket fisik

---

## 🚀 6. Strategi SEO & Optimasi Teknis Google Ranking

### Peningkatan Kecepatan Dwell Time
Interaktivitas dari kuis pemahaman, jajak pendapat, pengisian peta titik rawan, dan diskusi komentar menahan pembaca rata-rata 3 hingga 5 menit lebih lama per sesi. Sinyal retensi pengguna yang tinggi ini sangat disukai algoritma Google Search.

### Akumulasi Kata Kunci Alami (UGC)
Diskusi yang aktif di bagian kolom komentar memberikan asupan kata kunci alami (long-tail keywords) secara terus-menerus yang ramah pengindeksan Google.

### Validasi Rich Snippets (Schema Markup)

**Jika artikel memiliki modul FAQ**  
Render skema data terstruktur `FAQPage`.

**Kisah Nyata Hub**  
Render metadata `Review` dan `Testimonial` ke Google Bot agar bintang kepuasan platform atau solusi pencarian muncul langsung di hasil pencarian teratas (Rich Snippets).
