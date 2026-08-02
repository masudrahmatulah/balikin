'use client';

import { useState, useTransition, useEffect } from 'react';
import { createStickerOrder } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ProductKey } from '@/lib/product-catalog';
import { Loader2 } from 'lucide-react';

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
  productKey: ProductKey;
  onShippingCostChange: (cost: number, courier: string, cityId: string, cityName: string) => void;
  shippingCost: number | null;
  shippingCourier: string;
  destinationCityId: string;
  destinationCityName: string;
}

type FieldErrors = Record<string, string>;

interface Province {
  province_id: string;
  province: string;
}

interface City {
  city_id: string;
  city_name: string;
  province: string;
  postal_code: string;
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1 text-xs text-red-600" role="alert">
      {message}
    </p>
  );
}

export function CheckoutForm({
  onSuccess,
  productKey,
  onShippingCostChange,
  shippingCost,
  shippingCourier,
  destinationCityId,
  destinationCityName,
}: CheckoutFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [segment, setSegment] = useState('');
  const [isPending, startTransition] = useTransition();

  // Shipping state
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCourier, setSelectedCourier] = useState('');
  const [isLoadingProvinces, setIsLoadingProvinces] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isCheckingShipping, setIsCheckingShipping] = useState(false);
  const [shippingError, setShippingError] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    const loadProvinces = async () => {
      setIsLoadingProvinces(true);
      try {
        const response = await fetch('/api/shipping?type=provinces');
        if (!response.ok) throw new Error('Failed to load provinces');
        const data = await response.json();
        if (data.success) {
          setProvinces(data.data || []);
        }
      } catch (error) {
        console.error('Error loading provinces:', error);
      } finally {
        setIsLoadingProvinces(false);
      }
    };
    loadProvinces();
  }, []);

  // Load cities when province changes
  const handleProvinceChange = async (provinceId: string) => {
    setSelectedProvince(provinceId);
    setSelectedCity('');
    setCities([]);
    setIsLoadingCities(true);
    setShippingError(null);

    try {
      const response = await fetch(`/api/shipping?type=cities&province=${provinceId}`);
      if (!response.ok) throw new Error('Failed to load cities');
      const data = await response.json();
      if (data.success) {
        setCities(data.data || []);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setShippingError('Gagal memuat daftar kota');
    } finally {
      setIsLoadingCities(false);
    }
  };

  // Check shipping cost
  const handleCheckShipping = async () => {
    if (!selectedCity || !selectedCourier) {
      setShippingError('Pilih kota dan kurir terlebih dahulu');
      return;
    }

    setIsCheckingShipping(true);
    setShippingError(null);

    try {
      const response = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destinationCityId: selectedCity,
          courier: selectedCourier,
        }),
      });

      if (!response.ok) throw new Error('Failed to check shipping cost');
      const data = await response.json();

      if (data.success) {
        const selectedCityData = cities.find((c) => c.city_id === selectedCity);
        onShippingCostChange(
          data.data.cost,
          selectedCourier,
          selectedCity,
          selectedCityData?.city_name || ''
        );
      } else {
        setShippingError('Gagal menghitung ongkir');
      }
    } catch (error) {
      console.error('Error checking shipping:', error);
      setShippingError('Gagal menghitung ongkir. Coba lagi');
    } finally {
      setIsCheckingShipping(false);
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    // Validate shipping cost is selected
    if (shippingCost === null) {
      setFormError('Pilih ongkir terlebih dahulu');
      return;
    }

    const input = {
      recipientName: String(formData.get('recipientName') ?? ''),
      phone: String(formData.get('phone') ?? ''),
      addressLine: String(formData.get('addressLine') ?? ''),
      postalCode: String(formData.get('postalCode') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      segment,
      voucherCode: String(formData.get('voucherCode') ?? ''),
      productKey,
      shippingCost,
      shippingCourier,
      destinationCityId,
      destinationCityName,
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

      {/* Provinsi */}
      <div>
        <Label htmlFor="province">
          Provinsi <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange} disabled={isLoadingProvinces}>
          <SelectTrigger
            id="province"
            aria-invalid={!!fieldErrors.province}
            aria-describedby={fieldErrors.province ? 'province-error' : undefined}
          >
            <SelectValue placeholder={isLoadingProvinces ? 'Memuat...' : 'Pilih Provinsi'} />
          </SelectTrigger>
          <SelectContent>
            {provinces.map((prov) => (
              <SelectItem key={prov.province_id} value={prov.province_id}>
                {prov.province}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="province-error" message={fieldErrors.province} />
      </div>

      {/* Kota */}
      <div>
        <Label htmlFor="city">
          Kota <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={selectedCity} onValueChange={setSelectedCity} disabled={isLoadingCities || !selectedProvince}>
          <SelectTrigger
            id="city"
            aria-invalid={!!fieldErrors.city}
            aria-describedby={fieldErrors.city ? 'city-error' : undefined}
          >
            <SelectValue
              placeholder={!selectedProvince ? 'Pilih provinsi dulu' : isLoadingCities ? 'Memuat...' : 'Pilih Kota'}
            />
          </SelectTrigger>
          <SelectContent>
            {cities.map((city) => (
              <SelectItem key={city.city_id} value={city.city_id}>
                {city.city_name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <FieldError id="city-error" message={fieldErrors.city} />
      </div>

      {/* Kurir */}
      <div>
        <Label htmlFor="courier">
          Kurir Pengiriman <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={selectedCourier} onValueChange={setSelectedCourier}>
          <SelectTrigger
            id="courier"
            aria-invalid={!!fieldErrors.courier}
            aria-describedby={fieldErrors.courier ? 'courier-error' : undefined}
          >
            <SelectValue placeholder="Pilih Kurir" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jne">JNE</SelectItem>
            <SelectItem value="tiki">TIKI</SelectItem>
            <SelectItem value="pos">POS Indonesia</SelectItem>
          </SelectContent>
        </Select>
        <FieldError id="courier-error" message={fieldErrors.courier} />
      </div>

      {/* Tombol Cek Ongkir */}
      <div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={!selectedCity || !selectedCourier || isCheckingShipping}
          onClick={handleCheckShipping}
          aria-busy={isCheckingShipping}
        >
          {isCheckingShipping ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
              Menghitung...
            </>
          ) : (
            'Cek Ongkir'
          )}
        </Button>
        {shippingError && (
          <p className="mt-1 text-xs text-red-600" role="alert">
            {shippingError}
          </p>
        )}
      </div>

      {/* Kode Pos (dari dropdown kota jika ada) */}
      {selectedCity && (
        <div>
          <Label htmlFor="postalCode">
            Kode Pos <span className="text-red-500" aria-hidden="true">*</span>
          </Label>
          <Input
            id="postalCode"
            name="postalCode"
            required
            defaultValue={cities.find((c) => c.city_id === selectedCity)?.postal_code || ''}
            placeholder="90111"
            maxLength={10}
            inputMode="numeric"
            autoComplete="postal-code"
            aria-invalid={!!fieldErrors.postalCode}
            aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
          />
          <FieldError id="postalCode-error" message={fieldErrors.postalCode} />
        </div>
      )}

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
