/**
 * WhatsApp service for Balikin.
 * Supports standard and priority channels for scan alerts.
 */

export type WhatsAppChannel = 'standard' | 'priority';
export type WhatsAppProvider = 'fonnte_standard' | 'fonnte_priority' | 'mock';

interface WhatsAppOTPOptions {
  phoneNumber: string;
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
  name?: string;
}

interface ScanAlertWhatsAppOptions {
  phoneNumber: string;
  tagName: string;
  scannedAt: Date | string | null;
  city?: string | null;
  deviceInfo?: string | null;
  tagUrl?: string | null;
  channel?: WhatsAppChannel;
}

interface FonnteResponse {
  status: boolean;
  message?: string;
  data?: unknown;
  id?: string;
}

interface WhatsAppProviderConfig {
  channel: WhatsAppChannel;
  provider: WhatsAppProvider;
  token?: string;
  deviceId?: string;
  baseUrl: string;
}

export interface WhatsAppSendResult {
  success: boolean;
  channel: WhatsAppChannel;
  provider: WhatsAppProvider;
  providerMessageId?: string;
  error?: string;
}

export function formatIndonesianPhoneNumber(input: string): string {
  let cleaned = input.replace(/\D/g, '');

  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  }

  const indonesiaPhoneRegex = /^62[0-9]{8,12}$/;
  if (!indonesiaPhoneRegex.test(cleaned)) {
    throw new Error('Format nomor WhatsApp tidak valid. Gunakan format: 08123456789 atau 628123456789');
  }

  return cleaned;
}

function formatScanTime(value: Date | string | null): string {
  if (!value) {
    return 'Waktu scan tidak tersedia';
  }

  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Makassar',
  }).format(date);
}

function generateWhatsAppOTPMessage({ otp, type, name }: WhatsAppOTPOptions): string {
  const greeting = name ? `Hai ${name},` : 'Hai,';

  const messages = {
    'sign-in': `${greeting}

Berikut adalah kode masuk untuk akun Balikin Anda:

*${otp.split('').join(' ')}*

Kode ini berlaku selama 5 menit.

JANGAN bagikan kode ini kepada siapa pun, termasuk pihak Balikin.

Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan pesan ini.

Balikin - Smart Lost & Found QR Tag`,

    'email-verification': `${greeting}

Berikut adalah kode verifikasi untuk akun Balikin Anda:

*${otp.split('').join(' ')}*

Kode ini berlaku selama 5 menit.

JANGAN bagikan kode ini kepada siapa pun.

Balikin - Smart Lost & Found QR Tag`,

    'forget-password': `${greeting}

Berikut adalah kode reset password untuk akun Balikin Anda:

*${otp.split('').join(' ')}*

Kode ini berlaku selama 5 menit.

JANGAN bagikan kode ini kepada siapa pun.

Balikin - Smart Lost & Found QR Tag`,
  };

  return messages[type];
}

function generateScanAlertWhatsAppMessage({
  tagName,
  scannedAt,
  city,
  deviceInfo,
  tagUrl,
}: Omit<ScanAlertWhatsAppOptions, 'phoneNumber' | 'channel'>): string {
  const lines = [
    'Balikin Scan Alert',
    '',
    `Tag *${tagName}* baru saja di-scan saat mode hilang aktif.`,
    '',
    `Waktu: ${formatScanTime(scannedAt)}`,
    `Lokasi kasar: ${city || 'Lokasi tidak diketahui'}`,
    `Perangkat: ${deviceInfo || 'Perangkat tidak diketahui'}`,
  ];

  if (tagUrl) {
    lines.push('', `Lihat detail tag: ${tagUrl}`);
  }

  lines.push('', 'Cek tag Anda segera jika barang ini masih dicari.');

  return lines.join('\n');
}

function resolveChannelProvider(channel: WhatsAppChannel): WhatsAppProviderConfig {
  const standardProvider = process.env.WHATSAPP_PROVIDER_STANDARD || 'fonnte_standard';
  const priorityProvider = process.env.WHATSAPP_PROVIDER_PRIORITY || 'fonnte_priority';

  if (channel === 'priority') {
    if (priorityProvider === 'mock') {
      return {
        channel,
        provider: 'mock',
        baseUrl: process.env.FONNTE_PRIORITY_BASE_URL || process.env.FONNTE_BASE_URL || 'https://api.fonnte.com',
      };
    }

    return {
      channel,
      provider: 'fonnte_priority',
      token: process.env.FONNTE_PRIORITY_API_TOKEN || process.env.FONNTE_API_TOKEN,
      deviceId: process.env.FONNTE_PRIORITY_DEVICE_ID || process.env.FONNTE_DEVICE_ID,
      baseUrl: process.env.FONNTE_PRIORITY_BASE_URL || process.env.FONNTE_BASE_URL || 'https://api.fonnte.com',
    };
  }

  if (standardProvider === 'mock') {
    return {
      channel,
      provider: 'mock',
      baseUrl: process.env.FONNTE_BASE_URL || 'https://api.fonnte.com',
    };
  }

  return {
    channel,
    provider: 'fonnte_standard',
    token: process.env.FONNTE_API_TOKEN,
    deviceId: process.env.FONNTE_DEVICE_ID,
    baseUrl: process.env.FONNTE_BASE_URL || 'https://api.fonnte.com',
  };
}

