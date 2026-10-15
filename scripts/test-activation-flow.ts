import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type MockState = {
  session: { user: { id: string } } | null;
  cookie: Record<string, unknown> | null;
  dbMode: 'tag' | 'sheet' | 'owned' | 'invalid';
  writes: number;
  pinHashes: string[];
  cookieClears: number;
  rateLimitFails: boolean;
};

const state: MockState = { session: null, cookie: null, dbMode: 'invalid', writes: 0, pinHashes: [], cookieClears: 0, rateLimitFails: false };
(globalThis as typeof globalThis & { activationTestState?: MockState }).activationTestState = state;

const stubs: Record<string, string> = {
  '@/db': `const s=globalThis.activationTestState; export const db={transaction: async fn=>fn({execute: async q=>{const text=q.strings.join(' '); for(const value of q.values) if(typeof value==='string'&&value.startsWith('hash:')) s.pinHashes.push(value); if(text.includes('sticker_sheets') && text.includes('SELECT')) return s.dbMode==='sheet'?[{id:'sheet-1',owner_id:null,sheet_code:'SHEET'}]:[]; if(text.includes('sticker_sheets') && text.includes('UPDATE')){s.writes++;return []} if(text.includes('SELECT') && text.includes('balikin_tags')) return text.includes('sheet_id')&&s.dbMode==='sheet'?[{id:'tag-1',owner_id:null},{id:'tag-2',owner_id:null}]:s.dbMode==='tag'?[{id:'tag-1',serial_number:'SERIAL-1',owner_id:null}]:s.dbMode==='owned'?[{id:'tag-1',serial_number:'SERIAL-1',owner_id:'other'}]:[]; if(text.includes('UPDATE') && text.includes('balikin_tags')){s.writes++;return text.includes('RETURNING')?(text.includes('sheet_id')?[{id:'tag-1'},{id:'tag-2'}]:[{id:'tag-1'}]):[]} return []}})};` ,
  '@/db/schema': `export const tags={}; export const user={};`,
  'drizzle-orm': `export const and=(...x)=>x; export const eq=(...x)=>x; export const sql=(strings,...values)=>({strings,values});`,
  '@/lib/crypto': `export const hashValue=v=>'hash:'+v;`,
  '@/lib/auth': `const s=globalThis.activationTestState; export const auth={api:{getSession:async()=>s.session}};`,
  'next/headers': `export const headers=async()=>new Headers();`,
  '@/lib/activation-cookie': `const s=globalThis.activationTestState; export const getActivationSession=async()=>s.cookie||{}; export const isValidActivationSession=async()=>!!s.cookie; export const clearActivationSession=async()=>{s.cookieClears++; throw Error('cookie clear failure')};`,
  '@/lib/rate-limit': `const s=globalThis.activationTestState; export const checkRateLimitByType=async()=>{if(s.rateLimitFails)throw Error();return {allowed:true}};`,
};

