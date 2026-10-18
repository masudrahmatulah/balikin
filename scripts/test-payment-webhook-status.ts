import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { POST as PaymentWebhookPost } from '../app/api/payment/webhook/route';

type State = { transactions: number; updates: number };
const state: State = { transactions: 0, updates: 0 };
(globalThis as typeof globalThis & { paymentWebhookTestState?: State }).paymentWebhookTestState = state;

const stubs: Record<string, string> = {
  'next/server': `export const NextResponse={json:(body,init={})=>({body,status:init.status||200})};`,
};

async function main() {
  const dir = await mkdtemp(join(tmpdir(), 'balikin-payment-webhook-test-'));
  try {
    const bundlePath = join(dir, 'webhook.cjs');
    await build({ entryPoints: ['app/api/payment/webhook/route.ts'], outfile: bundlePath, bundle: true, platform: 'node', format: 'cjs', plugins: [{ name: 'mock-runtime', setup(build) { build.onResolve({ filter: /.*/ }, (args) => stubs[args.path] ? ({ path: args.path, namespace: 'payment-mock' }) : undefined); build.onLoad({ filter: /.*/, namespace: 'payment-mock' }, (args) => ({ contents: stubs[args.path], loader: 'js' })); } }] });
    const { createRequire } = await import('node:module');
    const require = createRequire(join(process.cwd(), 'package.json'));
    const route = require(bundlePath) as { POST: typeof PaymentWebhookPost };
    for (const body of [{ order_id: 'order-1' }, { order_id: 'order-1', status: 'mystery' }, { order_id: 'order-1', status: 'PAID' }]) {
      state.transactions = 0; state.updates = 0;
      const response = await route.POST({ text: async () => JSON.stringify(body), headers: new Headers({ 'x-callback-api-key': 'valid' }) } as never);
      assert.equal(response.status, 410);
      assert.equal(state.transactions, 0);
      assert.equal(state.updates, 0);
    }
    console.log('PASS disabled payment webhook always returns 410 without DB mutations');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
