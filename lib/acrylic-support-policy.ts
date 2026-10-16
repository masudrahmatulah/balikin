export type SupportDivision = 'admin' | 'customer_service' | string | null | undefined;

export function canUseAcrylicSupport(division: SupportDivision): boolean {
  return division === 'admin' || division === 'customer_service';
}

export function hasTrustedSupportRequest(request: { headers: { get(name: string): string | null }; nextUrl: { origin: string } }, canonicalBaseUrl: string): boolean {
  const contentType = request.headers.get('content-type')?.split(';', 1)[0].trim().toLowerCase();
  const origin = request.headers.get('origin');
  if (contentType !== 'application/json' || !origin) return false;
  try {
    const configuredOrigin = new URL(canonicalBaseUrl).origin;
    const parsedOrigin = new URL(origin).origin;
    return origin === parsedOrigin && parsedOrigin === configuredOrigin && request.nextUrl.origin === configuredOrigin;
  } catch {
    return false;
  }
}

export type AcrylicRecoveryRecord = {
  appId: string;
  productType: string;
  ownerId: string | null;
  claimedAt: Date | null;
  orderId: string | null;
  paymentStatus: string | null;
  batchId: string | null;
  pin: string | null;
};

export function acrylicRecoveryBlockReason(record: AcrylicRecoveryRecord): string | null {
  if (record.appId !== 'balikin_id') return 'Tenant tag tidak valid.';
  if (!record.productType.toLowerCase().includes('acrylic') && !record.productType.toLowerCase().includes('akrilik')) return 'Pemulihan hanya tersedia untuk tag acrylic.';
  if (record.ownerId || record.claimedAt) return 'Tag sudah diklaim; pemulihan mandiri diblokir.';
  if (!record.orderId) return 'Pesanan pembelian belum dapat dipetakan. Eskalasi untuk verifikasi bukti pembelian/reseller.';
  if (record.paymentStatus !== 'paid') return 'Pembayaran belum terverifikasi lunas. Eskalasi ke verifikasi pesanan.';
  if (!record.batchId) return 'Batch aktivasi tidak tersedia. Eskalasi ke tim operasional.';
  if (!record.pin) return 'PIN lama tidak tersedia; PIN tidak dirotasi otomatis. Eskalasi manual.';
  return null;
}
