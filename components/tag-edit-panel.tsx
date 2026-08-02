'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { updateTag } from '@/app/actions/tag';
import { Edit2, Save, X, Loader2, MessageSquare, Phone, Tag, Lock, Gift } from 'lucide-react';

const REWARD_PRESETS = ['Rp 25.000', 'Rp 30.000', 'Rp 40.000'];

interface TagEditPanelProps {
  tagId: string;
  tagName: string;
  contactWhatsapp: string;
  customMessage: string | null;
  rewardNote: string | null;
  isFree?: boolean;
  variant?: 'desktop' | 'mobile';
}

export function TagEditPanel({
  tagId,
  tagName,
  contactWhatsapp,
  customMessage,
  rewardNote,
  isFree = false,
  variant = 'desktop',
}: TagEditPanelProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState(tagName);
  const [phone, setPhone] = useState(contactWhatsapp);
  const [message, setMessage] = useState(customMessage ?? '');

  function derivePresetAndCustom(note: string | null) {
    if (!note) return { preset: '', custom: '' };
    if (REWARD_PRESETS.includes(note)) return { preset: note, custom: '' };
    return { preset: 'custom', custom: note };
  }

  const initial = derivePresetAndCustom(rewardNote);
  const [rewardPreset, setRewardPreset] = useState(initial.preset);
  const [rewardCustom, setRewardCustom] = useState(initial.custom);

  function handleOpen() {
    setName(tagName);
    setPhone(contactWhatsapp);
    setMessage(customMessage ?? '');
    const derived = derivePresetAndCustom(rewardNote);
    setRewardPreset(derived.preset);
    setRewardCustom(derived.custom);
    setError(null);
    setSuccess(false);
    setIsOpen(true);
  }

  function handleCancel() {
    setIsOpen(false);
    setError(null);
  }

  function handleSave() {
    setError(null);
    const finalReward = rewardPreset === 'custom' ? rewardCustom.trim() : rewardPreset;
    startTransition(async () => {
      try {
        await updateTag(tagId, {
          name: name.trim() || undefined,
          contactWhatsapp: phone.trim() || undefined,
          customMessage: message.trim() || undefined,
          ...(isFree ? {} : { rewardNote: finalReward || undefined }),
        });
        setSuccess(true);
        setIsOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.');
      }
    });
  }

  const isMobile = variant === 'mobile';

  const triggerBtn = isMobile ? (
    <button
      type="button"
      onClick={handleOpen}
      className="w-full bg-mobile-primary text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 btn-press"
    >
      <Edit2 className="h-5 w-5" />
      Edit Tag
    </button>
  ) : (
    <button
      type="button"
      onClick={handleOpen}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
    >
      <Edit2 className="h-4 w-4" />
      Edit Tag
    </button>
  );

  if (!isOpen) {
    return (
      <div>
        {triggerBtn}
        {success && (
          <p className="mt-2 text-sm text-emerald-600 font-medium text-center">Perubahan berhasil disimpan.</p>
        )}
      </div>
    );
  }

  const inputClass = isMobile
    ? 'w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent'
    : 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

  const textareaClass = isMobile
    ? 'w-full px-4 py-3 bg-white/80 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-mobile-primary focus:border-transparent resize-none'
    : 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white';

  const wrapperClass = isMobile
    ? 'bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border border-white/20 space-y-4'
    : 'rounded-xl border border-blue-200 bg-blue-50 p-5 space-y-4';

  return (
    <div className={wrapperClass}>
      <div className="flex items-center justify-between mb-1">
        <h3 className={`font-bold ${isMobile ? 'text-gray-900' : 'text-gray-800'}`}>
          Edit Tag
        </h3>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Tutup"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Nama Tag */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Tag className="h-3.5 w-3.5" />
          Nama Tag
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Kunci Rumah"
          className={inputClass}
          maxLength={100}
        />
      </div>

      {/* WhatsApp */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <Phone className="h-3.5 w-3.5" />
          Nomor WhatsApp
        </label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="628xxxxxxxxxx"
          className={inputClass}
        />
      </div>

      {/* Finder Default Message */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
          <MessageSquare className="h-3.5 w-3.5" />
          Pesan Default Penemu
        </label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Halo, saya ingin bertanya tentang tag "${name || 'Kunci Rumah'}".`}
          rows={3}
          maxLength={300}
          className={textareaClass}
        />
        <p className="text-xs text-gray-400 mt-1">
          Kalimat ini akan otomatis terisi saat penemu menekan tombol WhatsApp di halaman tag.
        </p>
      </div>

      {/* Janji Hadiah */}
      {isFree ? (
        <div className={`rounded-lg border border-gray-200 bg-gray-50 p-3 ${isMobile ? 'rounded-xl' : ''}`}>
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-medium mb-1">
            <Lock className="h-3.5 w-3.5" />
            Janji Hadiah
          </div>
          <p className="text-xs text-gray-400">
            🔒 Upgrade ke Premium untuk mengaktifkan fitur Janji Hadiah &amp; tingkatkan peluang barang kembali hingga 80%!
          </p>
        </div>
      ) : (
        <div>
          <label className="flex items-center gap-1.5 text-xs font-medium text-gray-500 mb-1.5">
            <Gift className="h-3.5 w-3.5" />
            Janji Hadiah <span className="text-gray-400">(opsional)</span>
          </label>
          <select
            value={rewardPreset}
            onChange={(e) => setRewardPreset(e.target.value)}
            className={inputClass}
          >
            <option value="">Tidak ada imbalan</option>
            {REWARD_PRESETS.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
            <option value="custom">Kustom...</option>
          </select>
          {rewardPreset === 'custom' && (
            <input
              type="text"
              value={rewardCustom}
              onChange={(e) => setRewardCustom(e.target.value)}
              placeholder="Contoh: Pulsa Rp 25.000, top-up GoPay Rp 50.000, dll."
              className={`${inputClass} mt-2`}
              maxLength={200}
            />
          )}
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={handleCancel}
          disabled={isPending}
          className={`flex-1 py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 ${isMobile ? 'rounded-xl' : 'rounded-lg'}`}
        >
          Batal
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isPending}
          className={`flex-1 py-2.5 text-sm font-semibold text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
            isMobile
              ? 'bg-mobile-primary hover:bg-mobile-primary-dark rounded-xl btn-press'
              : 'bg-blue-600 hover:bg-blue-700 rounded-lg'
          }`}
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Simpan
            </>
          )}
        </button>
      </div>
    </div>
  );
}
