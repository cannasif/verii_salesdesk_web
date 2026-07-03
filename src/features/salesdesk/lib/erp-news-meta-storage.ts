import type { ErpNewsMetaOverlay } from '../lib/erp-news-types';

const TRIGGER_KEYS_KEY = 'sd-erp-news-trigger-keys';
const OVERLAYS_KEY = 'sd-erp-news-overlays';

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function getLocalTriggerKeys(): string[] {
  return readJson<string[]>(TRIGGER_KEYS_KEY, []);
}

export function addLocalTriggerKey(key: string): void {
  const normalized = key.trim();
  if (!normalized) return;
  const keys = getLocalTriggerKeys();
  if (keys.includes(normalized)) return;
  writeJson(TRIGGER_KEYS_KEY, [...keys, normalized]);
}

export function hasLocalTriggerKey(key: string): boolean {
  return getLocalTriggerKeys().includes(key.trim());
}

export function getLocalOverlays(): Record<string, ErpNewsMetaOverlay> {
  return readJson<Record<string, ErpNewsMetaOverlay>>(OVERLAYS_KEY, {});
}

export function saveLocalOverlay(newsId: number, overlay: ErpNewsMetaOverlay): void {
  const overlays = getLocalOverlays();
  overlays[String(newsId)] = overlay;
  writeJson(OVERLAYS_KEY, overlays);
}

export function deleteLocalOverlay(newsId: number): void {
  const overlays = getLocalOverlays();
  delete overlays[String(newsId)];
  writeJson(OVERLAYS_KEY, overlays);
}

export function mergeOverlayBundles(
  server: Record<string, ErpNewsMetaOverlay>,
  local: Record<string, ErpNewsMetaOverlay>
): Record<string, ErpNewsMetaOverlay> {
  return { ...local, ...server };
}

export function mergeTriggerKeys(server: string[], local: string[]): string[] {
  return [...new Set([...local, ...server])];
}
