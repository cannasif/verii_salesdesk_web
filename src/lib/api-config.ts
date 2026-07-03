export const DEFAULT_API_BASE_URL = 'https://salesdeskapi.v3rii.com';
const RUNTIME_CONFIG_FILE_NAME = 'runtime-settings.json';
const RUNTIME_CONFIG_CACHE_KEY = 'runtime-config-cache';

interface RuntimeConfig {
  apiUrl?: string;
  apiBaseUrl?: string;
  apiBaseURL?: string;
  baseUrl?: string;
}

interface ResolvedRuntimeConfig {
  apiUrl: string;
  baseUrl: string;
}

interface PersistedRuntimeConfig {
  apiUrl: string;
  baseUrl: string;
  fetchedAt: number;
}

function isValidApiUrl(value: string | undefined | null): boolean {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

function normalizeBaseUrl(url: string): string {
  return url.trim().replace(/\/$/, '');
}

function normalizeAppBasePath(value: string | undefined | null): string {
  if (!value || typeof value !== 'string') {
    return '/';
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return '/';
  }

  try {
    if (/^https?:\/\//i.test(trimmed)) {
      const url = new URL(trimmed);
      const normalizedPath = url.pathname.trim();
      if (!normalizedPath || normalizedPath === '/') {
        return '/';
      }

      return `/${normalizedPath.replace(/^\/+|\/+$/g, '')}`;
    }
  } catch {
    return '/';
  }

  if (trimmed === '/') {
    return '/';
  }

  return `/${trimmed.replace(/^\/+|\/+$/g, '')}`;
}

let cachedApiUrl = normalizeBaseUrl(DEFAULT_API_BASE_URL);
let cachedAppBasePath = normalizeAppBasePath(import.meta.env.BASE_URL || '/');
let configPromise: Promise<ResolvedRuntimeConfig> | null = null;
const runtimeBasePath = import.meta.env.BASE_URL || '/';

function toBaseRelativePath(fileName: string): string {
  const normalizedBase = runtimeBasePath.endsWith('/') ? runtimeBasePath : `${runtimeBasePath}/`;
  return `${normalizedBase}${fileName}`;
}

function isLocalhostApiUrl(value: string | undefined | null): boolean {
  if (!isValidApiUrl(value)) return false;
  try {
    const host = new URL(normalizeBaseUrl(value!)).hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host === '[::1]';
  } catch {
    return false;
  }
}

function shouldUseDevBrowserProxy(): boolean {
  if (!import.meta.env.DEV || typeof window === 'undefined') {
    return false;
  }

  // Yerel backend (localhost:5000 vb.) icin dogrudan baglanti; uzak API icin Vite proxy kullan.
  return !isLocalhostApiUrl(import.meta.env.VITE_API_URL);
}

function resolveDevProxyApiUrl(): string | null {
  if (!shouldUseDevBrowserProxy()) {
    return null;
  }

  return normalizeBaseUrl(window.location.origin);
}

function resolveRuntimeConfig(config: RuntimeConfig | undefined | null, fallbackConfig: ResolvedRuntimeConfig): ResolvedRuntimeConfig {
  const configuredApiUrl = config?.apiUrl ?? config?.apiBaseUrl ?? config?.apiBaseURL;

  return {
    apiUrl: isValidApiUrl(configuredApiUrl) ? normalizeBaseUrl(configuredApiUrl!) : fallbackConfig.apiUrl,
    baseUrl: normalizeAppBasePath(config?.baseUrl ?? fallbackConfig.baseUrl),
  };
}

async function fetchRuntimeConfig(): Promise<ResolvedRuntimeConfig> {
  const fallbackConfig: ResolvedRuntimeConfig = {
    apiUrl: isValidApiUrl(import.meta.env.VITE_API_URL)
      ? normalizeBaseUrl(import.meta.env.VITE_API_URL)
      : normalizeBaseUrl(DEFAULT_API_BASE_URL),
    baseUrl: normalizeAppBasePath(import.meta.env.BASE_URL || '/'),
  };

  const devProxyApiUrl = resolveDevProxyApiUrl();
  if (devProxyApiUrl) {
    return {
      apiUrl: devProxyApiUrl,
      baseUrl: normalizeAppBasePath(import.meta.env.BASE_URL || '/'),
    };
  }

  if (import.meta.env.DEV && isLocalhostApiUrl(import.meta.env.VITE_API_URL)) {
    return fallbackConfig;
  }

  try {
    const response = await fetch(toBaseRelativePath(RUNTIME_CONFIG_FILE_NAME), {
      cache: 'no-cache',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json',
      },
    });
    if (!response.ok) {
      throw new Error(`${RUNTIME_CONFIG_FILE_NAME} HTTP ${response.status}`);
    }

    const config = (await response.json()) as RuntimeConfig;
    return resolveRuntimeConfig(config, fallbackConfig);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`[api-config] ${RUNTIME_CONFIG_FILE_NAME} yüklenemedi, fallback kullanılıyor:`, error);
    }
  }

  return fallbackConfig;
}