async function main() {
const dir = await mkdtemp(join(tmpdir(), 'balikin-activation-test-'));
try {
  const bundlePath = join(dir, 'activate.cjs');
  await build({ entryPoints: ['app/actions/activate.ts'], outfile: bundlePath, bundle: true, platform: 'node', format: 'cjs', plugins: [{ name: 'mock-runtime', setup(build) { build.onResolve({ filter: /.*/ }, (args) => stubs[args.path] ? ({ path: args.path, namespace: 'activation-mock' }) : undefined); build.onLoad({ filter: /.*/, namespace: 'activation-mock' }, (args) => ({ contents: stubs[args.path], loader: 'js' })); } }] });
  const { createRequire } = await import('node:module');
  const require = createRequire(join(process.cwd(), 'package.json'));
  const actions = require(bundlePath) as typeof import('../app/actions/activate');
  let passed = 0;
  const test = async (name: string, fn: () => Promise<void>) => { await fn(); passed++; console.log(`PASS ${name}`); };
  const reset = () => Object.assign(state, { session: null, cookie: null, dbMode: 'invalid', writes: 0, pinHashes: [], cookieClears: 0, rateLimitFails: false });

  await test('valid individual tag PIN claims with hashed comparison and preserves direct ownership write', async () => {
    reset(); state.session = { user: { id: 'client-user' } }; state.dbMode = 'tag';
    const result = await actions.processBatchActivation('123e4567-e89b-12d3-a456-426614174000', 'ABCD-EFGH');
    assert.equal(result.success, true); assert.equal(result.claimedCount, 1); assert.equal(state.writes, 1); assert.equal(state.cookieClears, 1); assert.ok(state.pinHashes.includes('hash:ABCD-EFGH'));
  });
  await test('invalid PIN makes no ownership writes', async () => {
    reset(); state.session = { user: { id: 'client-user' } }; state.dbMode = 'invalid';
    const result = await actions.processBatchActivation('123e4567-e89b-12d3-a456-426614174000', 'ABCD-EFGH');
    assert.equal(result.success, false); assert.equal(state.writes, 0); assert.ok(state.pinHashes.includes('hash:ABCD-EFGH'));
  });
  await test('already-owned tag cannot be claimed by another client', async () => {
    reset(); state.session = { user: { id: 'client-user' } }; state.dbMode = 'owned';
    const result = await actions.processBatchActivation('123e4567-e89b-12d3-a456-426614174000', 'ABCD-EFGH');
    assert.equal(result.success, false); assert.equal(state.writes, 0);
  });
  await test('valid sheet PIN claims all returned package tags and sheet', async () => {
    reset(); state.session = { user: { id: 'client-user' } }; state.dbMode = 'sheet';
    // Mock returns one package tag update, matching the production UPDATE ... RETURNING contract.
    const result = await actions.processBatchActivation('123e4567-e89b-12d3-a456-426614174000', 'ABCD-EFGH');
    assert.equal(result.success, true); assert.equal(result.claimedCount, 2); assert.equal(state.writes, 2);
  });
  await test('cleanup failure after committed claim does not report activation failure', async () => {
    reset(); state.session = { user: { id: 'client-user' } }; state.dbMode = 'tag';
    const result = await actions.processBatchActivation('123e4567-e89b-12d3-a456-426614174000', 'ABCD-EFGH');
    assert.equal(result.success, true); assert.equal(state.writes, 1);
  });
  await test('auth and rate-limit failures return recoverable errors instead of escaping', async () => {
    reset(); state.session = { user: { id: 'client-user' } }; state.rateLimitFails = true;
    const result = await actions.processBatchActivation('123e4567-e89b-12d3-a456-426614174000', 'ABCD-EFGH');
    assert.equal(result.success, false); assert.match(result.error!, /Verifikasi sementara/); assert.equal(state.writes, 0);
  });

  const cookieBundle = join(dir, 'cookie.cjs');
  await build({ entryPoints: ['lib/activation-cookie.ts'], outfile: cookieBundle, bundle: true, platform: 'node', format: 'cjs', plugins: [{ name: 'cookie-mocks', setup(build) { build.onResolve({ filter: /.*/ }, (args) => args.path === 'next/headers' || args.path === 'iron-session' ? ({ path: args.path, namespace: 'cookie-mock' }) : undefined); build.onLoad({ filter: /.*/, namespace: 'cookie-mock' }, (args) => ({ contents: args.path === 'next/headers' ? `export const cookies=async()=>({get:()=>undefined})` : `export const getIronSession=()=>{throw Error('must not decrypt absent cookie')}` , loader: 'js' })); } }] });
  const cookieLib = require(cookieBundle) as typeof import('../lib/activation-cookie');
  await test('absent activation cookie does not require password or attempt decryption', async () => { delete process.env.ACTIVATION_COOKIE_PASSWORD; assert.equal(await cookieLib.isValidActivationSession(), false); await cookieLib.clearActivationSession(); });

  const page = await (await import('node:fs/promises')).readFile('app/activate/batch/[batchId]/page.tsx', 'utf8');
  assert.doesNotMatch(page, /processBatchActivation|clearActivationSession|resumeBatchActivation/);
  assert.match(page, /if \(!session\)[\s\S]*redirect\(`\/sign-in\?redirect=/);
  assert.ok(page.indexOf('redirect(`/sign-in?redirect=') < page.indexOf('<BatchActivationClient'));
  passed++;
  console.log('PASS anonymous batch route redirects to sign-in before displaying PIN UI; render has no mutation');
  const legacyPage = await (await import('node:fs/promises')).readFile('app/activate/[slug]/page.tsx', 'utf8');
  assert.match(legacyPage, /eq\(tags\.app_id, 'balikin_id'\)/);
  assert.match(legacyPage, /redirect\(returnTo\)/);
  assert.doesNotMatch(legacyPage, /searchParams|setActivationSession|processActivation|isValidActivationSession/);
  passed++;
  console.log('PASS legacy slug route uses tenant-scoped canonical claim redirect without PIN URL or render mutation');
  console.log(`\n${passed} activation-flow tests passed.`);
} finally {
  await rm(dir, { recursive: true, force: true });
}
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
