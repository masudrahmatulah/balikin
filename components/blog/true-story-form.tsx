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
        const error = await res.json();
        alert(error.error || "Gagal mengirimkan klaim. Pastikan semua kolom terisi dengan benar.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan koneksi.");
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
