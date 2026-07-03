import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_PATH = path.join(__dirname, 'data', 'erp-news-meta.json');

/** @type {Promise<void>} */
let writeQueue = Promise.resolve();

function readStore() {
  if (!fs.existsSync(DATA_PATH)) {
    return { overlays: {}, triggerKeys: [] };
  }
  const raw = fs.readFileSync(DATA_PATH, 'utf8');
  const parsed = JSON.parse(raw);
  return {
    overlays: parsed.overlays && typeof parsed.overlays === 'object' ? parsed.overlays : {},
    triggerKeys: Array.isArray(parsed.triggerKeys) ? parsed.triggerKeys : [],
  };
}

function writeStore(data) {
  fs.mkdirSync(path.dirname(DATA_PATH), { recursive: true });
  fs.writeFileSync(DATA_PATH, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function withLock(fn) {
  const run = writeQueue.then(fn);
  writeQueue = run.catch(() => {});
  return run;
}

export function listOverlays() {
  const store = readStore();
  return store.overlays;
}

export function getOverlay(newsId) {
  const numericId = Number(newsId);
  const store = readStore();
  return store.overlays[String(numericId)] ?? null;
}

export function saveOverlay(newsId, overlay) {
  const numericId = Number(newsId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    throw new Error('Gecersiz haber id.');
  }

  return withLock(() => {
    const store = readStore();
    store.overlays[String(numericId)] = {
      ...overlay,
      newsId: numericId,
      updatedAt: new Date().toISOString(),
    };
    writeStore(store);
    return store.overlays[String(numericId)];
  });
}

export function deleteOverlay(newsId) {
  const numericId = Number(newsId);
  return withLock(() => {
    const store = readStore();
    delete store.overlays[String(numericId)];
    writeStore(store);
    return { ok: true };
  });
}

export function listTriggerKeys() {
  return readStore().triggerKeys;
}

export function addTriggerKey(key) {
  const normalized = String(key ?? '').trim();
  if (!normalized) throw new Error('Tetikleyici anahtari zorunludur.');

  return withLock(() => {
    const store = readStore();
    if (!store.triggerKeys.includes(normalized)) {
      store.triggerKeys.push(normalized);
      writeStore(store);
    }
    return { ok: true, key: normalized };
  });
}

export function hasTriggerKey(key) {
  const normalized = String(key ?? '').trim();
  return readStore().triggerKeys.includes(normalized);
}
