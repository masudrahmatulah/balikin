'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Film, ImageIcon, Lightbulb, Save, Search, ShieldCheck } from 'lucide-react';
import { VIDEO_IDEAS, type VideoIdea } from '@/lib/video-planner-data';

type VideoState = { status: string; views: string; likes: string };
type SavedStates = Record<string, VideoState>;

const DEFAULT_STATE: VideoState = { status: 'Ide', views: '', likes: '' };

function buildOutput(idea: VideoIdea) {
  return {
    script: `[00:00–00:03] HOOK\nVisual: ${idea.visual}\nVoice-over: “${idea.hook}”\nTeks layar: ${idea.hook}\n\n[00:03–00:10] MASALAH\nVisual: Tunjukkan situasi barang yang tertinggal atau sulit dikenali.\nVoice-over: “Barang mahasiswa berpindah tempat setiap hari. Saat tertinggal, penemu sering tidak tahu harus menghubungi siapa.”\n\n[00:10–00:23] SOLUSI\nVisual: Tampilkan QR Balikin, proses scan, halaman kontak anonim, dan notifikasi pemilik.\nVoice-over: “${idea.takeaway}”\n\n[00:23–00:30] CTA\nVisual: Tampilkan produk atau katalog Balikin.\nVoice-over: “${idea.cta}”\nTeks layar: ${idea.cta}`,
    videoPrompt: `Buat video promosi vertikal 9:16 berdurasi 30 detik untuk Balikin, platform Smart Lost and Found QR dari Indonesia.\n\nIde utama: ${idea.title}.\nTarget: mahasiswa Indonesia.\n\nAdegan utama: ${idea.visual}\nPesan yang harus tersampaikan: ${idea.takeaway}\nCTA: ${idea.cta}\n\nGaya: realistis, natural, terpercaya, seperti iklan startup yang dekat dengan kehidupan kampus. Gunakan perubahan visual setiap 2–4 detik, subtitle Bahasa Indonesia yang singkat, dan komposisi aman untuk TikTok, Instagram Reels, serta YouTube Shorts.\n\nJangan membuat QR code yang diklaim bisa dipindai. Jangan menampilkan nomor telepon, data pribadi nyata, klaim GPS live, atau logo Balikin yang berubah. Sisakan ruang untuk memasukkan screen recording dan aset produk asli saat editing final.`,
    thumbnailPrompt: `Buat thumbnail universal untuk video pendek Balikin dengan format vertikal 9:16, aman untuk crop platform.\n\nKonsep: ${idea.title}.\nVisual utama: ${idea.visual}\nTeks overlay besar maksimal 4 kata: ${idea.hook.split('?')[0].slice(0, 38)}\n\nGunakan satu objek utama yang jelas, kontras tinggi, ekspresi atau situasi yang mudah dipahami, warna merah Balikin sebagai aksen, dan logo kecil di area aman. Sisakan area tengah untuk teks.\n\nJangan membuat tulisan kecil, nomor HP, QR code nyata, watermark, logo yang berubah, atau lebih dari satu pesan utama. Teks overlay harus ditambahkan ulang secara manual saat editing jika hasil AI tidak akurat.`,
    description: `${idea.takeaway}\n\nBalikin membantu pemilik barang membuka jalur kontak yang aman ketika barang ditemukan. Pilih media yang sesuai kebutuhan Anda: Free Pass, QR Tag Printable Premium, Sticker QR, atau Gantungan Akrilik.\n\n${idea.cta}`,
    caption: `${idea.hook}\n\n${idea.takeaway}\n\n${idea.cta}`,
    hashtags: '#Balikin #QRTag #BarangHilang #LostAndFound #Mahasiswa #KeamananBarang #Indonesia',
    youtubeTags: 'qr barang hilang, lost and found Indonesia, QR tag mahasiswa, keamanan barang, cara menemukan barang hilang, Balikin online, sticker QR, gantungan kunci QR',
    pinnedComment: `Barang apa yang paling sering kamu khawatirkan hilang? Cek pilihan Balikin di balikin.online/produk`,
  };
}

