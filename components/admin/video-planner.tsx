'use client';

import { useMemo, useState, useSyncExternalStore } from 'react';
import { Check, Copy, Film, ImageIcon, Lightbulb, Save, Search, ShieldCheck } from 'lucide-react';
import { BRAND_PILLARS, getBrandPillarLabel } from '@/lib/blog-content-strategy';
import { VIDEO_IDEAS, type VideoIdea } from '@/lib/video-planner-data';

type VideoState = { status: string; views: string; likes: string };
type SavedStates = Record<string, VideoState>;

const DEFAULT_STATE: VideoState = { status: 'Ide', views: '', likes: '' };
const STORAGE_KEY = 'balikin-video-planner';
const STORAGE_EVENT = 'balikin-video-planner-change';

function subscribeToVideoStates(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT, callback);
  };
}

function getVideoStateSnapshot() {
  return window.localStorage.getItem(STORAGE_KEY) || '{}';
}

export function buildOutput(idea: VideoIdea) {
  const brandPillar = getBrandPillarLabel(idea.brandPillar);
  const isProductVideo = idea.category === 'Produk';
  const brandCta = isProductVideo
    ? idea.cta
    : idea.brandPillar === 'cerita-barang-kembali'
      ? 'Pernah kehilangan atau menemukan barang? Ceritakan pengalamanmu.'
      : idea.brandPillar === 'kebaikan-si-penemu'
        ? 'Kalau menemukan barang, bantu pemilik mendapat kabar.'
        : idea.brandPillar === 'kebiasaan-jaga-barang'
          ? 'Simpan pengingat ini sebelum bepergian.'
          : 'Ada yang ingin kamu tanyakan tentang privasi QR? Tulis di komentar.';

  return {
    cta: brandCta,
    script: `[00:00–00:03] HOOK\nVisual: ${idea.visual}\nVoice-over: “${idea.hook}”\nTeks layar: ${idea.hook}\n\n[00:03–00:07] KONTEKS\nVisual: Perlihatkan situasi dari sudut pandang pemilik dan penemu.\nVoice-over: “Barang berpindah tempat setiap hari. Saat tertinggal, penemu belum tentu tahu cara menghubungi pemiliknya.”\n\n[00:07–00:16] PESAN\nVisual: ${idea.visual}\nVoice-over: “${idea.takeaway}”\nTeks layar: ${brandPillar}\n\n[00:16–00:20] PENUTUP\nVisual: Akhiri dengan gestur manusiawi atau tampilan Balikin yang konsisten.\nVoice-over: “${brandCta}”\nTeks layar: ${brandCta}`,
    videoPrompt: `Buat video pendek vertikal 9:16 berdurasi sekitar 20 detik untuk Balikin, platform QR untuk membantu menghubungkan penemu barang dengan pemiliknya di Indonesia.\n\nIde utama: ${idea.title}.\nAudiens: ${idea.audience}.\nPilar brand: ${brandPillar}.\nSatu pesan utama: ${idea.takeaway}\n\nAdegan: ${idea.visual}\nPenutup: ${brandCta}\n${isProductVideo ? `Jika menyebut produk, gunakan hanya informasi ini dan jangan menambahkan harga atau klaim: ${idea.cta}` : 'Utamakan cerita, kebiasaan, atau edukasi. Jangan mengubah video menjadi iklan produk.'}\n\nGaya: hangat, akrab, jujur, dan terasa seperti kehidupan sehari-hari masyarakat Indonesia—bukan iklan startup yang terlalu dipoles. Tampilkan empati pada pemilik dan penemu. Mulai dengan hook dan visual utama pada frame pertama; satu gagasan per video; beri perubahan visual tiap 2–4 detik; gunakan subtitle singkat; sisakan area aman untuk antarmuka YouTube Shorts, Reels, dan TikTok.\n\nJangan membuat QR code AI yang diklaim bisa dipindai, nomor telepon atau data pribadi nyata, klaim GPS live, testimoni/kejadian yang tidak terverifikasi, atau logo Balikin yang berubah. Beri label simulasi jika adegan bukan kisah nyata. Sisakan ruang untuk screen recording dan aset produk asli saat editing final.`,
    thumbnailPrompt: `Buat thumbnail vertikal 9:16 untuk YouTube Shorts, aman untuk crop platform.\n\nIde: ${idea.title}.\nPilar brand: ${brandPillar}.\nVisual utama: ${idea.visual}\nTeks overlay maksimal 4 kata: ${idea.hook.split('?')[0].slice(0, 38)}\n\nPilih satu objek utama yang mudah dikenali, suasana hangat dan nyata, dengan Trust Navy sebagai dasar dan merah Balikin sebagai aksen. Logo harus tetap menggunakan aset resmi; jangan menggambar ulang. Sisakan area tengah untuk teks.\n\nJangan membuat teks kecil, nomor telepon, QR code yang tampak bisa dipindai, watermark, ekspresi berlebihan, atau lebih dari satu pesan utama. Tambahkan ulang teks overlay secara manual saat editing jika hasil AI tidak akurat.`,
    description: `${idea.takeaway}\n\nBalikin menghubungkan pemilik barang dan orang yang menemukannya melalui jalur kontak yang lebih aman. ${brandCta}`,
    caption: `${idea.hook}\n\n${idea.takeaway}\n\n${brandCta}\n\n#Balikin #BarangKembali #SalingMembantu`,
    hashtags: '#Balikin #BarangKembali #BarangHilang #SalingMembantu #Indonesia',
    youtubeTags: 'Balikin Indonesia, barang hilang ditemukan, barang kembali, membantu menemukan pemilik barang, QR tag Indonesia, lost and found Indonesia, tips menjaga barang',
    pinnedComment: brandCta,
  };
}

