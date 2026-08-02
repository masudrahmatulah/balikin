import dotenv from 'dotenv';
import path from 'path';
import { hashValue, generateActivationToken, generateActivationPin, generateSerialNumber } from '../lib/crypto';

dotenv.config({ path: path.join(__dirname, '../.env.local') });

async function testCrypto() {
  console.log('=== Testing Crypto Utilities ===\n');

  // Test hashValue
  console.log('1. hashValue function:');
  const testHash1 = hashValue('test123');
  const testHash2 = hashValue('test123');
  const testHash3 = hashValue('TEST123');
  console.log('  - Same input produces same hash:', testHash1 === testHash2 ? '✓' : '✗');
  console.log('  - Different input produces different hash:', testHash1 !== testHash3 ? '✓' : '✗');
  console.log('  - Hash format (64 hex chars):', /^[A-F0-9]{64}$/i.test(testHash1) ? '✓' : '✗');
  console.log('  - Sample hash:', testHash1);

  // Test generateActivationToken
  console.log('\n2. generateActivationToken function:');
  const token1 = generateActivationToken();
  const token2 = generateActivationToken();
  console.log('  - Generates unique tokens:', token1 !== token2 ? '✓' : '✗');
  console.log('  - Token format (32 hex chars):', /^[A-F0-9]{32}$/i.test(token1) ? '✓' : '✗');
  console.log('  - Sample token:', token1);

  // Test generateActivationPin
  console.log('\n3. generateActivationPin function:');
  const pin1 = generateActivationPin();
  const pin2 = generateActivationPin();
  console.log('  - Generates unique PINs:', pin1 !== pin2 ? '✓' : '✗');
  console.log('  - PIN format (XXXX-XXXX):', /^\w{4}-\w{4}$/.test(pin1) ? '✓' : '✗');
  console.log('  - No confusing characters (I, O):', /[IO]/.test(pin1) ? '✗ Contains I or O' : '✓ Excludes I and O');
  console.log('  - Sample PIN:', pin1);

  // Test generateSerialNumber
  console.log('\n4. generateSerialNumber function:');
  const serial1 = generateSerialNumber('B01', 42);
  const serial2 = generateSerialNumber('A05', 7);
  console.log('  - Format B01-042:', serial1 === 'B01-042' ? '✓' : '✗');
  console.log('  - Format A05-007:', serial2 === 'A05-007' ? '✓' : '✗');

  // Test hash consistency for activation
  console.log('\n5. Activation flow test:');
  const testToken = generateActivationToken();
  const testPin = generateActivationPin();
  const tokenHash = hashValue(testToken);
  const pinHash = hashValue(testPin);
  console.log('  - Token:', testToken);
  console.log('  - Token hash:', tokenHash);
  console.log('  - PIN:', testPin);
  console.log('  - PIN hash:', pinHash);
  console.log('  - Verifying token hash:', hashValue(testToken) === tokenHash ? '✓' : '✗');
  console.log('  - Verifying PIN hash:', hashValue(testPin) === pinHash ? '✓' : '✗');

  console.log('\n=== Crypto Utilities Test Complete ===');
}

testCrypto().catch(console.error);