export function VideoPlanner() {
  const [selectedId, setSelectedId] = useState(VIDEO_IDEAS[0].id);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Semua');
  const [states, setStates] = useState<SavedStates>({});
  const [copied, setCopied] = useState('');

  useEffect(() => {
    try { setStates(JSON.parse(localStorage.getItem('balikin-video-planner') || '{}')); } catch { setStates({}); }
  }, []);

  const ideas = useMemo(() => VIDEO_IDEAS.filter((idea) => {
    const matchesQuery = `${idea.title} ${idea.hook} ${idea.product}`.toLowerCase().includes(query.toLowerCase());
    return matchesQuery && (category === 'Semua' || idea.category === category);
  }), [category, query]);

  const selected = VIDEO_IDEAS.find((idea) => idea.id === selectedId) ?? VIDEO_IDEAS[0];
  const output = buildOutput(selected);
  const state = states[selected.id] ?? DEFAULT_STATE;

  function updateState(patch: Partial<VideoState>) {
    const next = { ...states, [selected.id]: { ...state, ...patch } };
    setStates(next);
    localStorage.setItem('balikin-video-planner', JSON.stringify(next));
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
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">30 Ide Video untuk Mahasiswa</h1>
          <p className="mt-2 max-w-3xl text-slate-600 dark:text-slate-300">Pilih ide, salin script dan prompt AI, lalu tandai proses produksinya. Output sudah mencakup thumbnail, deskripsi, caption, hashtag, dan YouTube tags.</p>
        </div>
        <div className="rounded-xl border bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900"><span className="font-semibold">2 video/minggu</span><span className="ml-2 text-slate-500">· 15 minggu untuk 30 ide</span></div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <aside className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex items-center gap-2 rounded-lg border px-3 py-2 dark:border-slate-700"><Search className="h-4 w-4 text-slate-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari ide video..." className="w-full bg-transparent text-sm outline-none" /></div>
          <select value={category} onChange={(event) => setCategory(event.target.value)} className="mb-4 h-10 w-full rounded-lg border bg-transparent px-3 text-sm dark:border-slate-700"><option>Semua</option><option>Masalah</option><option>Edukasi</option><option>Produk</option><option>Trust</option></select>
          <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
            {ideas.map((idea) => {
              const ideaState = states[idea.id] ?? DEFAULT_STATE;
              return <button key={idea.id} type="button" onClick={() => setSelectedId(idea.id)} className={`w-full rounded-xl border p-3 text-left transition-colors ${idea.id === selected.id ? 'border-brand-red bg-red-50 dark:border-red-500 dark:bg-red-950/20' : 'hover:border-slate-400 dark:border-slate-700'}`}><div className="flex items-start justify-between gap-2"><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{idea.id} · {idea.category}</span><span className="text-[10px] text-slate-500">{ideaState.status}</span></div><p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">{idea.title}</p><p className="mt-1 line-clamp-2 text-xs text-slate-500">{idea.hook}</p></button>;
            })}
          </div>
        </aside>

        <section className="space-y-5">
          <div className="rounded-2xl border bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><p className="text-sm font-semibold text-brand-red">{selected.category} · {selected.product}</p><h2 className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">{selected.title}</h2><p className="mt-2 text-slate-600 dark:text-slate-300">{selected.takeaway}</p></div><div className="flex gap-2"><select value={state.status} onChange={(event) => updateState({ status: event.target.value })} className="h-9 rounded-lg border bg-transparent px-2 text-sm dark:border-slate-700"><option>Ide</option><option>Script selesai</option><option>Prompt siap</option><option>Diproduksi</option><option>Diposting</option><option>Dievaluasi</option></select><button type="button" onClick={() => updateState(state)} className="inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"><Save className="h-4 w-4" />Simpan</button></div></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3"><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Target</p><p className="font-semibold">{selected.audience}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">Hook</p><p className="font-semibold">{selected.hook}</p></div><div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800"><p className="text-xs text-slate-500">CTA</p><p className="font-semibold">{selected.cta}</p></div></div>
            <div className="mt-4 flex flex-wrap gap-3"><label className="text-sm text-slate-600">Views <input value={state.views} onChange={(event) => updateState({ views: event.target.value })} className="ml-2 h-8 w-28 rounded border px-2 dark:border-slate-700 dark:bg-slate-800" inputMode="numeric" /></label><label className="text-sm text-slate-600">Likes <input value={state.likes} onChange={(event) => updateState({ likes: event.target.value })} className="ml-2 h-8 w-28 rounded border px-2 dark:border-slate-700 dark:bg-slate-800" inputMode="numeric" /></label></div>
          </div>

          <OutputCard icon={<Film className="h-4 w-4" />} title="Script Video" value={output.script} onCopy={() => copy('script', output.script)} copied={copied === 'script'} />
          <OutputCard icon={<Lightbulb className="h-4 w-4" />} title="Prompt Video AI" value={output.videoPrompt} onCopy={() => copy('video', output.videoPrompt)} copied={copied === 'video'} />
          <OutputCard icon={<ImageIcon className="h-4 w-4" />} title="Prompt Thumbnail + Teks Overlay" value={output.thumbnailPrompt} onCopy={() => copy('thumbnail', output.thumbnailPrompt)} copied={copied === 'thumbnail'} />
          <div className="grid gap-5 md:grid-cols-2"><OutputCard title="Deskripsi Video" value={output.description} onCopy={() => copy('description', output.description)} copied={copied === 'description'} /><OutputCard title="Caption" value={output.caption} onCopy={() => copy('caption', output.caption)} copied={copied === 'caption'} /><OutputCard title="Hashtag" value={output.hashtags} onCopy={() => copy('hashtags', output.hashtags)} copied={copied === 'hashtags'} /><OutputCard title="YouTube Tags" value={output.youtubeTags} onCopy={() => copy('tags', output.youtubeTags)} copied={copied === 'tags'} /><OutputCard title="Komentar Pin" value={output.pinnedComment} onCopy={() => copy('comment', output.pinnedComment)} copied={copied === 'comment'} /></div>
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-200"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /><p><strong>Checklist sebelum publish:</strong> jangan gunakan QR hasil AI sebagai QR nyata, gunakan screen recording asli, cek harga dan fitur, jangan tampilkan nomor HP, dan beri label “simulasi” jika bukan kejadian pelanggan nyata.</p></div>
        </section>
      </div>
    </div>
  );
}

function OutputCard({ title, value, icon, onCopy, copied }: { title: string; value: string; icon?: React.ReactNode; onCopy: () => void; copied: boolean }) {
  return <div className="rounded-2xl border bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"><div className="mb-3 flex items-center justify-between gap-3"><h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">{icon}{title}</h3><button type="button" onClick={onCopy} className="inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800">{copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}{copied ? 'Tersalin' : 'Copy'}</button></div><pre className="max-h-96 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">{value}</pre></div>;
}
