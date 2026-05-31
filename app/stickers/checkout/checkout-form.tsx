'use client';

import { useState, useTransition } from 'react';
import { createStickerOrder } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
}

export function CheckoutForm({ onSuccess }: CheckoutFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (formData: FormData) => {
    const input = {
      recipientName: String(formData.get('recipientName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      addressLine: String(formData.get('addressLine') ?? ''),
      city: String(formData.get('city') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      notes: String(formData.get('notes') ?? ''),
    };

    setErrors({});
    startTransition(async () => {
      try {
        const order = await createStickerOrder(input);
        onSuccess(order.id);
      } catch (error) {
        setErrors({
          form: error instanceof Error ? error.message : 'Terjadi kesalahan',
        });
      }
    });
  };

  const getError = (field: string) => errors[field] || errors.form;

  return (
    <form action={handleSubmit} className="space-y-4" aria-live="polite">
      {errors.form && (
        <div
          className="p-3 text-sm text-red-700 bg-red-50 rounded-md border border-red-200"
          role="alert"
        >
          {errors.form}
        </div>
      )}

      <div>
        <Label htmlFor="recipientName" className="required">
          Nama Penerima
        </Label>
        <Input
          id="recipientName"
          name="recipientName"
          required
          placeholder="Contoh: Budi Santoso"
          maxLength={100}
          aria-invalid={!!errors.recipientName}
          aria-describedby={
            errors.recipientName ? 'recipientName-error' : undefined
          }
          aria-required="true"
          autoComplete="name"
        />
        {errors.recipientName && (
          <span id="recipientName-error" className="sr-only">
            {errors.recipientName}
          </span>
        )}
      </div>

      <div>
        <Label htmlFor="phone" className="required">
          Nomor WhatsApp
        </Label>
        <Input
          id="phone"
          name="phone"
          required
          placeholder="628123456789"
          maxLength={20}
          inputMode="tel"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? 'phone-error' : undefined}
          aria-required="true"
          autoComplete="tel"
        />
        {errors.phone && (
          <span id="phone-error" className="sr-only">
            {errors.phone}
          </span>
        )}
      </div>

      <div>
        <Label htmlFor="addressLine" className="required">
          Alamat Lengkap
        </Label>
        <Textarea
          id="addressLine"
          name="addressLine"
          required
          rows={4}
          placeholder="Jalan, nomor rumah, RT/RW, kecamatan, patokan"
          maxLength={500}
          aria-invalid={!!errors.addressLine}
          aria-describedby={
            errors.addressLine ? 'addressLine-error' : undefined
          }
          aria-required="true"
        />
        {errors.addressLine && (
          <span id="addressLine-error" className="sr-only">
            {errors.addressLine}
          </span>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="city" className="required">
            Kota
          </Label>
          <Input
            id="city"
            name="city"
            required
            placeholder="Makassar"
            maxLength={100}
            aria-invalid={!!errors.city}
            aria-describedby={errors.city ? 'city-error' : undefined}
            aria-required="true"
            autoComplete="address-level2"
          />
          {errors.city && (
            <span id="city-error" className="sr-only">
              {errors.city}
            </span>
          )}
        </div>
        <div>
          <Label htmlFor="postalCode" className="required">
            Kode Pos
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            required
            placeholder="90111"
            maxLength={10}
            inputMode="numeric"
            aria-invalid={!!errors.postalCode}
            aria-describedby={
              errors.postalCode ? 'postalCode-error' : undefined
            }
            aria-required="true"
            autoComplete="postal-code"
          />
          {errors.postalCode && (
            <span id="postalCode-error" className="sr-only">
              {errors.postalCode}
            </span>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Contoh: kirim sore hari, warna helm, atau kebutuhan khusus lainnya"
          maxLength={300}
        />
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