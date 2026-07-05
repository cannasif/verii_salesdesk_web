import { normalizePagedResponse } from '@/lib/paged-response';
import type { PagedParams, PagedResponse } from '@/types/api';
import type { SalesDeskFixedAssetDto } from './salesdesk-api';
import { salesDeskApi } from './salesdesk-api';
import { tryWithSalesDeskFastTimeout } from '../lib/salesdesk-fast-timeout';

const STORAGE_KEY = 'salesdesk-assets-v1';
const LOCAL_ID_START = 910_000;
const REMOTE_WRITE_TIMEOUT_MS = 12_000;
const REMOTE_LIST_TIMEOUT_MS = 8_000;
export const ASSETS_SYNCED_EVENT = 'salesdesk-assets-synced';

interface AssetStore {
  seq: number;
  assets: SalesDeskFixedAssetDto[];
}

function readStore(): AssetStore {
  if (typeof window === 'undefined') {
    return { seq: LOCAL_ID_START, assets: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { seq: LOCAL_ID_START, assets: [] };
    const parsed = JSON.parse(raw) as Partial<AssetStore>;
    return {
      seq: typeof parsed.seq === 'number' ? parsed.seq : LOCAL_ID_START,
      assets: Array.isArray(parsed.assets) ? parsed.assets : [],
    };
  } catch {
    return { seq: LOCAL_ID_START, assets: [] };
  }
}

function writeStore(store: AssetStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function notifyAssetsSynced(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(ASSETS_SYNCED_EVENT));
}

function listLocalAssets(): SalesDeskFixedAssetDto[] {
  return readStore().assets;
}

function isLocalId(id: number): boolean {
  return id >= LOCAL_ID_START;
}

function sortAssets(rows: SalesDeskFixedAssetDto[], params?: PagedParams): SalesDeskFixedAssetDto[] {
  const sortBy = (params?.sortBy ?? 'Name').toLowerCase();
  const direction = params?.sortDirection === 'desc' ? -1 : 1;

  const fieldMap: Record<string, keyof SalesDeskFixedAssetDto> = {
    id: 'id',
    code: 'code',
    name: 'name',
    category: 'category',
    purchasedate: 'purchaseDate',
    value: 'value',
    status: 'status',
  };

  const field = fieldMap[sortBy.replace(/[^a-z0-9]/g, '')] ?? 'name';

  return [...rows].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'tr') * direction;
  });
}

function filterAssets(rows: SalesDeskFixedAssetDto[], params?: PagedParams): SalesDeskFixedAssetDto[] {
  const search = params?.search?.trim().toLocaleLowerCase('tr-TR');
  if (!search) return rows;

  return rows.filter((row) =>
    [row.code, row.name, row.category]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(search),
  );
}

