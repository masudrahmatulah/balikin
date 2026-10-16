'use client';

import { useRef, useState } from 'react';

type Result = {
  id: string;
  serialNumber: string | null;
  productType: string;
  status: string;
  claimed: boolean;
  orderId: string | null;
  paymentStatus: string | null;
  recipientName: string | null;
  recoverable: boolean;
  blockReason: string | null;
};

export function AcrylicSupportClient() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [proofNote, setProofNote] = useState('');
  const [acknowledged, setAcknowledged] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const requestSequence = useRef(0);

  function resetProof(target: string | null = null) {
    setSelectedTagId(target);
    setProofNote('');
    setAcknowledged(false);
  }

  async function search(event: React.FormEvent) {
    event.preventDefault();
    const requestId = ++requestSequence.current;
    setBusy(true);
    setMessage('');
    setResults([]);
    resetProof();
    try {
      const response = await fetch(`/admin/api/activation-support?query=${encodeURIComponent(query.trim())}`, { cache: 'no-store', credentials: 'same-origin' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || 'Pencarian gagal.');
      if (requestId !== requestSequence.current) return;
      setResults(body.results);
    } catch (error) {
      if (requestId === requestSequence.current) setMessage(error instanceof Error ? error.message : 'Pencarian gagal.');
    } finally { if (requestId === requestSequence.current) setBusy(false); }
  }

  async function download(tagId: string) {
    if (selectedTagId !== tagId || !acknowledged || proofNote.trim().length < 16) return;
    const requestId = ++requestSequence.current;
    setBusy(true);
    setMessage('');
    try {
      const response = await fetch('/admin/api/activation-support/download', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tagId, proofNote: proofNote.trim(), proofReviewed: acknowledged }),
        credentials: 'same-origin',
      });
      if (requestId !== requestSequence.current) return;
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.error || 'Unduhan ditolak.');
      }
      const blob = await response.blob();
      if (requestId !== requestSequence.current) return;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'balikin-acrylic-support-card.pdf'; anchor.click();
      URL.revokeObjectURL(url);
      setMessage('Satu kartu aktivasi berhasil diunduh.');
      resetProof();
    } catch (error) { if (requestId === requestSequence.current) setMessage(error instanceof Error ? error.message : 'Unduhan gagal.'); }
    finally { if (requestId === requestSequence.current) setBusy(false); }
  }

  return <section className="mx-auto max-w-4xl space-y-6">
    <div><h1 className="text-2xl font-bold">Bantuan Serial Acrylic</h1><p className="mt-2 text-sm text-slate-600 dark:text-slate-300">Cari menggunakan serial tepat atau UUID pesanan. Pencarian tidak menampilkan PIN. Pelepasan kartu hanya untuk tag belum diklaim pada pesanan lunas yang terpetakan.</p></div>
    <form onSubmit={search} className="flex flex-col gap-3 sm:flex-row"><input value={query} onChange={e => { requestSequence.current++; setBusy(false); setQuery(e.target.value); setResults([]); resetProof(); setMessage(''); }} required maxLength={100} className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-slate-900" placeholder="Serial tepat atau UUID order"/><button disabled={busy} className="rounded-md bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-50">Cari</button></form>
    <p className="text-sm text-amber-800">Sebelum unduh: cocokkan bukti pembelian fisik secara manual. Catatan verifikasi wajib dan akan masuk audit. Jangan masukkan PIN, token, atau data kartu pembayaran ke catatan.</p>
    {results.map(item => <article key={item.id} className="space-y-3 rounded-lg border bg-white p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      <div className="grid gap-2 text-sm sm:grid-cols-2"><p>Serial: <strong className="font-mono">{item.serialNumber || '—'}</strong></p><p>Produk: {item.productType}</p><p>Status: {item.status} {item.claimed ? '· sudah diklaim' : '· belum diklaim'}</p><p>Order: {item.orderId || 'tidak terpetakan'}</p><p>Pembayaran: {item.paymentStatus || 'tidak tersedia'}</p><p>Penerima: {item.recipientName || '—'}</p></div>
      {item.blockReason && <p className="text-sm font-medium text-amber-800">{item.blockReason}</p>}
      {item.recoverable && (selectedTagId !== item.id ? <button disabled={busy} onClick={() => resetProof(item.id)} className="rounded-md border px-3 py-2 text-sm disabled:opacity-50">Pilih tag untuk verifikasi</button> : <div className="space-y-3 border-t pt-3"><label className="block text-sm">Catatan verifikasi bukti pembelian<textarea value={proofNote} onChange={e => setProofNote(e.target.value)} minLength={16} maxLength={500} className="mt-1 block w-full rounded-md border bg-white p-2 text-slate-900" placeholder="Catat jenis bukti yang ditinjau dan hasil pencocokan (tanpa data sensitif)." /></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={acknowledged} onChange={e => setAcknowledged(e.target.checked)} />Saya telah memeriksa bukti pembelian fisik dan mencocokkannya dengan pemohon.</label><button disabled={busy || !acknowledged || proofNote.trim().length < 16} onClick={() => download(item.id)} className="rounded-md bg-rose-700 px-4 py-2 text-white disabled:opacity-50">Unduh SATU kartu (PIN lama)</button></div>)}
    </article>)}
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