async function sendFonnteMessage(
  phoneNumber: string,
  message: string,
  label: string,
  config: WhatsAppProviderConfig,
): Promise<WhatsAppSendResult> {
  const { NODE_ENV, FORCE_SEND_WHATSAPP } = process.env;
  const formattedPhone = formatIndonesianPhoneNumber(phoneNumber);
  const token = config.token;

  if (!token && NODE_ENV === 'production' && config.provider !== 'mock') {
    throw new Error(`${config.provider} token is required in production`);
  }

  // Check if we should send real WhatsApp (production mode or force send)
  const shouldSendRealWhatsApp = NODE_ENV === 'production' || FORCE_SEND_WHATSAPP === 'true';

  if (!shouldSendRealWhatsApp || !token || config.provider === 'mock') {
    console.log('============================================================');
    console.log(`[WHATSAPP ${label}]`);
    console.log(`Channel: ${config.channel}`);
    console.log(`Provider: ${config.provider}`);
    console.log(`Phone: ${formattedPhone}`);
    console.log(message);
    console.log('============================================================');
    console.log('');
    console.log('💡 TIP: Set FORCE_SEND_WHATSAPP=true di .env.local untuk kirim WhatsApp asli di development');
    console.log('');

    return {
      success: true,
      channel: config.channel,
      provider: config.provider,
    };
  }

  const formData = new URLSearchParams();
  formData.append('target', formattedPhone);
  formData.append('message', message);
  if (config.deviceId) {
    formData.append('deviceId', config.deviceId);
  }
  formData.append('countryCode', '62');

  const endpoint = `${config.baseUrl}/send`;
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: token,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });

  const result: FonnteResponse = await response.json();
  if (!result.status) {
    throw new Error(result.message || `Gagal mengirim WhatsApp ${label.toLowerCase()}`);
  }

  console.log(`[WHATSAPP ${label}] ✅ Message sent successfully via Fonnte`);

  return {
    success: true,
    channel: config.channel,
    provider: config.provider,
    providerMessageId: result.id,
  };
}

export async function sendWhatsAppOTP(options: WhatsAppOTPOptions): Promise<void> {
  const message = generateWhatsAppOTPMessage(options);
  const config = resolveChannelProvider('standard');
  await sendFonnteMessage(options.phoneNumber, message, 'OTP', config);
}

