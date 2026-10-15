import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import jsQR from 'jsqr';
import { getSafeQrDestination } from '../lib/safe-qr-destination';

const origin = 'https://balikin.online';
const accepted = [
  '/p/dompet-abc',
  'https://balikin.online/p/dompet-abc?source=qr',
  'https://www.balikin.online/activate/tag_abc',
  '/activate/batch/123e4567-e89b-12d3-a456-426614174000',
  '/claim',
  '/claim/tag-123',
];
for (const value of accepted) assert.ok(getSafeQrDestination(value, origin), `expected accepted URL: ${value}`);

const rejected = [
  'https://evil.example/p/dompet-abc',
  '//evil.example/p/dompet-abc',
  'javascript:alert(1)',
  'https://balikin.online/admin',
  '/api/admin',
  '/p/%2f%2fevil.example',
  '/activate/../../admin',
  'https://user@balikin.online/p/tag',
  'http://balikin.online/p/tag',
];
for (const value of rejected) assert.equal(getSafeQrDestination(value, origin), null, `expected rejected URL: ${value}`);

async function main() {
const qrPayloads = [
  'https://balikin.online/p/finder-tag',
  'https://balikin.online/activate/batch/123e4567-e89b-12d3-a456-426614174000',
];
for (const payload of qrPayloads) {
  const dataUrl = await QRCode.toDataURL(payload, { margin: 2, width: 320 });
  const image = await loadImage(dataUrl);
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d');
  context.drawImage(image, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, image.width, image.height);
  const decoded = jsQR(new Uint8ClampedArray(data), width, height, { inversionAttempts: 'dontInvert' });
  assert.equal(decoded?.data, payload, `decoded QR payload: ${payload}`);
  assert.ok(getSafeQrDestination(decoded!.data, origin));
}

console.log(`QR scanner checks passed: ${accepted.length} accepted routes, ${rejected.length} rejected routes, ${qrPayloads.length} synthetic QR decodes.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
