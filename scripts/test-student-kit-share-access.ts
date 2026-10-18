import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { GET as ScheduleImportGet } from '../app/api/student-kit/schedule/import/[shareCode]/route';

type State = { authenticated: boolean; shareLookups: number };
const state: State = { authenticated: false, shareLookups: 0 };
(globalThis as typeof globalThis & { studentKitShareTestState?: State }).studentKitShareTestState = state;

const stubs: Record<string, string> = {
  'next/server': `export const NextResponse={json:(body,init={})=>({body,status:init.status||200})};`,
  'next/headers': `export const headers=async()=>new Headers();`,
  '@/lib/auth': `const s=globalThis.studentKitShareTestState; export const auth={api:{getSession:async()=>s.authenticated?{user:{id:'test-user'}}:null}};`,
  '@/app/actions/modules': `const s=globalThis.studentKitShareTestState; export const getScheduleByShareCode=async()=>{s.shareLookups++;return {classSchedule:'[]',assignmentDeadlines:'[]',driveLinks:'[]'}};`,
};

async function main() {
  const dir = await mkdtemp(join(tmpdir(), 'balikin-student-kit-share-test-'));
  try {
    const bundlePath = join(dir, 'share-import.cjs');
    await build({
      entryPoints: ['app/api/student-kit/schedule/import/[shareCode]/route.ts'],
      outfile: bundlePath,
      bundle: true,
      platform: 'node',
      format: 'cjs',
      plugins: [{
        name: 'mock-runtime',
        setup(build) {
          build.onResolve({ filter: /.*/ }, (args) => stubs[args.path]
            ? { path: args.path, namespace: 'student-kit-share-mock' }
            : undefined);
          build.onLoad({ filter: /.*/, namespace: 'student-kit-share-mock' }, (args) => ({
            contents: stubs[args.path],
            loader: 'js',
          }));
        },
      }],
    });

    const { createRequire } = await import('node:module');
    const require = createRequire(join(process.cwd(), 'package.json'));
    const route = require(bundlePath) as { GET: typeof ScheduleImportGet };
    const context = { params: Promise.resolve({ shareCode: 'abcdefghij' }) };

    state.authenticated = false;
    state.shareLookups = 0;
    const anonymous = await route.GET({ headers: new Headers() } as never, context);
    assert.equal(anonymous.status, 401);
    assert.equal(state.shareLookups, 0, 'anonymous requests must not fetch shared Student Kit data');

    state.authenticated = true;
    const authenticated = await route.GET({ headers: new Headers() } as never, context);
    assert.equal(authenticated.status, 200);
    assert.equal(state.shareLookups, 1);
    console.log('PASS anonymous Student Kit share access is rejected before data lookup');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

void main().catch((error) => { console.error(error); process.exitCode = 1; });
