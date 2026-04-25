'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  QrCode,
  MessageCircle,
  Mail,
  Pencil,
  Trash2,
  Check,
  X,
  Gift,
  Crown,
  FileText,
  AlertTriangle,
  ShieldCheck,
  ScanLine,
  ExternalLink,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { updateTagStatus, updateTag, deleteTag } from '@/app/actions/tag';
import { useRouter } from 'next/navigation';
import { VerifiedBadge } from '@/components/verified-badge';
import {
  STICKER_ORDER_WHATSAPP_MESSAGE,
  UPGRADE_WHATSAPP_MESSAGE,
  WHATSAPP_ORDER_NUMBER,
} from '@/lib/constants';
import { getTagProductLabel, isAcrylicProduct, isFreeProduct, isStickerProduct } from '@/lib/product';
import type { ProductType } from '@/lib/product';
import { GraduationCap } from 'lucide-react';

interface TagCardProps {
  id: string;
  slug: string;
  name: string;
  status: string;
  contactWhatsapp: string | null;
  customMessage: string | null;
  rewardNote: string | null;
  tier?: string | null;
  productType?: string | null;
  isVerified?: boolean | null;
  emailAlertsEnabled?: boolean | null;
  whatsappAlertsEnabled?: boolean | null;
  ownerEmail?: string | null;
  createdAt: Date | null;
  scanCount?: number;
  hasTabTwoEnabled?: boolean | null;
  hasStudentKit?: boolean | null;
}

