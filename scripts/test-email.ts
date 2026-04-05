/**
 * Test Email Script for Balikin
 * Run this script to verify email configuration is working correctly
 *
 * Usage:
 *   npx tsx scripts/test-email.ts
 */

import { sendEmail, sendOTPEmail } from '@/lib/email';

interface TestResult {
  success: boolean;
  test: string;
  message: string;
  error?: unknown;
}

const results: TestResult[] = [];

async function runTest(name: string, testFn: () => Promise<void>): Promise<TestResult> {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Running: ${name}`);
  console.log('='.repeat(60));

  try {
    await testFn();
    const result = { success: true, test: name, message: '✅ PASSED' };
    results.push(result);
    console.log(`\n${result.message}`);
    return result;
  } catch (error) {
    const result = { success: false, test: name, message: '❌ FAILED', error };
    results.push(result);
    console.error(`\n${result.message}`, error);
    return result;
  }
}

async function testEnvironmentVariables() {
  const { RESEND_API_KEY, EMAIL_FROM, NODE_ENV } = process.env;

  console.log('Environment Check:');
  console.log('- NODE_ENV:', NODE_ENV);
  console.log('- RESEND_API_KEY:', RESEND_API_KEY ? `${RESEND_API_KEY.slice(0, 8)}...${RESEND_API_KEY.slice(-4)}` : 'NOT SET');
  console.log('- EMAIL_FROM:', EMAIL_FROM || 'NOT SET (will use default)');

  if (!RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set');
  }

  if (!EMAIL_FROM) {
    console.warn('⚠️  EMAIL_FROM not set, will use default: Balikin <noreply@balikin.id>');
  }

  console.log('✅ Environment variables configured');
}

async function testSendSimpleEmail() {
  const testEmail = process.env.TEST_EMAIL_ADDRESS || 'test@example.com';

  await sendEmail({
    to: testEmail,
    subject: '🧪 Test Email dari Balikin',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .card { background: white; border-radius: 12px; padding: 40px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 24px; }
          .success { background: #dcfce7; border-left: 4px solid #22c55e; padding: 16px; margin: 24px 0; border-radius: 4px; }
          .success-text { color: #166534; font-size: 14px; margin: 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="card">
            <div class="logo">✅ Balikin Email Test</div>
            <h1>Tes Konfigurasi Email Berhasil!</h1>
            <p>Jika Anda menerima email ini, konfigurasi email service sudah benar.</p>
            <div class="success">
              <p class="success-text">Environment: ${process.env.NODE_ENV}</p>
              <p class="success-text">Timestamp: ${new Date().toISOString()}</p>
            </div>
            <p>Sistem siap untuk mengirimkan OTP dan notifikasi email lainnya.</p>
          </div>
        </div>
      </body>
      </html>
    `,
  });
}

async function testSendOTPEmail() {
  const testEmail = process.env.TEST_EMAIL_ADDRESS || 'test@example.com';
  const testOTP = '123456'; // Test OTP code

  await sendOTPEmail({
    email: testEmail,
    otp: testOTP,
    type: 'sign-in',
  });
}

async function main() {
  console.log('\n🚀 Balikin Email Configuration Test');
  console.log('=' .repeat(60));
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log(`Test Email: ${process.env.TEST_EMAIL_ADDRESS || 'test@example.com'}`);
  console.log('='.repeat(60));

  // Run tests
  await runTest('Environment Variables Check', testEnvironmentVariables);
  await runTest('Send Simple Email', testSendSimpleEmail);
  await runTest('Send OTP Email', testSendOTPEmail);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));

  const passed = results.filter(r => r.success).length;
  const total = results.length;

  results.forEach(result => {
    console.log(`${result.success ? '✅' : '❌'} ${result.test}`);
  });

  console.log('='.repeat(60));
  console.log(`Total: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Email configuration is working correctly.');
    console.log('\n📝 Next Steps:');
    console.log('1. Check your email inbox/spam folder for test emails');
    console.log('2. Verify domain in Resend Dashboard if needed');
    console.log('3. Test OTP flow in the application');
  } else {
    console.log('\n⚠️  Some tests failed. Check the errors above and fix the configuration.');
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Verify domain is added and confirmed in Resend Dashboard');
    console.log('2. Check RESEND_API_KEY is correct (Production key, not Test key)');
    console.log('3. Ensure EMAIL_FROM uses a verified domain');
    console.log('4. Check Vercel/Server logs for detailed error messages');
  }

  console.log('\n');
}

// Run the tests
main().catch(error => {
  console.error('💥 Fatal error running tests:', error);
  process.exit(1);
});
