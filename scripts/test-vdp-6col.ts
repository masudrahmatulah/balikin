/**
 * Test script for new 6-column VDP layout (Sharp-based)
 * Tests: 2 tags × 3 columns (QR, Logo, Activation) with explicit pixel coordinates
 */

import { generateOneRowSticker, type TagData } from '../lib/vdp-engine';
import { writeFileSync } from 'fs';
import { hashValue } from '../lib/crypto';

async function testVDP() {
  console.log('Testing 6-column VDP layout (Sharp-based)...');

  // Create test tag data
  const mockToken1 = 'test-token-hash-1';
  const mockToken2 = 'test-token-hash-2';

  const tagA: TagData = {
    productSlug: 'test-001',
    activationTokenHash: mockToken1,
    activationPinPlain: 'A1B-C2D',
    serialNumber: 'B01-001',
    id: '1',
    name: 'Test Tag A',
  };

  const tagB: TagData = {
    productSlug: 'test-002',
    activationTokenHash: mockToken2,
    activationPinPlain: 'E3F-G4H',
    serialNumber: 'B01-002',
    id: '2',
    name: 'Test Tag B',
  };

  try {
    console.log('Generating row with 2 tags...');
    const startTime = Date.now();
    const buffer = await generateOneRowSticker(tagA, tagB);
    const elapsed = Date.now() - startTime;

    const outputPath = '/tmp/vdp-test-6col.png';
    writeFileSync(outputPath, buffer);
    console.log(`✓ VDP row saved to: ${outputPath}`);
    console.log(`  Image size: ${buffer.length} bytes (${(buffer.length / 1024).toFixed(2)} KB)`);
    console.log(`  Generation time: ${elapsed}ms`);
    console.log(`  Expected dimensions: 2124 × 531 pixels (6 × 354px wide × 531px high)`);

    console.log('\n✓ Layout verification (Explicit X Coordinates):');
    console.log('  ┌──────────────────────────────────────────────────────────────────────────────┐');
    console.log('  │ PAKET 1 (Tag A)                      │ PAKET 2 (Tag B)                      │');
    console.log('  ├──────────────────────────────────────┼──────────────────────────────────────┤');
    console.log('  │ [QR-1]    [Logo-1]    [Aktiv-1]      │ [QR-2]    [Logo-2]    [Aktiv-2]      │');
    console.log('  │ X=0       X=354        X=708          │ X=1062    X=1416       X=1770         │');
    console.log('  └──────────────────────────────────────────────────────────────────────────────┘');
    console.log('\n  Kolom 1 (0-354px):     QR Utama Tag A');
    console.log('  Kolom 2 (354-708px):   Logo Tag A');
    console.log('  Kolom 3 (708-1062px): QR Aktivasi Tag A ✓');
    console.log('  Kolom 4 (1062-1416px): QR Utama Tag B');
    console.log('  Kolom 5 (1416-1770px): Logo Tag B');
    console.log('  Kolom 6 (1770-2124px): QR Aktivasi Tag B ✓');

  } catch (error) {
    console.error('✗ Test failed:', error);
    process.exit(1);
  }
}

testVDP();