function buildAssetListPage(
  rows: SalesDeskFixedAssetDto[],
  params?: PagedParams,
): PagedResponse<SalesDeskFixedAssetDto> {
  const filtered = filterAssets(rows, params);
  const sorted = sortAssets(filtered, params);
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;

  return normalizePagedResponse<SalesDeskFixedAssetDto>(
    {
      data: sorted.slice(start, start + pageSize),
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
    { pageNumber, pageSize },
  );
}

function mergeRemoteIntoLocalStore(remoteRows: SalesDeskFixedAssetDto[]): boolean {
  const store = readStore();
  const byId = new Map(store.assets.map((item) => [item.id, item]));

  for (const remote of remoteRows) {
    byId.set(remote.id, remote);
  }

  const merged = sortAssets(Array.from(byId.values()), { sortBy: 'Name', sortDirection: 'asc' });
  const changed =
    merged.length !== store.assets.length ||
    merged.some((item, index) => item.id !== store.assets[index]?.id);

  if (!changed) return false;

  store.assets = merged;
  writeStore(store);
  return true;
}

async function tryRemoteCreate(body: Partial<SalesDeskFixedAssetDto>): Promise<SalesDeskFixedAssetDto | null> {
  return tryWithSalesDeskFastTimeout(salesDeskApi.assets.create(body), REMOTE_WRITE_TIMEOUT_MS);
}

async function tryRemoteListAll(): Promise<SalesDeskFixedAssetDto[] | null> {
  const remotePage = await tryWithSalesDeskFastTimeout(
    salesDeskApi.assets.list({
      pageNumber: 1,
      pageSize: 500,
      sortBy: 'Name',
      sortDirection: 'asc',
    }),
    REMOTE_LIST_TIMEOUT_MS,
  );
  return remotePage?.data ?? null;
}

async function syncRemoteAssets(): Promise<boolean> {
  const remoteRows = await tryRemoteListAll();
  if (!remoteRows) return false;
  const changed = mergeRemoteIntoLocalStore(remoteRows);
  if (changed) notifyAssetsSynced();
  return changed;
}

let assetCreateLock = false;
let initialAssetListSync: Promise<boolean> | null = null;

async function ensureInitialAssetListSync(): Promise<void> {
  if (!initialAssetListSync) {
    initialAssetListSync = syncRemoteAssets().catch(() => false);
  }
  await initialAssetListSync;
}

function buildLocalAsset(body: Partial<SalesDeskFixedAssetDto>, id: number): SalesDeskFixedAssetDto {
  return {
    id,
    code: body.code?.trim() || `DMR-LOCAL-${id}`,
    name: body.name?.trim() || 'Demirbas',
    category: body.category?.trim() || null,
    purchaseDate: body.purchaseDate || new Date().toISOString(),
    value: body.value ?? 0,
    status: body.status ?? 1,
  };
}

export const salesDeskAssetsApi = {
  listLocalPaged(params?: PagedParams): PagedResponse<SalesDeskFixedAssetDto> {
    return buildAssetListPage(listLocalAssets(), params);
  },

  list: async (params?: PagedParams): Promise<PagedResponse<SalesDeskFixedAssetDto>> => {
    await ensureInitialAssetListSync();
    void syncRemoteAssets();
    return buildAssetListPage(listLocalAssets(), params);
  },

  syncRemoteAssets,

  create: async (body: Partial<SalesDeskFixedAssetDto>): Promise<SalesDeskFixedAssetDto> => {
    if (assetCreateLock) {
      throw new Error('Demirbas kaydi devam ediyor, lutfen bekleyin.');
    }

    assetCreateLock = true;
    try {
      const remote = await tryRemoteCreate(body);
      if (remote) {
        const store = readStore();
        const index = store.assets.findIndex((item) => item.id === remote.id);
        if (index >= 0) {
          store.assets[index] = remote;
        } else {
          store.assets = sortAssets([remote, ...store.assets], { sortBy: 'Name', sortDirection: 'asc' });
        }
        writeStore(store);
        notifyAssetsSynced();
        return remote;
      }

      const store = readStore();
      const asset = buildLocalAsset(body, store.seq);
      store.seq += 1;
      store.assets = sortAssets([asset, ...store.assets], { sortBy: 'Name', sortDirection: 'asc' });
      writeStore(store);
      notifyAssetsSynced();

      void tryRemoteCreate(body).then((remoteAsset) => {
        if (!remoteAsset) return;
        const syncedStore = readStore();
        syncedStore.assets = syncedStore.assets.filter((item) => item.id !== asset.id);
        syncedStore.assets = sortAssets(
          [remoteAsset, ...syncedStore.assets.filter((item) => item.id !== remoteAsset.id)],
          { sortBy: 'Name', sortDirection: 'asc' },
        );
        writeStore(syncedStore);
        notifyAssetsSynced();
      });

      return asset;
    } finally {
      assetCreateLock = false;
    }
  },

  update: async (id: number, body: Partial<SalesDeskFixedAssetDto>): Promise<SalesDeskFixedAssetDto> => {
    if (!isLocalId(id)) {
      const remote = await salesDeskApi.assets.update(id, body);
      const store = readStore();
      const index = store.assets.findIndex((item) => item.id === id);
      if (index >= 0) {
        store.assets[index] = remote;
      } else {
        store.assets = sortAssets([remote, ...store.assets], { sortBy: 'Name', sortDirection: 'asc' });
      }
      writeStore(store);
      notifyAssetsSynced();
      return remote;
    }

    const store = readStore();
    const index = store.assets.findIndex((item) => item.id === id);
    if (index < 0) {
      throw new Error('Demirbas bulunamadi.');
    }

    const updated = buildLocalAsset({ ...store.assets[index], ...body }, id);
    store.assets[index] = updated;
    writeStore(store);
    notifyAssetsSynced();

    void tryRemoteCreate(body).then((remoteAsset) => {
      if (!remoteAsset) return;
      const syncedStore = readStore();
      syncedStore.assets = syncedStore.assets.filter((item) => item.id !== id);
      syncedStore.assets = sortAssets(
        [remoteAsset, ...syncedStore.assets.filter((item) => item.id !== remoteAsset.id)],
        { sortBy: 'Name', sortDirection: 'asc' },
      );
      writeStore(syncedStore);
      notifyAssetsSynced();
    });

    return updated;
  },

  delete: async (id: number): Promise<void> => {
    if (!isLocalId(id)) {
      await salesDeskApi.assets.delete(id);
    }

    const store = readStore();
    store.assets = store.assets.filter((item) => item.id !== id);
    writeStore(store);
    notifyAssetsSynced();
  },
};
