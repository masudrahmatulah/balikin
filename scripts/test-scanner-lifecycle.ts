import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import { QrScanSession } from '../lib/qr-scan-session';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

function makeStream() {
  let stops = 0;
  return { getTracks: () => [{ stop: () => { stops++; } }], get stops() { return stops; } };
}

async function testScannerSession() {
  let assertions = 0;
  const cancelled: number[] = [];
  const frames = new Map<number, () => void>();
  let frameId = 0;
  let active = 0;
  const session = new QrScanSession<ReturnType<typeof makeStream>>();
  const schedule = (callback: () => void) => { const id = ++frameId; frames.set(id, callback); return id; };
  const runNextFrame = () => {
    const next = frames.entries().next().value as [number, () => void] | undefined;
    if (!next) return;
    frames.delete(next[0]);
    next[1]();
  };
  const options = (openStream: () => Promise<ReturnType<typeof makeStream>>, scanFrame = async () => false) => ({
    openStream,
    playStream: async () => {},
    scanFrame,
    onActive: () => { active++; },
    onStop: () => {},
    schedule,
    cancel: (id: number) => { cancelled.push(id); frames.delete(id); },
  });

  const firstPermission = deferred<ReturnType<typeof makeStream>>();
  const firstStream = makeStream();
  const first = session.start(options(() => firstPermission.promise));
  const duplicate = await session.start(options(async () => { throw new Error('duplicate camera request'); }));
  assert.equal(duplicate, undefined); assertions++;
  session.stop({ cancel: options(async () => makeStream()).cancel, onStop: options(async () => makeStream()).onStop });
  const secondPermission = deferred<ReturnType<typeof makeStream>>();
  const secondStream = makeStream();
  const second = session.start(options(() => secondPermission.promise));
  secondPermission.resolve(secondStream);
  await second;
  firstPermission.resolve(firstStream);
  await first;
  assert.equal(firstStream.stops, 1); assertions++;
  assert.equal(secondStream.stops, 0); assertions++;
  assert.equal(active, 1); assertions++;
  assert.equal(session.isBusy, true); assertions++;

  const scannerOptions = options(async () => makeStream(), async () => false);
  session.stop(scannerOptions);
  assert.equal(cancelled.length, 1); assertions++;

  let attempts = 0;
  const loopStream = makeStream();
  const loopOptions = options(async () => loopStream, async () => ++attempts === 2);
  await session.start(loopOptions);
  runNextFrame();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(attempts, 1); assertions++;
  assert.equal(session.isBusy, true); assertions++;
  runNextFrame();
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(attempts, 2); assertions++;
  assert.equal(loopStream.stops, 1); assertions++;
  assert.equal(session.isBusy, false); assertions++;

  const pendingPermission = deferred<ReturnType<typeof makeStream>>();
  const pendingStream = makeStream();
  const activeBeforeCancel = active;
  const pending = session.start(options(() => pendingPermission.promise));
  session.stop(options(async () => makeStream()));
  pendingPermission.resolve(pendingStream);
  await pending;
  assert.equal(pendingStream.stops, 1); assertions++;
  assert.equal(active, activeBeforeCancel); assertions++;
  return assertions;
}

async function testServiceWorkerActivation() {
  const listeners = new Map<string, (event: { waitUntil(promise: Promise<unknown>): void }) => void>();
  let claimed = 0;
  const deleted: string[] = [];
  const eventPromises: Promise<unknown>[] = [];
  const self = {
    addEventListener: (type: string, listener: (event: { waitUntil(promise: Promise<unknown>): void }) => void) => listeners.set(type, listener),
    clients: { claim: async () => { claimed++; } },
    location: { origin: 'https://balikin.online' },
  };
  const caches = {
    open: async () => ({ addAll: async () => {} }),
    keys: async () => ['balikin-v1', 'balikin-v2', 'balikin-offline-v2'],
    delete: async (name: string) => { deleted.push(name); return true; },
  };
  const source = await readFile('public/sw.js', 'utf8');
  runInNewContext(source, { self, caches, console: { log() {}, error() {} }, URL, fetch: async () => new Response() });
  const event = { waitUntil: (promise: Promise<unknown>) => eventPromises.push(promise) };
  listeners.get('install')?.(event);
  await Promise.all(eventPromises.splice(0));
  assert.equal(claimed, 0, 'install must not claim clients');
  listeners.get('activate')?.(event);
  assert.equal(eventPromises.length, 1, 'activate owns one combined lifetime promise');
  await Promise.all(eventPromises.splice(0));
  assert.equal(claimed, 1, 'activation claims clients');
  assert.deepEqual(deleted, ['balikin-v1'], 'activation removes old Balikin caches only');
  return 4;
}

async function main() {
  const scannerAssertions = await testScannerSession();
  const swAssertions = await testServiceWorkerActivation();
  console.log(`Lifecycle checks passed: ${scannerAssertions} scanner assertions, ${swAssertions} service-worker assertions.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
