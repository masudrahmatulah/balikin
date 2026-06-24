'use client';

import { useState, useTransition } from 'react';
import { createStickerOrder } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ProductKey } from '@/lib/product-catalog';

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
  productKey: ProductKey;
}

type FieldErrors = Record<string, string>;

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

export function CheckoutForm({ onSuccess, productKey }: CheckoutFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [segment, setSegment] = useState('');
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    const input = {
      recipientName: String(formData.get('recipientName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      addressLine: String(formData.get('addressLine') ?? ''),
      city: String(formData.get('city') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      segment,
      voucherCode: String(formData.get('voucherCode') ?? ''),
      productKey,
    };

    // Client-side guard untuk segment (wajib)
    if (!segment) {
      setFieldErrors({ segment: 'Pilih tujuan penggunaan produk' });
      return;
    }

    startTransition(async () => {
      try {
        const order = await createStickerOrder(input);
        onSuccess(order.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Terjadi kesalahan, coba lagi';
        setFormError(message);
      }
    });
  };

  return (
    <form action={handleSubmit} className="space-y-5" aria-live="polite">
      {/* General form error — dipisah dari per-field error */}
      {formError && (
        <div
          className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200"
          role="alert"
          aria-atomic="true"
        >
          {formError}
        </div>
      )}

      {/* Nama Penerima */}
      <div>
        <Label htmlFor="recipientName">
          Nama Penerima <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Input
          id="recipientName"
          name="recipientName"
          required
          placeholder="Contoh: Budi Santoso"
          maxLength={100}
          autoComplete="name"
          aria-invalid={!!fieldErrors.recipientName}
          aria-describedby={fieldErrors.recipientName ? 'recipientName-error' : undefined}
        />
        <FieldError id="recipientName-error" message={fieldErrors.recipientName} />
      </div>

      {/* Nomor WhatsApp */}
      <div>
        <Label htmlFor="phone">
          Nomor WhatsApp <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          required
          placeholder="628123456789"
          maxLength={20}
          inputMode="tel"
          autoComplete="tel"
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
        />
        <p id="phone-hint" className="mt-1 text-xs text-gray-500">
          Format: 628xxxxxxxxxx (tanpa tanda + atau 0 di depan)
        </p>
        <FieldError id="phone-error" message={fieldErrors.phone} />
      </div>

      {/* Segmentasi CRM — wajib untuk pipeline B2B (checkout.md Section 1) */}
      <div>
        <Label htmlFor="segment">
          Produk ini untuk kepentingan? <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={segment} onValueChange={setSegment} required>
          <SelectTrigger
            id="segment"
            aria-invalid={!!fieldErrors.segment}
            aria-describedby={fieldErrors.segment ? 'segment-error' : undefined}
          >
            <SelectValue placeholder="Pilih tujuan penggunaan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pribadi">Pribadi</SelectItem>
            <SelectItem value="keluarga">Keluarga</SelectItem>
            <SelectItem value="bisnis">Bisnis / Komersial</SelectItem>
          </SelectContent>
        </Select>
        <FieldError id="segment-error" message={fieldErrors.segment} />
      </div>

      {/* Alamat Lengkap */}
      <div>
        <Label htmlFor="addressLine">
          Alamat Lengkap <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="addressLine"
          name="addressLine"
          required
          rows={4}
          placeholder="Jalan, nomor rumah, RT/RW, kecamatan, patokan"
          maxLength={500}
          aria-invalid={!!fieldErrors.addressLine}
          aria-describedby={fieldErrors.addressLine ? 'addressLine-error' : undefined}
        />
        <FieldError id="addressLine-error" message={fieldErrors.addressLine} />
      </div>

      {/* Kota & Kode Pos */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city">
            Kota <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id="city"
            name="city"
            required
            placeholder="Makassar"
            maxLength={100}
            autoComplete="address-level2"
            aria-invalid={!!fieldErrors.city}
            aria-describedby={fieldErrors.city ? 'city-error' : undefined}
          />
          <FieldError id="city-error" message={fieldErrors.city} />
        </div>
        <div>
          <Label htmlFor="postalCode">
            Kode Pos <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            required
            placeholder="90111"
            maxLength={10}
            inputMode="numeric"
            autoComplete="postal-code"
            aria-invalid={!!fieldErrors.postalCode}
            aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
          />
          <FieldError id="postalCode-error" message={fieldErrors.postalCode} />
        </div>
      </div>

      {/* Kode Voucher (opsional) */}
      <div>
        <Label htmlFor="voucherCode">Kode Voucher (Opsional)</Label>
        <Input
          id="voucherCode"
          name="voucherCode"
          placeholder="Contoh: BALIKIN2025"
          maxLength={50}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          aria-invalid={!!fieldErrors.voucherCode}
          aria-describedby={fieldErrors.voucherCode ? 'voucherCode-error' : undefined}
          style={{ textTransform: 'uppercase' }}
        />
        <FieldError id="voucherCode-error" message={fieldErrors.voucherCode} />
      </div>

      {/* Catatan Tambahan */}
      <div>
        <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Contoh: kirim sore hari, warna helm, atau kebutuhan khusus lainnya"
          maxLength={300}
          aria-invalid={!!fieldErrors.notes}
          aria-describedby={fieldErrors.notes ? 'notes-error' : undefined}
        />
        <FieldError id="notes-error" message={fieldErrors.notes} />
      </div>

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? 'Memproses...' : 'Lanjutkan ke Instruksi Pembayaran'}
      </Button>
    </form>
  );
}