export async function sendScanAlertWhatsApp(options: ScanAlertWhatsAppOptions): Promise<WhatsAppSendResult> {
  const { phoneNumber, channel = 'standard', ...templateOptions } = options;
  const message = generateScanAlertWhatsAppMessage(templateOptions);
  const config = resolveChannelProvider(channel);

  try {
    return await sendFonnteMessage(phoneNumber, message, 'SCAN ALERT', config);
  } catch (error) {
    return {
      success: false,
      channel,
      provider: config.provider,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}

export function isFonnteConfigured(): boolean {
  return !!process.env.FONNTE_API_TOKEN;
}

export async function getFonnteDeviceStatus(): Promise<{ status: boolean; devices?: unknown[] }> {
  const { FONNTE_API_TOKEN, FONNTE_BASE_URL } = process.env;

  if (!FONNTE_API_TOKEN) {
    return { status: false };
  }

  try {
    const response = await fetch(`${FONNTE_BASE_URL || 'https://api.fonnte.com'}/get-devices`, {
      method: 'GET',
      headers: {
        Authorization: FONNTE_API_TOKEN,
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[Fonnte] Error getting device status:', error);
    return { status: false };
  }
}

// ============================================================================
// MODULE REQUEST NOTIFICATIONS
// ============================================================================

interface ModuleRequestNotificationOptions {
  userName: string;
  userEmail: string;
  moduleType: string;
  reason?: string;
}

interface ModuleApprovedNotificationOptions {
  phoneNumber: string;
  userName: string;
  moduleType: string;
}

interface ModuleRejectedNotificationOptions {
  phoneNumber: string;
  userName: string;
  moduleType: string;
  rejectionReason?: string;
}

function getModuleDisplayName(moduleType: string): string {
  const names: Record<string, string> = {
    student: 'Student Kit',
    otomotif: 'Otomotif',
    pertanian: 'Pertanian',
    diklat: 'Diklat B2B',
  };
  return names[moduleType] || moduleType;
}

function getModuleBenefits(moduleType: string): string {
  const benefits: Record<string, string> = {
    student: `✓ Kelola jadwal kuliah & deadline - hemat 3 jam/minggu!
✓ Notifikasi WhatsApp otomatis sebelum deadline
✓ Bagikan jadwal ke teman dengan satu link
✓ Simpan KTM/KRS sebagai foto digital
✓ Buat vCard profesional untuk networking`,
    otomotif: `✓ Pantau STNK, servis, & klaim asuransi dalam satu tempat
✓ Jadwal ganti oli & servis terkelola otomatis
✓ Riwayat servis terdokumentasi lengkap
✓ Data asuransi & klaim dalam genggaman`,
    pertanian: `✓ Kalkulator HST otomatis untuk umur tanaman
✓ Jadwal pemupukan tepat waktu
✓ Catatan panen & biaya tenaga kerja
✓ Optimalkan hasil panen dengan perencanaan baik`,
    diklat: `✓ Tracking kehadiran peserta real-time
✓ Materi & sertifikat terorganisir per event
✓ QR code untuk check-in peserta
✓ Rundown schedule yang terstruktur`,
  };
  return benefits[moduleType] || '';
}

/**
 * Send module request notification to admin
 */
export async function sendModuleRequestNotificationToAdmin({
  userName,
  userEmail,
  moduleType,
  reason,
}: ModuleRequestNotificationOptions): Promise<WhatsAppSendResult> {
  const moduleDisplayName = getModuleDisplayName(moduleType);
  const timestamp = new Date().toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const message = `🔔 [BALIKIN] Permintaan Modul Baru

User: *${userName}* (${userEmail})
Modul: *${moduleDisplayName}*
${reason ? `Alasan: ${reason}` : ''}

⏰ Waktu: ${timestamp}

➡️ Action: Login ke admin dashboard untuk approve
https://balikin.id/admin/requests

— Balikin Module Requests`;

  const config = resolveChannelProvider('standard');

  try {
    return await sendFonnteMessage(
      process.env.WHATSAPP_ORDER_NUMBER!,
      message,
      'MODULE REQUEST',
      config
    );
  } catch (error) {
    return {
      success: false,
      channel: config.channel,
      provider: config.provider,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}

/**
 * Send module approved notification to user
 */
export async function sendModuleApprovedNotificationToUser({
  phoneNumber,
  userName,
  moduleType,
}: ModuleApprovedNotificationOptions): Promise<WhatsAppSendResult> {
  const moduleDisplayName = getModuleDisplayName(moduleType);
  const benefits = getModuleBenefits(moduleType);

  const message = `✅ [BALIKIN] Modul ${moduleDisplayName} Diaktifkan

Halo *${userName}*! 👋

Selamat! Modul *${moduleDisplayName}* telah diaktifkan untuk akun Anda.

🚀 *Akses sekarang:*
https://balikin.id/dashboard

Nikmati fitur-fiturnya:
${benefits}

— Balikin
Untuk mematikan notifikasi: reply STOP`;

  const config = resolveChannelProvider('standard');

  try {
    return await sendFonnteMessage(phoneNumber, message, 'MODULE APPROVED', config);
  } catch (error) {
    return {
      success: false,
      channel: config.channel,
      provider: config.provider,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}

/**
 * Send module rejected notification to user
 */
export async function sendModuleRejectedNotificationToUser({
  phoneNumber,
  userName,
  moduleType,
  rejectionReason,
}: ModuleRejectedNotificationOptions): Promise<WhatsAppSendResult> {
  const moduleDisplayName = getModuleDisplayName(moduleType);

  const message = `❌ [BALIKIN] Permintaan Modul Ditolak

Halo *${userName}*! 👋

Maaf, permintaan modul *${moduleDisplayName}* ditolak.
${rejectionReason ? `Alasan: ${rejectionReason}` : ''}

💡 *Tips:*
- Pastikan alasan request jelas
- Hubungi admin untuk informasi lebih lanjut
- Coba request lagi di lain waktu

— Balikin`;

  const config = resolveChannelProvider('standard');

  try {
    return await sendFonnteMessage(phoneNumber, message, 'MODULE REJECTED', config);
  } catch (error) {
    return {
      success: false,
      channel: config.channel,
      provider: config.provider,
      error: error instanceof Error ? error.message : 'Unknown WhatsApp error',
    };
  }
}
