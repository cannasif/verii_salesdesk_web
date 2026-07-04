import type { PagedParams, PagedResponse } from '@/types/api';

const CACHE_PREFIX = 'salesdesk-list-cache-v1:';

function cacheKey(resourceKey: string, params?: PagedParams): string {
  return `${CACHE_PREFIX}${resourceKey}:${JSON.stringify(params ?? {})}`;
}

export function readSalesDeskListCache<T>(resourceKey: string, params?: PagedParams): PagedResponse<T> | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(cacheKey(resourceKey, params));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PagedResponse<T>;
    if (!parsed || !Array.isArray(parsed.data)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writeSalesDeskListCache<T>(
  resourceKey: string,
  params: PagedParams | undefined,
  data: PagedResponse<T>,
): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(cacheKey(resourceKey, params), JSON.stringify(data));
  } catch {
    // sessionStorage dolu veya erisilemez — sessiz gec
  }
}

export function emptySalesDeskPagedResponse<T>(params?: PagedParams): PagedResponse<T> {
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  return {
    data: [],
    totalCount: 0,
    pageNumber,
    pageSize,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  };
}
