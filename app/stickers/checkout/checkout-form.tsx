'use client';

import { useState, useTransition, useEffect } from 'react';
import Image from 'next/image';
import { createStickerOrder } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type ProductKey } from '@/lib/product-catalog';
import { Loader2, ImagePlus, Trash2 } from 'lucide-react';
import { type StickerColorTheme } from '@/lib/sticker-color-themes';

interface CheckoutFormProps {
  onSuccess: (orderId: string) => void;
  productKey: ProductKey;
  stickerColorTheme: StickerColorTheme;
  onShippingCostChange: (cost: number, courier: string, cityId: string, cityName: string) => void;
  shippingCost: number | null;
  shippingCourier: string;
  destinationCityId: string;
  destinationCityName: string;
  backsideCustom: boolean;
  backsideCustomImageUrl: string;
  onBacksideChange: (custom: boolean, imageUrl: string) => void;
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
    <p id={id} className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
      {message}
    </p>
  );
}

export function CheckoutForm({
  onSuccess,
  productKey,
  stickerColorTheme,
  onShippingCostChange,
  shippingCost,
  shippingCourier,
  destinationCityId,
  destinationCityName,
  backsideCustom,
  backsideCustomImageUrl,
  onBacksideChange,
}: CheckoutFormProps) {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [segment, setSegment] = useState('');
  const [isPending, startTransition] = useTransition();
  const [isUploadingBackside, setIsUploadingBackside] = useState(false);
  const [backsideUploadError, setBacksideUploadError] = useState<string | null>(null);

  const isAcrylic = productKey === 'armor-tag';

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

  const handleBacksideFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingBackside(true);
    setBacksideUploadError(null);
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/upload/custom-backside', {
        method: 'POST',
        body,
      });
      const data = await response.json();
      if (!response.ok || !data.url) {
        throw new Error(data.error || 'Gagal mengupload gambar');
      }
      onBacksideChange(true, data.url);
    } catch (error) {
      setBacksideUploadError(error instanceof Error ? error.message : 'Gagal mengupload gambar');
    } finally {
      setIsUploadingBackside(false);
      e.target.value = '';
    }
  };

  const handleSubmit = async (formData: FormData) => {
    setFieldErrors({});
    setFormError(null);

    if (isAcrylic && backsideCustom && !backsideCustomImageUrl) {
      setFormError('Upload gambar custom untuk sisi belakang terlebih dahulu');
      return;
    }

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
      stickerColorTheme,
      shippingCost,
      shippingCourier,
      destinationCityId,
      destinationCityName,
      backsideCustom: isAcrylic ? backsideCustom : false,
      backsideCustomImageUrl: isAcrylic ? backsideCustomImageUrl : '',
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
          className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
          aria-atomic="true"
        >
          {formError}
        </div>
      )}

      {/* Nama Penerima */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="recipientName">
          Nama Penerima <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Input
          id="recipientName"
          name="recipientName"
          required
          placeholder="Contoh: Budi Santoso"
          maxLength={100}
          autoComplete="name"
          className="mt-1 border-slate-200 bg-white/80 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/50"
          aria-invalid={!!fieldErrors.recipientName}
          aria-describedby={fieldErrors.recipientName ? 'recipientName-error' : undefined}
        />
        <FieldError id="recipientName-error" message={fieldErrors.recipientName} />
      </div>

      {/* Nomor WhatsApp */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="phone">
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
          className="mt-1 border-slate-200 bg-white/80 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/50"
          aria-invalid={!!fieldErrors.phone}
          aria-describedby={fieldErrors.phone ? 'phone-error' : 'phone-hint'}
        />
        <p id="phone-hint" className="mt-1 text-xs text-gray-500 dark:text-slate-400">
          Format: 628xxxxxxxxxx (tanpa tanda + atau 0 di depan)
        </p>
        <FieldError id="phone-error" message={fieldErrors.phone} />
      </div>

      {/* Segmentasi CRM — wajib untuk pipeline B2B (checkout.md Section 1) */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="segment">
          Produk ini untuk kepentingan? <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={segment} onValueChange={setSegment} required>
          <SelectTrigger
            className="mt-1 h-11 w-full border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-950/50"
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
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="addressLine">
          Alamat Lengkap <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Textarea
          id="addressLine"
          name="addressLine"
          required
          rows={4}
          placeholder="Jalan, nomor rumah, RT/RW, kecamatan, patokan"
          maxLength={500}
          className="mt-1 border-slate-200 bg-white/80 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/50"
          aria-invalid={!!fieldErrors.addressLine}
          aria-describedby={fieldErrors.addressLine ? 'addressLine-error' : undefined}
        />
        <FieldError id="addressLine-error" message={fieldErrors.addressLine} />
      </div>

      {/* Provinsi */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="province">
          Provinsi <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={selectedProvince} onValueChange={handleProvinceChange} disabled={isLoadingProvinces}>
          <SelectTrigger
            className="mt-1 h-11 w-full border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-950/50"
            id="province"
            aria-invalid={!!fieldErrors.province}
            aria-describedby={fieldErrors.province ? 'province-error' : undefined}
          >
            <SelectValue placeholder={isLoadingProvinces ? 'Memuat...' : 'Pilih Provinsi'}>
              {(value: string) => provinces.find((prov) => prov.province_id === value)?.province ?? ''}
            </SelectValue>
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
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="city">
          Kota <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={selectedCity} onValueChange={setSelectedCity} disabled={isLoadingCities || !selectedProvince}>
          <SelectTrigger
            className="mt-1 h-11 w-full border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-950/50"
            id="city"
            aria-invalid={!!fieldErrors.city}
            aria-describedby={fieldErrors.city ? 'city-error' : undefined}
          >
            <SelectValue
              placeholder={!selectedProvince ? 'Pilih provinsi dulu' : isLoadingCities ? 'Memuat...' : 'Pilih Kota'}
            >
              {(value: string) => cities.find((city) => city.city_id === value)?.city_name ?? ''}
            </SelectValue>
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
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="courier">
          Kurir Pengiriman <span className="text-red-500" aria-hidden="true">*</span>
        </Label>
        <Select value={selectedCourier} onValueChange={setSelectedCourier}>
          <SelectTrigger
            className="mt-1 h-11 w-full border-slate-200 bg-white/80 dark:border-slate-700 dark:bg-slate-950/50"
            id="courier"
            aria-invalid={!!fieldErrors.courier}
            aria-describedby={fieldErrors.courier ? 'courier-error' : undefined}
          >
            <SelectValue placeholder="Pilih Kurir">
              {(value: string) =>
                value === 'jne' ? 'JNE' : value === 'tiki' ? 'TIKI' : value === 'pos' ? 'POS Indonesia' : ''
              }
            </SelectValue>
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
          className="w-full border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-300 dark:hover:bg-blue-950/60"
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
          <p className="mt-1 text-xs text-red-600 dark:text-red-400" role="alert">
            {shippingError}
          </p>
        )}
      </div>

      {/* Kode Pos (dari dropdown kota jika ada) */}
      {selectedCity && (
        <div>
          <Label className="text-slate-700 dark:text-slate-200" htmlFor="postalCode">
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
            className="mt-1 border-slate-200 bg-white/80 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/50"
            aria-invalid={!!fieldErrors.postalCode}
            aria-describedby={fieldErrors.postalCode ? 'postalCode-error' : undefined}
          />
          <FieldError id="postalCode-error" message={fieldErrors.postalCode} />
        </div>
      )}

      {/* Kode Voucher (opsional) */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="voucherCode">Kode Voucher (Opsional)</Label>
        <Input
          id="voucherCode"
          name="voucherCode"
          placeholder="Contoh: BALIKIN2025"
          maxLength={50}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          className="mt-1 border-slate-200 bg-white/80 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/50"
          aria-invalid={!!fieldErrors.voucherCode}
          aria-describedby={fieldErrors.voucherCode ? 'voucherCode-error' : undefined}
          style={{ textTransform: 'uppercase' }}
        />
        <FieldError id="voucherCode-error" message={fieldErrors.voucherCode} />
      </div>

      {/* Catatan Tambahan */}
      <div>
        <Label className="text-slate-700 dark:text-slate-200" htmlFor="notes">Catatan Tambahan (Opsional)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Contoh: kirim sore hari, warna helm, atau kebutuhan khusus lainnya"
          maxLength={300}
          className="mt-1 border-slate-200 bg-white/80 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950/50"
          aria-invalid={!!fieldErrors.notes}
          aria-describedby={fieldErrors.notes ? 'notes-error' : undefined}
        />
        <FieldError id="notes-error" message={fieldErrors.notes} />
      </div>

      {isAcrylic && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20">
          <div className="flex items-start justify-between gap-3">
            <div>
              <Label className="text-slate-800 dark:text-slate-100" htmlFor="backsideCustom">
                Custom Image Sisi Belakang
              </Label>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Tanpa custom: sisi belakang menggunakan logo Balikin. Dengan custom: sisi depan QR code, sisi
                belakang gambar Anda. Biaya tambahan <span className="font-semibold text-amber-700 dark:text-amber-400">Rp10.000</span>.
              </p>
            </div>
            <Switch
              id="backsideCustom"
              checked={backsideCustom}
              onCheckedChange={(checked) => {
                onBacksideChange(checked, checked ? backsideCustomImageUrl : '');
              }}
            />
          </div>

          {backsideCustom && (
            <div className="mt-4">
              {backsideCustomImageUrl ? (
                <div className="flex items-center gap-3">
                  <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700">
                    <Image
                      src={backsideCustomImageUrl}
                      alt="Pratinjau gambar custom sisi belakang"
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300">Gambar custom siap digunakan.</p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => onBacksideChange(true, '')}
                      className="w-fit border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
                      Ganti / Hapus
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <label
                    htmlFor="backsideFile"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-white/60 px-4 py-6 text-sm font-medium text-amber-700 transition-colors hover:border-amber-400 hover:bg-amber-50 dark:border-amber-700 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-950/40"
                  >
                    {isUploadingBackside ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                        Mengupload gambar...
                      </>
                    ) : (
                      <>
                        <ImagePlus className="h-4 w-4" aria-hidden="true" />
                        Pilih gambar (JPG, PNG, WebP — maks 5MB)
                      </>
                    )}
                  </label>
                  <Input
                    id="backsideFile"
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={isUploadingBackside}
                    onChange={handleBacksideFileChange}
                  />
                  {backsideUploadError && (
                    <p className="mt-2 text-xs text-red-600 dark:text-red-400" role="alert">
                      {backsideUploadError}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <Button
        type="submit"
        className="w-full border-0 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-900/20 hover:from-orange-600 hover:to-amber-600 focus-visible:ring-orange-500"
        disabled={isPending}
        aria-busy={isPending}
      >
        {isPending ? 'Memproses...' : 'Lanjutkan ke Instruksi Pembayaran'}
      </Button>
    </form>
  );
}
