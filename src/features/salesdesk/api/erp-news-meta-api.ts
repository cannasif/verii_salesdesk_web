import { getLocalServerUrl } from '../lib/local-server-url';
import type { ErpNewsMetaOverlay } from '../lib/erp-news-types';
import {
  addLocalTriggerKey,
  deleteLocalOverlay,
  getLocalOverlays,
  getLocalTriggerKeys,
  mergeOverlayBundles,
  mergeTriggerKeys,
  saveLocalOverlay,
} from '../lib/erp-news-meta-storage';

export interface ErpNewsMetaBundle {
  overlays: Record<string, ErpNewsMetaOverlay>;
  triggerKeys: string[];
}

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  message?: string;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getLocalServerUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.message || `Meta sunucu hatasi (${response.status}).`);
  }

  if (payload.data === undefined) {
    throw new Error('Meta sunucudan gecersiz yanit alindi.');
  }

  return payload.data;
}

function localBundle(): ErpNewsMetaBundle {
  return {
    overlays: getLocalOverlays(),
    triggerKeys: getLocalTriggerKeys(),
  };
}

export const erpNewsMetaApi = {
  async getBundle(): Promise<ErpNewsMetaBundle> {
    try {
      const server = await requestJson<ErpNewsMetaBundle>('/erp-news-meta');
      return {
        overlays: mergeOverlayBundles(server.overlays, getLocalOverlays()),
        triggerKeys: mergeTriggerKeys(server.triggerKeys, getLocalTriggerKeys()),
      };
    } catch {
      return localBundle();
    }
  },

  async saveOverlay(
    newsId: number,
    overlay: Omit<ErpNewsMetaOverlay, 'newsId' | 'updatedAt'>
  ): Promise<ErpNewsMetaOverlay> {
    const saved: ErpNewsMetaOverlay = {
      ...overlay,
      newsId,
      updatedAt: new Date().toISOString(),
    };
    saveLocalOverlay(newsId, saved);

    try {
      return await requestJson<ErpNewsMetaOverlay>(`/erp-news-meta/${newsId}`, {
        method: 'PUT',
        body: JSON.stringify(overlay),
      });
    } catch {
      return saved;
    }
  },

  async deleteOverlay(newsId: number): Promise<void> {
    deleteLocalOverlay(newsId);
    try {
      await requestJson<{ ok: boolean }>(`/erp-news-meta/${newsId}`, { method: 'DELETE' });
    } catch {
      // Local overlay already removed.
    }
  },

  async registerTriggerKey(key: string): Promise<{ duplicate: boolean }> {
    if (getLocalTriggerKeys().includes(key)) {
      return { duplicate: true };
    }
    addLocalTriggerKey(key);

    try {
      const result = await requestJson<{ key?: string; duplicate?: boolean }>('/erp-news-meta-triggers', {
        method: 'POST',
        body: JSON.stringify({ key }),
      });
      return { duplicate: Boolean(result.duplicate) };
    } catch {
      return { duplicate: false };
    }
  },
};
