/**
 * Test script for OTP delivery services
 * Tests both Email (Resend) and WhatsApp (Fonnte) services
 */

import { sendOTPEmail } from '@/lib/email';
import { sendWhatsAppOTP } from '@/lib/whatsapp';

const TEST_EMAIL = 'test@balikin.id'; // Ganti dengan email Anda untuk test
const TEST_PHONE = '087883956811'; // Ganti dengan nomor WhatsApp Anda untuk test
const TEST_OTP = '123456';

async function testEmailService() {
  console.log('🧪 Testing Email Service (Resend)...');
  console.log('=====================================');

  try {
    await sendOTPEmail({
      email: TEST_EMAIL,
      otp: TEST_OTP,
      type: 'sign-in',
    });

    console.log('✅ Email service test completed!');
    console.log(`📧 Check your inbox at ${TEST_EMAIL}`);
    console.log('');
  } catch (error) {
    console.error('❌ Email service test failed:', error);
    console.log('');
  }
}

async function testWhatsAppService() {
  console.log('🧪 Testing WhatsApp Service (Fonnte)...');
  console.log('=======================================');

  try {
    await sendWhatsAppOTP({
      phoneNumber: TEST_PHONE,
      otp: TEST_OTP,
      type: 'sign-in',
    });

    console.log('✅ WhatsApp service test completed!');
    console.log(`📱 Check your WhatsApp at ${TEST_PHONE}`);
    console.log('');
  } catch (error) {
    console.error('❌ WhatsApp service test failed:', error);
    console.log('');
  }
}

async function main() {
  console.log('🚀 Starting OTP Services Test');
  console.log('==============================\n');

  // Check environment variables
  const { RESEND_API_KEY, FONNTE_API_TOKEN, NODE_ENV } = process.env;

  console.log('📋 Environment Check:');
  console.log(`  NODE_ENV: ${NODE_ENV || 'development'}`);
  console.log(`  RESEND_API_KEY: ${RESEND_API_KEY ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  FONNTE_API_TOKEN: ${FONNTE_API_TOKEN ? '✅ Configured' : '❌ Missing'}`);
  console.log('');

  if (NODE_ENV !== 'production') {
    console.log('⚠️  Development Mode Detected!');
    console.log('   In development mode, services will log to console instead of sending.');
    console.log('   Set NODE_ENV=production to test actual delivery.\n');
  }

  // Test both services
  await testEmailService();
  await testWhatsAppService();

  console.log('==============================');
  console.log('🎉 All tests completed!');
  console.log('');
  console.log('Next steps:');
  console.log('1. Check your email inbox for the test email');
  console.log('2. Check your WhatsApp for the test message');
  console.log('3. Try the actual login flow at /sign-in');
  console.log('4. Use regular email (test@example.com) for email OTP');
  console.log('5. Use @wa.dev suffix (087883956811@wa.dev) for WhatsApp OTP');
}

main().catch(console.error);