function readPersistedRuntimeConfig(): PersistedRuntimeConfig | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(RUNTIME_CONFIG_CACHE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<PersistedRuntimeConfig>;
    if (
      !isValidApiUrl(parsed.apiUrl) ||
      typeof parsed.baseUrl !== 'string' ||
      typeof parsed.fetchedAt !== 'number'
    ) {
      return null;
    }

    const apiUrl = parsed.apiUrl as string;
    const baseUrl = parsed.baseUrl as string;

    return {
      apiUrl: normalizeBaseUrl(apiUrl),
      baseUrl: normalizeAppBasePath(baseUrl),
      fetchedAt: parsed.fetchedAt,
    };
  } catch {
    return null;
  }
}

function persistRuntimeConfig(config: ResolvedRuntimeConfig): void {
  if (typeof window === 'undefined') return;

  const payload: PersistedRuntimeConfig = {
    apiUrl: config.apiUrl,
    baseUrl: config.baseUrl,
    fetchedAt: Date.now(),
  };

  try {
    window.localStorage.setItem(RUNTIME_CONFIG_CACHE_KEY, JSON.stringify(payload));
  } catch {
    // Runtime config cache is an optimization only.
  }
}

function hydrateMemoryCache(config: ResolvedRuntimeConfig): ResolvedRuntimeConfig {
  cachedApiUrl = config.apiUrl;
  cachedAppBasePath = config.baseUrl;
  return config;
}

export function loadConfig(): Promise<string> {
  if (!configPromise) {
    configPromise = fetchRuntimeConfig()
      .catch((error) => {
        const devProxyApiUrl = resolveDevProxyApiUrl();
        if (devProxyApiUrl) {
          if (import.meta.env.DEV) {
            console.warn(`[api-config] ${RUNTIME_CONFIG_FILE_NAME} okunamadi, dev proxy kullaniliyor:`, error);
          }
          return {
            apiUrl: devProxyApiUrl,
            baseUrl: normalizeAppBasePath(import.meta.env.BASE_URL || '/'),
          };
        }

        const persisted = readPersistedRuntimeConfig();
        if (persisted && !(import.meta.env.DEV && !isLocalhostApiUrl(persisted.apiUrl))) {
          if (import.meta.env.DEV) {
            console.warn(`[api-config] ${RUNTIME_CONFIG_FILE_NAME} okunamadi, persisted fallback kullaniliyor:`, error);
          }
          return {
            apiUrl: persisted.apiUrl,
            baseUrl: persisted.baseUrl,
          };
        }

        return {
          apiUrl: isValidApiUrl(import.meta.env.VITE_API_URL)
            ? normalizeBaseUrl(import.meta.env.VITE_API_URL)
            : normalizeBaseUrl(DEFAULT_API_BASE_URL),
          baseUrl: normalizeAppBasePath(import.meta.env.BASE_URL || '/'),
        };
      })
      .then((config) => {
        hydrateMemoryCache(config);
        persistRuntimeConfig(config);
        return config;
      });
  }

  return configPromise.then((config) => config.apiUrl);
}

export async function getApiUrl(): Promise<string> {
  return loadConfig();
}

export function getApiBaseUrl(): string {
  return cachedApiUrl || normalizeBaseUrl(DEFAULT_API_BASE_URL);
}

export function getAppBasePath(): string {
  return cachedAppBasePath || normalizeAppBasePath(import.meta.env.BASE_URL || '/');
}

export function resolveAppPath(path: string): string {
  if (!path) {
    return getAppBasePath();
  }

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const [pathnameWithQuery, hashFragment] = path.split('#', 2);
  const [pathnamePart, queryString] = pathnameWithQuery.split('?', 2);
  const normalizedPathname = pathnamePart.startsWith('/') ? pathnamePart : `/${pathnamePart}`;
  const basePath = getAppBasePath();

  const resolvedPath =
    basePath === '/'
      ? normalizedPathname
      : `${basePath}${normalizedPathname === '/' ? '' : normalizedPathname}`;

  const resolvedQuery = queryString ? `?${queryString}` : '';
  const resolvedHash = hashFragment ? `#${hashFragment}` : '';

  return `${resolvedPath}${resolvedQuery}${resolvedHash}`;
}

export function isCurrentAppPath(path: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  return currentPath === resolveAppPath(path);
}