export function TagCard({
  id,
  slug,
  name,
  status,
  contactWhatsapp,
  customMessage,
  rewardNote,
  tier,
  productType,
  isVerified,
  emailAlertsEnabled,
  whatsappAlertsEnabled,
  ownerEmail,
  createdAt,
  scanCount = 0,
  hasTabTwoEnabled,
  hasStudentKit,
}: TagCardProps) {
  const router = useRouter();
  const isLost = status === 'lost';
  const isFreeTag = isFreeProduct({ productType: productType ?? null, tier: tier ?? null } as { productType: ProductType | null; tier: string | null; });
  const isStickerTag = isStickerProduct({ productType: productType ?? null, tier: tier ?? null } as { productType: ProductType | null; tier: string | null; });
  const isAcrylicTag = isAcrylicProduct({ productType: productType ?? null, tier: tier ?? null } as { productType: ProductType | null; tier: string | null; });
  const productLabel = getTagProductLabel({ productType: productType ?? null, tier: tier ?? null } as { productType: ProductType | null; tier: string | null; });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [editName, setEditName] = useState(name);
  const [editWhatsapp, setEditWhatsapp] = useState(contactWhatsapp || '');
  const [editMessage, setEditMessage] = useState(customMessage || '');
  const [editReward, setEditReward] = useState(rewardNote || '');
  const [editEmailAlertsEnabled, setEditEmailAlertsEnabled] = useState(emailAlertsEnabled ?? isFreeTag);
  const [editWhatsAppAlertsEnabled, setEditWhatsAppAlertsEnabled] = useState(whatsappAlertsEnabled ?? !isFreeTag);
  const insightText = isLost
    ? 'Mode hilang aktif. Penemu akan melihat status darurat saat scan.'
    : scanCount > 0
      ? isFreeTag
        ? `Tag digital ini sudah dipindai ${scanCount} kali. Upgrade ke sticker vinyl untuk hasil fisik yang lebih tahan air dan lebih meyakinkan.`
        : isStickerTag
          ? `Sticker ini sudah dipindai ${scanCount} kali dan tetap siap dipakai di helm, laptop, atau koper.`
          : `Tag ini sudah dipindai ${scanCount} kali dan tetap siap dihubungi.`
      : isFreeTag
        ? 'Digital tag ini siap dipakai untuk wallpaper lockscreen atau cetak mandiri.'
        : isStickerTag
          ? 'Sticker vinyl ini siap dipakai di barang favorit Anda dengan tampilan yang lebih meyakinkan.'
          : 'Belum pernah discan. Tag ini siap dipakai kapan pun dibutuhkan.';
  const createdLabel = createdAt
    ? new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }).format(createdAt)
    : null;

  const handleStatusToggle = async (checked: boolean) => {
    setIsLoading(true);
    try {
      await updateTagStatus(id, checked ? 'lost' : 'normal');
      router.refresh();
    } catch (error) {
      console.error('Failed to update status:', error);
      alert('Gagal mengupdate status');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateTag(id, {
        name: editName,
        contactWhatsapp: editWhatsapp,
        customMessage: editMessage,
        rewardNote: editReward,
        emailAlertsEnabled: editEmailAlertsEnabled,
        whatsappAlertsEnabled: isFreeTag ? false : editWhatsAppAlertsEnabled,
      });
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error('Failed to update tag:', error);
      alert('Gagal mengupdate tag');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Yakin ingin menghapus tag ini?')) return;

    setIsLoading(true);
    try {
      await deleteTag(id);
      router.refresh();
    } catch (error) {
      console.error('Failed to delete tag:', error);
      alert('Gagal menghapus tag');
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <Card className={isLost ? 'border-red-200 shadow-sm shadow-red-100' : 'shadow-sm'}>
        <CardHeader>
          <CardTitle>Edit Tag</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Nama Barang</Label>
            <Input
              id="edit-name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              inputMode="text"
              autoComplete="off"
            />
          </div>
          <div>
            <Label htmlFor="edit-whatsapp">Nomor WhatsApp</Label>
            <Input
              id="edit-whatsapp"
              value={editWhatsapp}
              onChange={(e) => setEditWhatsapp(e.target.value)}
              placeholder="628123456789"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <div>
            <Label htmlFor="edit-message">Pesan Sapaan</Label>
            <Textarea
              id="edit-message"
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              placeholder="Contoh: Kunci motor ini sangat penting bagi saya..."
              rows={3}
              className="text-base"
            />
          </div>
          <div>
            <Label htmlFor="edit-reward">Imbalan saat Hilang (opsional)</Label>
            <Input
              id="edit-reward"
              value={editReward}
              onChange={(e) => setEditReward(e.target.value)}
              placeholder="Contoh: Rp 50.000"
              inputMode="text"
              autoComplete="off"
            />
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-950">Notifikasi scan saat mode hilang</p>
            <div className="mt-4 space-y-4">
              {isFreeTag ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                  Email alert selalu aktif untuk versi free dan dikirim ke akun Anda{ownerEmail ? ` (${ownerEmail})` : ''}.
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label htmlFor={`edit-email-alert-${id}`} className="text-sm font-medium text-slate-900">
                      Email alert
                    </Label>
                    <p className="mt-1 text-sm text-slate-600">
                      Aktifkan jika Anda juga ingin menerima ringkasan scan di email{ownerEmail ? ` (${ownerEmail})` : ''}.
                    </p>
                  </div>
                  <Switch
                    id={`edit-email-alert-${id}`}
                    checked={editEmailAlertsEnabled}
                    onCheckedChange={setEditEmailAlertsEnabled}
                    disabled={isLoading}
                    aria-label={`Toggle email alert untuk ${name}`}
                  />
                </div>
              )}

              {isFreeTag ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
                  WhatsApp alert hanya tersedia untuk tag premium.
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Label htmlFor={`edit-wa-alert-${id}`} className="text-sm font-medium text-slate-900">
                      WhatsApp alert
                    </Label>
                    <p className="mt-1 text-sm text-slate-600">
                      {isStickerTag
                        ? 'Sticker Vinyl mengirim alert scan instan lewat jalur standar ke nomor WhatsApp tag Anda.'
                        : 'Acrylic Premium mengutamakan jalur priority WhatsApp alert, lalu otomatis fallback ke jalur standar jika dibutuhkan.'}
                    </p>
                  </div>
                  <Switch
                    id={`edit-wa-alert-${id}`}
                    checked={editWhatsAppAlertsEnabled}
                    onCheckedChange={setEditWhatsAppAlertsEnabled}
                    disabled={isLoading}
                    aria-label={`Toggle WhatsApp alert untuk ${name}`}
                  />
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="ghost" onClick={() => setIsEditing(false)} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Batal
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Check className="mr-2 h-4 w-4" />
            Simpan
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className={`group overflow-hidden border shadow-lg transition-all duration-300 ${isOpen ? 'hover:-translate-y-1 hover:shadow-xl' : ''} ${isLost ? 'border-red-200 bg-red-50/60 shadow-red-100/60' : 'border-white/80 bg-white/95 shadow-slate-200/70'}`}>
        {/* Collapsed Header - Always Visible */}
        <CollapsibleTrigger asChild>
          <CardHeader className={`cursor-pointer transition-colors hover:bg-slate-50/50 ${isOpen ? 'border-b border-slate-100' : 'pb-4'}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`rounded-xl p-2 flex-shrink-0 ${isLost ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                  {isLost ? <AlertTriangle className="h-4 w-4" /> : <QrCode className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg font-semibold text-slate-950 truncate">
                      {name}
                    </CardTitle>
                    <Badge variant={isLost ? 'destructive' : 'success'} className={`px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] flex-shrink-0 ${isLost ? '' : 'bg-emerald-600'}`}>
                      {isLost ? 'Hilang' : 'Normal'}
                    </Badge>
                    {hasTabTwoEnabled && (
                      <Badge variant="default" className="px-2 py-0.5 text-[10px] uppercase tracking-[0.18em] flex-shrink-0 bg-purple-600 text-white">
                        <Lock className="w-3 h-3 mr-1" />
                        Tab 2
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">/p/{slug}</span>
                    <VerifiedBadge
                      tier={tier as 'free' | 'premium' | null}
                      productType={productType as ProductType | null}
                      isVerified={isVerified}
                      size="sm"
                      showTier={isFreeTag}
                    />
                    <Badge variant="outline" className="border-slate-200 bg-white text-slate-600 text-xs">
                      {productLabel}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="text-right">
                  <p className="text-xs text-slate-500">{scanCount} scans</p>
                  {createdLabel && <p className="text-xs text-slate-400" suppressHydrationWarning>{createdLabel}</p>}
                </div>
                <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        {/* Expanded Content - Only Visible When Open */}
        <CollapsibleContent>
          <CardContent className="space-y-4">
        <div className={`rounded-2xl border p-4 ${isLost ? 'border-red-200 bg-white/70' : 'border-slate-200 bg-slate-50/90'}`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 rounded-xl p-2 ${isLost ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {isLost ? <AlertTriangle className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-950">Insight cepat</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">{insightText}</p>
            </div>
          </div>
        </div>

        {isLost && (
          <Alert variant="destructive" className="border-red-200 bg-red-100/80 text-red-950">
            <Gift className="h-4 w-4" />
            <AlertDescription className="font-medium">
              {rewardNote ? `Imbalan untuk penemu: ${rewardNote}` : 'Mode hilang aktif. Pastikan detail kontak Anda sudah akurat.'}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{isFreeTag ? 'Info scan' : 'Total scan'}</p>
            <div className="mt-2 flex items-center gap-2">
              <ScanLine className="h-4 w-4 text-cyan-600" />
              <p className="text-lg font-semibold text-slate-950">{scanCount}</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              {scanCount > 0
                ? isFreeTag
                  ? 'Aktivitas scan tercatat. Detail tracking lebih lengkap tersedia untuk premium.'
                  : 'Ada aktivitas scan tercatat.'
                : 'Belum ada aktivitas scan.'}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">WhatsApp owner</p>
            <div className="mt-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-emerald-600" />
              <p className="text-sm font-medium text-slate-950">{contactWhatsapp || 'Belum diisi'}</p>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              Kontak ini dipakai penemu untuk menghubungi Anda.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-950">Aturan notifikasi scan</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                {isFreeTag
                  ? `Free hanya mengirim alert scan ke email akun Anda${ownerEmail ? ` (${ownerEmail})` : ''}.`
                  : isStickerTag
                    ? 'Sticker Vinyl mengirim alert scan via WhatsApp jalur standar secara default, dengan email sebagai opsi tambahan.'
                    : 'Acrylic Premium mencoba jalur priority WhatsApp lebih dulu, lalu fallback ke jalur standar, dengan email sebagai opsi tambahan.'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className={emailAlertsEnabled ? 'border-blue-200 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500'}>
                  Email {emailAlertsEnabled ? 'Aktif' : 'Nonaktif'}
                </Badge>
                <Badge variant="outline" className={whatsappAlertsEnabled ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500'}>
                  WhatsApp {whatsappAlertsEnabled ? 'Aktif' : 'Nonaktif'}
                </Badge>
                {isAcrylicTag && whatsappAlertsEnabled && (
                  <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                    Priority Route
                  </Badge>
                )}
              </div>
              {!isFreeTag && !contactWhatsapp && (
                <p className="mt-3 text-sm text-amber-700">
                  Isi nomor WhatsApp agar alert {isStickerTag ? 'Sticker Vinyl' : 'Acrylic Premium'} bisa terkirim.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className={`flex items-center justify-between gap-4 rounded-2xl border p-4 ${isLost ? 'border-red-200 bg-red-50/70' : 'border-slate-200 bg-slate-50/90'}`}>
          <div>
            <Label htmlFor={`toggle-${id}`} className="text-sm font-semibold text-slate-950">
              Status Hilang
            </Label>
            <p className="mt-1 text-sm text-slate-600">
              Aktifkan saat barang benar-benar hilang agar halaman publik berubah jadi prioritas tinggi.
            </p>
          </div>
          <Switch
            id={`toggle-${id}`}
            checked={isLost}
            onCheckedChange={handleStatusToggle}
            disabled={isLoading}
            aria-label={`Ubah status hilang untuk ${name}`}
          />
        </div>

        {customMessage && (
          <div className="rounded-2xl border border-blue-100 bg-blue-50/90 p-4">
            <p className="text-sm font-semibold text-slate-950">{isFreeTag ? 'Pesan sapaan' : isStickerTag ? 'Pesan sticker' : 'Pesan personal'}</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">{customMessage}</p>
          </div>
        )}

        {isFreeTag && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-yellow-50 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-3">
                <div className="rounded-2xl bg-amber-100 p-2.5">
                  <Crown className="h-4 w-4 text-amber-700" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-950">Upgrade dari Digital Tag Free</p>
                  <p className="mt-1 text-sm leading-6 text-amber-800">
                    Ubah DIY digital tag ini jadi sticker vinyl isi 6 yang lebih tahan hujan, tahan pakai, dan langsung siap ditempel di helm, laptop, atau koper.
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant="outline"
                className="border-amber-300 bg-white text-amber-800 hover:bg-amber-100"
                onClick={() => window.open(`https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(STICKER_ORDER_WHATSAPP_MESSAGE || UPGRADE_WHATSAPP_MESSAGE)}`, '_blank')}
              >
                Pesan Sticker
                <ExternalLink className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
          </CardContent>

          <CardFooter className="flex flex-col items-stretch justify-between gap-3 border-t border-slate-100 bg-white/70 pt-5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)} disabled={isLoading}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit Tag
          </Button>
          {hasTabTwoEnabled && hasStudentKit && (
            <Button variant="default" size="sm" asChild className="bg-purple-600 hover:bg-purple-700">
              <Link href={`/p/${slug}/private/student`}>
                <GraduationCap className="mr-2 h-4 w-4" />
                Student Kit
              </Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" asChild disabled={isLoading}>
            <Link href={`/dashboard/tag/${slug}`}>
              <QrCode className="mr-2 h-4 w-4" />
              Unduh QR Code
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            disabled={isLoading}
            title="Download PDF"
          >
            <a href={`/dashboard/tag/${slug}/qr`} download>
              <FileText className="mr-2 h-4 w-4" />
              PDF
            </a>
          </Button>
        </div>
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isLoading} className="text-slate-500 hover:text-red-600">
          <Trash2 className="mr-2 h-4 w-4" />
          Hapus
        </Button>
      </CardFooter>
        </CollapsibleContent>
    </Card>
  </Collapsible>
  );
}
