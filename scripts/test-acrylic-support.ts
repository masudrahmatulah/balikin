import assert from 'node:assert/strict';
import { canUseAcrylicSupport, type AcrylicRecoveryRecord } from '../lib/acrylic-support-policy';
import { redactAcrylicAuditNote, releaseAcrylicCard } from '../lib/acrylic-recovery-service';
import { buildActivationCardsPdf } from '../lib/vdp-manual-pdf';
import sharp from 'sharp';
import { generateOneRowSticker } from '../lib/vdp-engine';
import { getAcrylicShapeConfig, mmToPx, type AcrylicShapeKey } from '../lib/acrylic-shapes';

const valid: AcrylicRecoveryRecord = {
  appId: 'balikin_id', productType: 'acrylic-premium', ownerId: null, claimedAt: null,
  orderId: 'order-1', paymentStatus: 'paid', batchId: 'batch-1', pin: 'SYNTHETIC-PIN',
};

async function main() {
assert.equal(canUseAcrylicSupport('admin'), true);
  assert.equal(canUseAcrylicSupport('customer_service'), true);
for (const division of ['production', 'marketing', null, undefined]) assert.equal(canUseAcrylicSupport(division), false);

const blocked: Array<[string, Partial<AcrylicRecoveryRecord>]> = [
  ['tenant mismatch', { appId: 'other_app' }],
  ['non acrylic', { productType: 'vinyl-sticker' }],
  ['claimed', { ownerId: 'owner-1' }],
  ['claimed timestamp', { claimedAt: new Date() }],
  ['unmapped order', { orderId: null }],
  ['unpaid order', { paymentStatus: 'pending' }],
  ['missing batch', { batchId: null }],
  ['missing PIN', { pin: null }],
];
  for (const [label, changes] of blocked) {
  const result = await releaseAcrylicCard({ record: { ...valid, ...changes }, writeAudit: async () => {}, buildPdf: async () => 'pdf' });
  assert.equal(result.ok, false, `${label} must fail closed`);
}

let auditCalled = false;
let pdfCalled = false;
await assert.rejects(() => releaseAcrylicCard({
  record: valid,
  writeAudit: async () => { auditCalled = true; throw new Error('mock audit failure'); },
  buildPdf: async () => { pdfCalled = true; return 'pdf'; },
}));
assert.equal(auditCalled, true);
assert.equal(pdfCalled, false, 'PDF must not be built when audit fails');

let builtCount = 0;
const release = await releaseAcrylicCard({ record: valid, writeAudit: async () => {}, buildPdf: async () => {
  builtCount++;
  return buildActivationCardsPdf([{ codeLabel: 'PIN AKTIVASI', code: 'SYNTHETIC-PIN', scope: 'Serial: TEST-0001', activationUrl: 'https://example.invalid/activate/batch/test' }]);
} });
assert.equal(release.ok, true);
assert.equal(builtCount, 1);
if (!release.ok) throw new Error('Expected successful synthetic release');
const pdfText = Buffer.from(release.pdf).toString('latin1');
assert.equal((pdfText.match(/\/Type\s*\/Page\b/g) || []).length, 1, 'support PDF must contain exactly one page/card');
  assert.equal(pdfText.includes('SYNTHETIC-PIN'), true);

  const shapes: AcrylicShapeKey[] = ['oval', 'octagon', 'heart', 'rectangle', 'rectangle-motif', 'square', 'circle', 'rectangle-emboss'];
  for (const shapeKey of shapes) {
    const tag = { id: 'synthetic-tag', slug: 'synthetic-tag', productSlug: 'acrylic-premium', serialNumber: `TEST-${shapeKey}`, isCustom: false, name: 'Test item' };
    const image = await generateOneRowSticker(tag, null, null, shapeKey);
    const metadata = await sharp(image).metadata();
    const config = getAcrylicShapeConfig(shapeKey);
    assert.equal(metadata.width, mmToPx(config.widthMm) * 2, `${shapeKey} physical two-cell width`);
    assert.equal(metadata.height, mmToPx(config.heightMm), `${shapeKey} physical height`);
    assert.equal(metadata.format, 'png');
    if (shapeKey === 'square') {
      const { data, info } = await sharp(image).raw().toBuffer({ resolveWithObject: true });
      const x = mmToPx(config.widthMm) + Math.round(mmToPx(config.widthMm) / 2);
      const y = mmToPx(2);
      const pixelIndex = (y * info.width + x) * info.channels;
      const actualNavy = [...data.subarray(pixelIndex, pixelIndex + 3)];
      assert.ok(actualNavy.every((channel, index) => Math.abs(channel - [20, 35, 59][index]) <= 2), `acrylic logo navy background must fill the second cell up to the top safe-print area (got ${actualNavy.join(',')})`);
    }
  }
  for (const secretVariant of ['A3K7-M9P2', 'a3k7-m9p2', 'A3K7M9P2', 'A3K7 M9P2', 'A 3 K 7 - M 9 P 2']) {
    const auditText = redactAcrylicAuditNote(`proof ${secretVariant} ${'a'.repeat(64)} abcdefghijklmnopqrstuvwxyz123456`, 'A3K7-M9P2');
    assert.equal(/A3K7[-\s]?M9P2/i.test(auditText), false);
    assert.equal(auditText.includes('a'.repeat(64)), false);
    assert.equal(auditText.includes('abcdefghijklmnopqrstuvwxyz123456'), false);
  }
  console.log('Acrylic support policy, eight-shape serial render, and one-card PDF tests passed.');
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
