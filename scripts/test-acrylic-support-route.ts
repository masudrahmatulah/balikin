import assert from 'node:assert/strict';
import { build, type PluginBuild } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

type State = {
  session: { user: { id: string; role: string; division: string } } | null;
  row: Record<string, unknown> | null;
  tenantMatches: boolean;
  auditFails: boolean;
  auditWrites: number;
  pdfCalls: number;
};
const state: State = { session: null, row: null, tenantMatches: true, auditFails: false, auditWrites: 0, pdfCalls: 0 };
(globalThis as typeof globalThis & { acrylicSupportTest?: State }).acrylicSupportTest = state;

const stubs: Record<string, string> = {
  'next/server': `export class NextResponse extends Response { static json(value, init={}) { return new Response(JSON.stringify(value), { ...init, headers: { 'content-type':'application/json', ...(init.headers||{}) } }); } }`,
  '@/db/schema': `const col=(name)=>name; export const tags={id:col('tag.id'),app_id:col('tag.app_id'),productType:col('tag.productType'),ownerId:col('tag.ownerId'),claimedAt:col('tag.claimedAt'),batchId:col('tag.batchId'),activationPinPlain:col('tag.activationPinPlain'),serialNumber:col('tag.serialNumber'),bundleId:col('tag.bundleId'),status:col('tag.status')}; export const stickerOrders={id:col('order.id'),app_id:col('order.app_id'),paymentStatus:col('order.paymentStatus'),recipientName:col('order.recipientName')}; export const tagBundles={id:col('bundle.id'),app_id:col('bundle.app_id'),orderId:col('bundle.orderId')}; export const auditLogs={};`,
  'drizzle-orm': `export const eq=(a,b)=>['eq',a,b]; export const and=(...terms)=>['and',...terms];`,
  '@/db': `const s=globalThis.acrylicSupportTest; const builder={from(){return this},leftJoin(){return this},where(){return this},limit(){return Promise.resolve(s.tenantMatches&&s.row?[s.row]:[])}}; export const db={select(){return Object.create(builder)},insert(){return {values:async()=>{s.auditWrites++;if(s.auditFails)throw Error('audit failure')}}}};`,
  '@/lib/admin': `const s=globalThis.acrylicSupportTest; export const getAdminSession=async()=>s.session?.user.role==='admin'?s.session:null;`,
  '@/lib/vdp-manual-pdf': `const s=globalThis.acrylicSupportTest; export const buildActivationCardsPdf=async cards=>{s.pdfCalls++;s.cardCount=cards.length;return Buffer.from('%PDF synthetic')};`,
  '@/lib/app-url': `export const getAppBaseUrl=()=> 'https://balikin.test';`,
};

