/**
 * Email Service for Balikin
 * Development version: Logs to console
 * Production: Can be upgraded to Resend or Nodemailer
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

/**
 * Send email using the configured service
 * Currently uses console.log for development
 * TODO: Integrate with Resend or Nodemailer for production
 */
export async function sendEmail({ to, subject, html }: EmailOptions): Promise<void> {
  // Development: Log to console
  console.log('════════════════════════════════════════════════════════════');
  console.log(`📧 EMAIL SERVICE`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`════════════════════════════════════════════════════════════`);
  console.log(html);
  console.log('════════════════════════════════════════════════════════════');

  // Production: Use Resend
  // if (process.env.RESEND_API_KEY) {
  //   const { Resend } = await import('resend');
  //   const resend = new Resend(process.env.RESEND_API_KEY);
  //   await resend.emails.send({
  //     from: 'Balikin <noreply@balikin.id>',
  //     to,
  //     subject,
  //     html,
  //   });
  //   return;
  // }

  // Production: Use Nodemailer
  // if (process.env.SMTP_HOST) {
  //   const nodemailer = await import('nodemailer');
  //   const transporter = nodemailer.createTransporter({
  //     host: process.env.SMTP_HOST,
  //     port: parseInt(process.env.SMTP_PORT || '587'),
  //     secure: false,
  //     auth: {
  //       user: process.env.SMTP_USER,
  //       pass: process.env.SMTP_PASSWORD,
  //     },
  //   });
  //   await transporter.sendMail({ from: process.env.SMTP_FROM, to, subject, html });
  //   return;
  // }
}

/**
 * Generate OTP email template
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
      <p class="message">${message}</p>
      <div class="otp-container">
        <div class="otp">${otp.split('').join(' ')}</div>
      </div>
      <div class="warning">
        <p class="warning-text">⚠️ Kode ini berlaku selama 5 menit. Jangan bagikan kode ini kepada siapa pun, termasuk pihak Balikin.</p>
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

/**
 * Send OTP email
 */
export async function sendOTPEmail({ email, otp, type }: OTPEmailOptions): Promise<void> {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV OTP] type=${type} email=${email} otp=${otp}`);
  }
  const { subject, html } = generateOTPEmail({ email, otp, type });
  await sendEmail({ to: email, subject, html });
}
