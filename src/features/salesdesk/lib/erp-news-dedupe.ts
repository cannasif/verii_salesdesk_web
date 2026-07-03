import { salesDeskApi, type SalesDeskErpNewsItemDto } from '../api/salesdesk-api';
import { erpNewsMetaApi } from '../api/erp-news-meta-api';

const FETCH_PAGE_SIZE = 200;
const DELETE_CONCURRENCY = 6;

function normalizeTitle(title: string): string {
  return title.trim().toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ');
}

export interface ErpNewsDedupePreview {
  totalCount: number;
  duplicateCount: number;
  keepCount: number;
  duplicateTitles: { title: string; count: number; removing: number }[];
}

export interface ErpNewsDedupeResult {
  deleted: number;
  failed: number;
  kept: number;
  errors: string[];
}

export async function fetchAllErpNewsItems(): Promise<SalesDeskErpNewsItemDto[]> {
  const all: SalesDeskErpNewsItemDto[] = [];
  let pageNumber = 1;
  let totalPages = 1;

  do {
    const page = await salesDeskApi.erpNews.list({
      pageNumber,
      pageSize: FETCH_PAGE_SIZE,
      sortBy: 'PublishedAt',
      sortDirection: 'desc',
    });
    all.push(...page.data);
    totalPages = page.totalPages;
    pageNumber += 1;
  } while (pageNumber <= totalPages);

  return all;
}

export function findDuplicateErpNewsIdsToDelete(
  items: SalesDeskErpNewsItemDto[],
  keepPerTitle = 1
): { toDelete: number[]; preview: ErpNewsDedupePreview } {
  const byTitle = new Map<string, SalesDeskErpNewsItemDto[]>();

  for (const item of items) {
    const key = normalizeTitle(item.title);
    const group = byTitle.get(key) ?? [];
    group.push(item);
    byTitle.set(key, group);
  }

  const toDelete: number[] = [];
  const duplicateTitles: ErpNewsDedupePreview['duplicateTitles'] = [];

  for (const [, group] of byTitle) {
    if (group.length <= keepPerTitle) continue;

    const sorted = [...group].sort((a, b) => b.id - a.id);
    const removing = sorted.slice(keepPerTitle);
    toDelete.push(...removing.map((item) => item.id));
    duplicateTitles.push({
      title: sorted[0].title,
      count: group.length,
      removing: removing.length,
    });
  }

  duplicateTitles.sort((a, b) => b.removing - a.removing);

  return {
    toDelete,
    preview: {
      totalCount: items.length,
      duplicateCount: toDelete.length,
      keepCount: items.length - toDelete.length,
      duplicateTitles,
    },
  };
}

export async function previewErpNewsDedupe(keepPerTitle = 1): Promise<ErpNewsDedupePreview> {
  const items = await fetchAllErpNewsItems();
  return findDuplicateErpNewsIdsToDelete(items, keepPerTitle).preview;
}

async function deleteIdsInBatches(
  ids: number[],
  onProgress?: (done: number, total: number) => void
): Promise<{ deleted: number; failed: number; errors: string[] }> {
  let deleted = 0;
  let failed = 0;
  const errors: string[] = [];

  for (let index = 0; index < ids.length; index += DELETE_CONCURRENCY) {
    const batch = ids.slice(index, index + DELETE_CONCURRENCY);
    await Promise.all(
      batch.map(async (id) => {
        try {
          await salesDeskApi.erpNews.delete(id);
          await erpNewsMetaApi.deleteOverlay(id).catch(() => undefined);
          deleted += 1;
        } catch (error) {
          failed += 1;
          if (errors.length < 5) {
            errors.push(error instanceof Error ? error.message : `Kayit ${id} silinemedi.`);
          }
        } finally {
          onProgress?.(deleted + failed, ids.length);
        }
      })
    );
  }

  return { deleted, failed, errors };
}

export async function runErpNewsDedupe(
  keepPerTitle = 1,
  onProgress?: (done: number, total: number) => void
): Promise<ErpNewsDedupeResult> {
  const items = await fetchAllErpNewsItems();
  const { toDelete, preview } = findDuplicateErpNewsIdsToDelete(items, keepPerTitle);

  if (toDelete.length === 0) {
    return { deleted: 0, failed: 0, kept: preview.keepCount, errors: [] };
  }

  const result = await deleteIdsInBatches(toDelete, onProgress);

  return {
    deleted: result.deleted,
    failed: result.failed,
    kept: items.length - result.deleted,
    errors: result.errors,
  };
}
