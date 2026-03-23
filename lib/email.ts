/**
 * Email Service for Balikin
 * Development mode logs email content to the console.
 * Production mode sends via Resend HTTP API when RESEND_API_KEY is configured.
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface OTPEmailOptions {
  email: string;
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
}

interface ScanAlertEmailOptions {
  email: string;
  tagName: string;
  scannedAt: Date | string | null;
  city?: string | null;
  deviceInfo?: string | null;
  tagUrl?: string | null;
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

/**
 * Send email using the configured service.
 * Uses Resend HTTP API in production, otherwise logs to the console.
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  const { NODE_ENV, RESEND_API_KEY, EMAIL_FROM } = process.env;

  if (NODE_ENV !== 'production' || !RESEND_API_KEY) {
    console.log('============================================================');
    console.log('[EMAIL SERVICE]');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(html);
    console.log('============================================================');
    return;
  }

  const from = EMAIL_FROM || 'Balikin <noreply@balikin.id>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [to],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Resend request failed: ${response.status} ${text}`);
  }
}

/**
 * Generate OTP email template.
 */
export function generateOTPEmail({ email, otp, type }: OTPEmailOptions): { subject: string; html: string } {
  const subjectByType = {
    'sign-in': 'Kode Masuk Balikin',
    'email-verification': 'Verifikasi Email Balikin',
    'forget-password': 'Reset Password Balikin',
  };

  const messageByType = {
    'sign-in': 'Berikut adalah kode masuk untuk akun Anda:',
    'email-verification': 'Berikut adalah kode verifikasi untuk akun Anda:',
    'forget-password': 'Berikut adalah kode reset password untuk akun Anda:',
  };

  const subject = subjectByType[type];
  const message = messageByType[type];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 24px; }
    .title { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 16px; }
    .message { color: #4b5563; line-height: 1.6; margin-bottom: 24px; }
    .otp-container { background: #f3f4f6; padding: 24px; text-align: center; border-radius: 8px; margin-bottom: 24px; }
    .otp { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #2563eb; }
    .footer { color: #9ca3af; font-size: 14px; text-align: center; margin-top: 32px; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px; }
    .warning-text { color: #92400e; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">Balikin</div>
      <h1 class="title">${subject}</h1>
      <p class="message">Email tujuan: ${email}</p>
      <p class="message">${message}</p>
      <div class="otp-container">
        <div class="otp">${otp.split('').join(' ')}</div>
      </div>
      <div class="warning">
        <p class="warning-text">Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun, termasuk pihak Balikin.</p>
      </div>
      <p class="message">Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
      <div class="footer">
        <p>&copy; ${new Date().getFullYear()} Balikin. Smart Lost & Found QR Tag.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}

export function generateScanAlertEmail({
  tagName,
  scannedAt,
  city,
  deviceInfo,
  tagUrl,
}: Omit<ScanAlertEmailOptions, 'email'>): { subject: string; html: string } {
  const subject = `Alert scan Balikin: "${tagName}" baru saja di-scan`;
  const location = city || 'Lokasi tidak diketahui';
  const timeLabel = formatScanTime(scannedAt);
  const deviceLabel = deviceInfo || 'Perangkat tidak diketahui';
  const cta = tagUrl
    ? `<a href="${tagUrl}" style="display:inline-block;background:#2563eb;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">Buka Detail Tag</a>`
    : '';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background: #f8fafc; color: #0f172a; }
    .container { max-width: 600px; margin: 0 auto; padding: 32px 16px; }
    .card { background: #fff; border-radius: 16px; padding: 32px; box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08); }
    .eyebrow { color: #2563eb; font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; font-weight: 700; }
    .title { font-size: 24px; margin: 12px 0 8px; }
    .text { color: #475569; line-height: 1.7; margin: 0 0 16px; }
    .info { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 18px; margin: 20px 0; }
    .info-row { margin: 0 0 10px; color: #1e293b; }
    .footer { color: #94a3b8; font-size: 13px; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="eyebrow">Scan Alert</div>
      <h1 class="title">Tag "${tagName}" baru saja di-scan</h1>
      <p class="text">Seseorang membuka halaman tag Anda saat mode hilang aktif. Berikut detail scan terbaru yang berhasil kami catat.</p>
      <div class="info">
        <p class="info-row"><strong>Waktu scan:</strong> ${timeLabel}</p>
        <p class="info-row"><strong>Lokasi kasar:</strong> ${location}</p>
        <p class="info-row"><strong>Perangkat:</strong> ${deviceLabel}</p>
      </div>
      <p class="text">Jika barang ini memang sedang Anda cari, segera cek detail tag dan pastikan kontak Anda tetap aktif.</p>
      ${cta}
      <p class="footer">&copy; ${new Date().getFullYear()} Balikin. Notifikasi ini dikirim otomatis karena alert scan aktif pada tag Anda.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  return { subject, html };
}

/**
 * Send OTP email.
 */
export async function sendOTPEmail({ email, otp, type }: OTPEmailOptions): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV OTP] type=${type} email=${email} otp=${otp}`);
  }
  const { subject, html } = generateOTPEmail({ email, otp, type });
  await sendEmail({ to: email, subject, html });
}

export async function sendScanAlertEmail(options: ScanAlertEmailOptions): Promise<void> {
  const { email, ...templateOptions } = options;
  const { subject, html } = generateScanAlertEmail(templateOptions);
  await sendEmail({ to: email, subject, html });
}