async function main() {
  const dir = await mkdtemp(join(tmpdir(), 'balikin-acrylic-route-'));
  try {
    const plugin = { name: 'acrylic-route-mocks', setup(build: PluginBuild) {
        build.onResolve({ filter: /.*/ }, args => {
          if (args.path === '@/lib/acrylic-support-policy') return { path: join(process.cwd(), 'lib/acrylic-support-policy.ts') };
          if (args.path === '@/lib/acrylic-recovery-service') return { path: join(process.cwd(), 'lib/acrylic-recovery-service.ts') };
          return stubs[args.path] ? { path: args.path, namespace: 'mock' } : undefined;
        });
        build.onLoad({ filter: /.*/, namespace: 'mock' }, args => ({ contents: stubs[args.path], loader: 'js' }));
      } };
    const lookupBundle = join(dir, 'lookup.cjs');
    const downloadBundle = join(dir, 'download.cjs');
    await build({ entryPoints: ['app/admin/api/activation-support/route.ts'], outfile: lookupBundle, bundle: true, platform: 'node', format: 'cjs', plugins: [plugin] });
    await build({ entryPoints: ['app/admin/api/activation-support/download/route.ts'], outfile: downloadBundle, bundle: true, platform: 'node', format: 'cjs', plugins: [plugin] });
    const { createRequire } = await import('node:module');
    const require = createRequire(join(process.cwd(), 'package.json'));
    const lookup = require(lookupBundle) as { GET: (request: never) => Promise<Response> };
    const download = require(downloadBundle) as { POST: (request: never) => Promise<Response> };
    const tagId = '123e4567-e89b-12d3-a456-426614174000';
    const validRow = () => ({ id:tagId, productType:'acrylic-premium', ownerId:null, claimedAt:null, batchId:'batch-1', activationPinPlain:'A3K7-M9P2', serialNumber:'TEST-001', orderId:'order-1', paymentStatus:'paid', appId:'balikin_id' });
    const req = (url: string, init: RequestInit = {}) => Object.assign(new Request(url, init), { nextUrl: new URL(url) });
    const jsonPost = (body: unknown, origin = 'https://balikin.test', contentType = 'application/json') => req('https://balikin.test/admin/api/activation-support/download', { method:'POST', headers:{ origin, 'content-type':contentType }, body:JSON.stringify(body) });
    const reset = () => Object.assign(state,{session:null,row:validRow(),tenantMatches:true,auditFails:false,auditWrites:0,pdfCalls:0});
    let passed = 0;
    const test = async (name: string, fn: () => Promise<void>) => { await fn(); passed++; console.log(`PASS ${name}`); };

    await test('unauthenticated lookup and download are denied', async()=>{reset();assert.equal((await lookup.GET(req('https://balikin.test/admin/api/activation-support?query=TEST-001') as never)).status,401);assert.equal((await download.POST(jsonPost({tagId:'tag-1',proofNote:'Reviewed proof carefully',proofReviewed:true}) as never)).status,401);});
    await test('ordinary user is denied even if division field claims admin', async()=>{reset();state.session={user:{id:'ordinary',role:'user',division:'admin'}};assert.equal((await lookup.GET(req('https://balikin.test/admin/api/activation-support?query=TEST-001') as never)).status,401);});
    await test('production division is forbidden and role-admin CS is allowed', async()=>{reset();state.session={user:{id:'admin',role:'admin',division:'production'}};assert.equal((await lookup.GET(req('https://balikin.test/admin/api/activation-support?query=TEST-001') as never)).status,403);state.session.user.division='customer_service';const response=await lookup.GET(req('https://balikin.test/admin/api/activation-support?query=TEST-001') as never);assert.equal(response.status,200);const data=await response.json();assert.equal(data.results[0].serialNumber,'TEST-001');assert.equal(JSON.stringify(data).includes('A3K7-M9P2'),false);});
    await test('cross-tenant lookup returns no results', async()=>{reset();state.session={user:{id:'admin',role:'admin',division:'admin'}};state.tenantMatches=false;const response=await lookup.GET(req('https://balikin.test/admin/api/activation-support?query=TEST-001') as never);assert.deepEqual((await response.json()).results,[]);});
    await test('missing or untrusted Origin and non-JSON requests are rejected', async()=>{reset();state.session={user:{id:'cs',role:'admin',division:'customer_service'}};for(const request of [jsonPost({tagId,proofNote:'Reviewed proof carefully',proofReviewed:true},''),jsonPost({tagId,proofNote:'Reviewed proof carefully',proofReviewed:true},'https://evil.test'),jsonPost({tagId,proofNote:'Reviewed proof carefully',proofReviewed:true},'https://balikin.test','text/plain')])assert.equal((await download.POST(request as never)).status,403);assert.equal(state.auditWrites,0);});
    await test('claimed, unpaid, unmapped, and missing-PIN tags are blocked', async()=>{reset();state.session={user:{id:'cs',role:'admin',division:'customer_service'}};const body={tagId,proofNote:'Reviewed purchase evidence',proofReviewed:true};for(const patch of [{ownerId:'owner'},{paymentStatus:'pending'},{orderId:null},{activationPinPlain:null}]){state.row={...validRow(),...patch};assert.equal((await download.POST(jsonPost(body) as never)).status,409);}assert.equal(state.pdfCalls,0);assert.equal(state.auditWrites,0);});
    await test('audit failure blocks PDF release',async()=>{reset();state.session={user:{id:'cs',role:'admin',division:'customer_service'}};state.auditFails=true;const response=await download.POST(jsonPost({tagId,proofNote:'Reviewed purchase evidence',proofReviewed:true}) as never);assert.equal(response.status,503);assert.equal(state.pdfCalls,0);});
    await test('successful release builds exactly one card and records audit',async()=>{reset();state.session={user:{id:'cs',role:'admin',division:'customer_service'}};const response=await download.POST(jsonPost({tagId,proofNote:'Reviewed purchase evidence',proofReviewed:true}) as never);assert.equal(response.status,200);assert.equal(state.auditWrites,1);assert.equal(state.pdfCalls,1);assert.equal((globalThis as typeof globalThis & {acrylicSupportTest:State&{cardCount:number}}).acrylicSupportTest.cardCount,1);});
    console.log(`${passed} acrylic support route tests passed.`);
  } finally { await rm(dir,{recursive:true,force:true}); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