export function VideoPlanner() {
  const [selectedId, setSelectedId] = useState(VIDEO_IDEAS[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [brandPillar, setBrandPillar] = useState('Semua');
  const storedStates = useSyncExternalStore(subscribeToVideoStates, getVideoStateSnapshot, () => '{}');
  const states = useMemo<SavedStates>(() => {
    try { return JSON.parse(storedStates) as SavedStates; } catch { return {}; }
  }, [storedStates]);
  const [copied, setCopied] = useState('');

  const ideas = useMemo(() => VIDEO_IDEAS.filter((idea) => {
    const matchesQuery = `${idea.title} ${idea.hook} ${idea.product} ${getBrandPillarLabel(idea.brandPillar)}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'Semua' || idea.category === category) && (brandPillar === 'Semua' || idea.brandPillar === brandPillar);
  }), [brandPillar, category, query]);

  const selected = ideas.find((idea) => idea.id === selectedId) ?? ideas[0] ?? VIDEO_IDEAS[0];
  const output = buildOutput(selected);
  const state = states[selected.id] ?? DEFAULT_STATE;

  function updateState(patch: Partial<VideoState>) {
    const next = { ...states, [selected.id]: { ...state, ...patch } };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(STORAGE_EVENT));
  }

  async function copy(label: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(''), 1400);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-brand-red dark:bg-red-950/30"><Film className="h-4 w-4" /> Video Campaign Planner</div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">30 Ide Video untuk Masyarakat Indonesia</h1>
          <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">Pilih ide berdasarkan Pilar Brand Balikin, salin script dan prompt AI, lalu tandai proses produksinya. Progress yang tersimpan tetap menggunakan ID ide yang sama.</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"><span className="font-semibold">2 video/minggu</span><span className="ml-2 text-slate-500">· 15 minggu untuk 30 ide</span></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 dark:border-slate-700"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ide video..." className="w-full bg-transparent text-sm outline-none" /></div>
          <div className="mb-4 grid gap-2">
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="h-10 w-full rounded-lg border bg-transparent px-3 text-sm dark:border-slate-700"><option value="Semua">Semua kategori</option><option>Masalah</option><option>Edukasi</option><option>Produk</option><option>Trust</option></select>
            <select value={brandPillar} onChange={(event) => setBrandPillar(event.target.value)} className="h-10 w-full rounded-lg border bg-transparent px-3 text-sm dark:border-slate-700"><option value="Semua">Semua Pilar Brand</option>{BRAND_PILLARS.map((pillar) => <option key={pillar.value} value={pillar.value}>{pillar.label}</option>)}</select>
          </div>
          <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
            {ideas.map((idea) => {
              const ideaState = states[idea.id] ?? DEFAULT_STATE;
              return <button key={idea.id} type="button" onClick={() => setSelectedId(idea.id)} className={`w-full rounded-xl border p-3 text-left transition-colors ${idea.id === selected.id ? 'border-brand-red bg-red-50 dark:border-red-500 dark:bg-red-950/20' : 'hover:border-slate-400 dark:border-slate-700'}`}><div className="flex items-start justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{idea.category}</span><span className="text-[10px] text-slate-500">{ideaState.status}</span></div><p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{idea.title}</p><p className="mt-1 text-xs font-medium text-brand-red">{getBrandPillarLabel(idea.brandPillar)}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{idea.hook}</p></button>;
            })}
            {ideas.length === 0 && <p className="rounded-xl border border-dashed p-5 text-center text-sm text-slate-500">Tidak ada ide yang cocok dengan filter.</p>}
          </div>
        </aside>

        {ideas.length === 0 ? <div className="rounded-2xl border border-dashed p-10 text-center text-sm text-slate-500">Tidak ada ide yang cocok dengan pencarian atau filter. Coba ubah pilihan Pilar Brand atau kategori.</div> : <section className="space-y-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-sm font-semibold text-brand-red">{getBrandPillarLabel(selected.brandPillar)} · {selected.category}{selected.category === 'Produk' ? ` · ${selected.product}` : ''}</p><h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selected.title}</h2><p className="mt-2 text-slate-600 dark:text-slate-300">{selected.takeaway}</p></div><div className="flex gap-2"><select value={state.status} onChange={(event) => updateState({ status: event.target.value })} className="h-9 rounded-lg border bg-transparent px-2 text-sm dark:border-slate-700"><option>Ide</option><option>Script selesai</option><option>Prompt siap</option><option>Diproduksi</option><option>Diposting</option><option>Dievaluasi</option></select><button type="button" onClick={() => updateState(state)} className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Save className="h-4 w-4" />Simpan</button></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Target</p><p className="font-semibold">{selected.audience}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Hook</p><p className="font-semibold">{selected.hook}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">CTA</p><p className="font-semibold">{output.cta}</p></div></div>
            <div className="mt-4 flex flex-wrap gap-3"><label className="text-sm text-slate-600">Views <input value={state.views} onChange={(event) => updateState({ views: event.target.value })} className="ml-2 h-8 w-28 rounded border px-2 dark:border-slate-700 dark:bg-slate-800" inputMode="numeric" /></label><label className="text-sm text-slate-600">Likes <input value={state.likes} onChange={(event) => updateState({ likes: event.target.value })} className="ml-2 h-8 w-28 rounded border px-2 dark:border-slate-700 dark:bg-slate-800" inputMode="numeric" /></label></div>
          </div>

          <OutputCard icon={<Film className="h-4 w-4" />} title="Script Video" value={output.script} onCopy={() => copy('script', output.script)} copied={copied === 'script'} />
          <OutputCard icon={<Lightbulb className="h-4 w-4" />} title="Prompt Video AI" value={output.videoPrompt} onCopy={() => copy('video', output.videoPrompt)} copied={copied === 'video'} />
          <OutputCard icon={<ImageIcon className="h-4 w-4" />} title="Prompt Thumbnail + Teks Overlay" value={output.thumbnailPrompt} onCopy={() => copy('thumbnail', output.thumbnailPrompt)} copied={copied === 'thumbnail'} />
          <div className="grid gap-5 md:grid-cols-2"><OutputCard title="Deskripsi Video" value={output.description} onCopy={() => copy('description', output.description)} copied={copied === 'description'} /><OutputCard title="Caption" value={output.caption} onCopy={() => copy('caption', output.caption)} copied={copied === 'caption'} /><OutputCard title="Hashtag" value={output.hashtags} onCopy={() => copy('hashtags', output.hashtags)} copied={copied === 'hashtags'} /><OutputCard title="YouTube Tags" value={output.youtubeTags} onCopy={() => copy('tags', output.youtubeTags)} copied={copied === 'tags'} /><OutputCard title="Komentar Pin" value={output.pinnedComment} onCopy={() => copy('comment', output.pinnedComment)} copied={copied === 'comment'} /></div>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Checklist sebelum publish:</strong> jangan gunakan QR hasil AI sebagai QR nyata, gunakan screen recording asli, cek harga dan fitur, jangan tampilkan nomor HP, dan beri label “simulasi” jika bukan kejadian pelanggan nyata.</p></div>
        </section>}
      </div>
    </div>
  );
}

function OutputCard({ title, value, icon, onCopy, copied }: { title: string; value: string; icon?: React.ReactNode; onCopy: () => void; copied: boolean }) {
  return <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">{icon}{title}</h3><button type="button" onClick={onCopy} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">{copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Tersalin' : 'Copy'}</button></div><pre className="max-h-96 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</pre></div>;
}
