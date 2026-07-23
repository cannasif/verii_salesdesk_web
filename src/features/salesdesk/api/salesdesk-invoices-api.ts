import { normalizePagedResponse } from '@/lib/paged-response';
import type { PagedParams, PagedResponse } from '@/types/api';
import type { SalesDeskInvoiceCreateBody, SalesDeskInvoiceDto } from './salesdesk-api';
import { salesDeskApi } from './salesdesk-api';
import {
  calculateInvoiceLineTotal,
  calculateInvoiceTotals,
  type InvoiceLineFormState,
} from '../types/invoice-create-types';
import {
  invoiceFormSchema,
  normalizeInvoiceFormInput,
  toInvoicePayload,
  type InvoiceFormValues,
} from '../types/salesdesk-schemas';
import { SALES_DESK_INVOICE_TYPE, type SalesDeskInvoiceType } from '../types/invoice-types';
import { tryWithSalesDeskFastTimeout } from '../lib/salesdesk-fast-timeout';

/** v2 — onceki karisik v1 verisini devre disi birakir. */
const STORAGE_KEY = 'salesdesk-invoices-v2';
const LEGACY_STORAGE_KEY = 'salesdesk-invoices-v1';
const LOCAL_ID_START = 910_000;
const INVOICES_SYNCED_EVENT = 'salesdesk-invoices-synced';
const REMOTE_CREATE_TIMEOUT_MS = 15_000;
const SYNC_MIN_INTERVAL_MS = 30_000;
const PENDING_MAX_AGE_MS = 24 * 60 * 60 * 1000;

interface PendingSync {
  localId: number;
  invoiceType: SalesDeskInvoiceType;
  customerId: number;
  invoiceDate: string;
  grandTotal: number;
  createdAt: number;
}

interface InvoiceStore {
  seq: number;
  invoices: SalesDeskInvoiceDto[];
  pending: PendingSync[];
}

export interface CreateSalesDeskInvoiceInput {
  values: InvoiceFormValues;
  lines: InvoiceLineFormState[];
  customerName: string;
}

let createLock = false;
let lastSyncAt = 0;
let syncInFlight: Promise<boolean> | null = null;
let initialListSync: Promise<boolean> | null = null;
const remoteCreateByLocalId = new Map<number, Promise<SalesDeskInvoiceDto | null>>();

function inferInvoiceType(invoiceNumber?: string | null, invoiceType?: SalesDeskInvoiceType): SalesDeskInvoiceType {
  if (invoiceType === 2) return 2;
  const normalized = invoiceNumber?.trim().toUpperCase() ?? '';
  if (normalized.startsWith('ALF') || normalized.includes('ALIS')) return 2;
  return 1;
}

function normalizeInvoice(
  dto: SalesDeskInvoiceDto,
  fallbackType?: SalesDeskInvoiceType
): SalesDeskInvoiceDto {
  return {
    ...dto,
    invoiceType: inferInvoiceType(dto.invoiceNumber, dto.invoiceType ?? fallbackType),
    customerName: dto.customerName?.trim() || 'Cari',
    lines: Array.isArray(dto.lines) ? dto.lines : [],
  };
}

function readStore(): InvoiceStore {
  if (typeof window === 'undefined') {
    return { seq: LOCAL_ID_START, invoices: [], pending: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY);
      return { seq: LOCAL_ID_START, invoices: [], pending: [] };
    }

    const parsed = JSON.parse(raw) as Partial<InvoiceStore>;
    return {
      seq: typeof parsed.seq === 'number' ? parsed.seq : LOCAL_ID_START,
      invoices: Array.isArray(parsed.invoices)
        ? parsed.invoices.map((item) => normalizeInvoice(item as SalesDeskInvoiceDto))
        : [],
      pending: Array.isArray(parsed.pending) ? parsed.pending : [],
    };
  } catch {
    return { seq: LOCAL_ID_START, invoices: [], pending: [] };
  }
}

function writeStore(store: InvoiceStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function notifyInvoicesSynced(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(INVOICES_SYNCED_EVENT));
}

function isLocalId(id: number): boolean {
  return id >= LOCAL_ID_START;
}

function defaultInvoiceNumber(id: number, invoiceType: number): string {
  const prefix = invoiceType === SALES_DESK_INVOICE_TYPE.purchase ? 'ALF' : 'SAF';
  return `${prefix}-${String(id).padStart(5, '0')}`;
}

function buildInvoiceDto(input: CreateSalesDeskInvoiceInput, id: number): SalesDeskInvoiceDto {
  const parsed = invoiceFormSchema.parse(normalizeInvoiceFormInput(input.values));
  const discountRate = parsed.discountRate ?? 0;
  const totals = calculateInvoiceTotals(input.lines, discountRate);
  const invoiceType = Number(parsed.invoiceType) as SalesDeskInvoiceType;

  return {
    id,
    invoiceNumber: parsed.invoiceNumber?.trim() || defaultInvoiceNumber(id, invoiceType),
    invoiceType,
    customerId: parsed.customerId,
    customerName: input.customerName.trim() || 'Cari',
    quoteId: parsed.quoteId ?? null,
    invoiceDate: parsed.invoiceDate,
    dueDate: parsed.dueDate,
    status: parsed.status,
    discountRate,
    discountTotal: totals.discountTotal,
    subTotal: totals.subTotal,
    vatTotal: totals.vatTotal,
    grandTotal: totals.grandTotal,
    notes: parsed.notes?.trim() || null,
    lines: input.lines.map((line, index) => ({
      id: index + 1,
      productId: line.productId,
      productCode: line.productCode,
      productName: line.productName,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
      lineTotal: calculateInvoiceLineTotal(line),
      description: line.description?.trim() || null,
    })),
  };
}

/** Yinelenen id / fatura no — icerik eslesmesi YOK (ayni cari/tutarda yeni fatura acilabilir). */
function dedupeInvoices(invoices: SalesDeskInvoiceDto[]): SalesDeskInvoiceDto[] {
  const byId = new Map<number, SalesDeskInvoiceDto>();
  for (const invoice of invoices) {
    byId.set(invoice.id, invoice);
  }

  const winnerByNumber = new Map<string, SalesDeskInvoiceDto>();
  for (const invoice of byId.values()) {
    const invoiceNumber = invoice.invoiceNumber?.trim();
    if (!invoiceNumber) continue;

    const existing = winnerByNumber.get(invoiceNumber);
    if (!existing) {
      winnerByNumber.set(invoiceNumber, invoice);
      continue;
    }

    const keepExisting =
      isLocalId(invoice.id) && !isLocalId(existing.id)
        ? false
        : !isLocalId(invoice.id) && isLocalId(existing.id)
          ? true
          : existing.id >= invoice.id;

    winnerByNumber.set(invoiceNumber, keepExisting ? existing : invoice);
  }

  return [...byId.values()].filter((invoice) => {
    const invoiceNumber = invoice.invoiceNumber?.trim();
    if (!invoiceNumber) return true;
    return winnerByNumber.get(invoiceNumber)?.id === invoice.id;
  });
}

function pruneExpiredPending(pending: PendingSync[]): PendingSync[] {
  const cutoff = Date.now() - PENDING_MAX_AGE_MS;
  return pending.filter((item) => item.createdAt >= cutoff);
}

function findRemoteForPending(
  pending: PendingSync,
  remotes: SalesDeskInvoiceDto[]
): SalesDeskInvoiceDto | undefined {
  const candidates = remotes.filter(
    (remote) =>
      !isLocalId(remote.id) &&
      remote.customerId === pending.customerId &&
      remote.invoiceDate === pending.invoiceDate &&
      inferInvoiceType(remote.invoiceNumber, remote.invoiceType) === pending.invoiceType &&
      Math.abs(remote.grandTotal - pending.grandTotal) < 0.01
  );

  if (candidates.length === 0) return undefined;
  return candidates.sort((left, right) => right.id - left.id)[0];
}

function mergeRemoteIntoLocalStore(remoteInvoices: SalesDeskInvoiceDto[]): boolean {
  if (remoteInvoices.length === 0) return false;

  const store = readStore();
  let invoices = [...store.invoices];
  let pending = pruneExpiredPending(store.pending);
  const consumedRemoteIds = new Set<number>();

  for (const entry of pending) {
    const remote = findRemoteForPending(entry, remoteInvoices);
    if (!remote) continue;

    invoices = invoices.filter((invoice) => invoice.id !== entry.localId);
    pending = pending.filter((item) => item.localId !== entry.localId);

    const enriched = normalizeInvoice(remote, entry.invoiceType);
    const existingIndex = invoices.findIndex((invoice) => invoice.id === enriched.id);
    if (existingIndex >= 0) {
      invoices[existingIndex] = enriched;
    } else {
      invoices.push(enriched);
    }
    consumedRemoteIds.add(enriched.id);
  }

  for (const remote of remoteInvoices) {
    if (consumedRemoteIds.has(remote.id)) continue;

    const enriched = normalizeInvoice(remote);
    const existingIndex = invoices.findIndex((invoice) => invoice.id === enriched.id);
    if (existingIndex >= 0) {
      invoices[existingIndex] = enriched;
    } else {
      invoices.push(enriched);
    }
  }

  const deduped = dedupeInvoices(invoices);
  const changed =
    deduped.length !== store.invoices.length ||
    pending.length !== store.pending.length ||
    deduped.some((invoice, index) => invoice.id !== store.invoices[index]?.id);

  if (!changed) return false;

  store.invoices = deduped;
  store.pending = pending;
  writeStore(store);
  return true;
}

function replaceLocalWithRemote(localId: number, remote: SalesDeskInvoiceDto, invoiceType: SalesDeskInvoiceType): void {
  const store = readStore();
  const enriched = normalizeInvoice(remote, invoiceType);

  store.invoices = dedupeInvoices([
    enriched,
    ...store.invoices.filter((invoice) => invoice.id !== localId && invoice.id !== enriched.id),
  ]);
  store.pending = store.pending.filter((item) => item.localId !== localId);
  writeStore(store);
  notifyInvoicesSynced();
}

async function tryRemoteCreate(body: SalesDeskInvoiceCreateBody): Promise<SalesDeskInvoiceDto | null> {
  return tryWithSalesDeskFastTimeout(salesDeskApi.invoices.create(body), REMOTE_CREATE_TIMEOUT_MS);
}

function scheduleRemoteCreate(
  body: SalesDeskInvoiceCreateBody,
  localInvoice: SalesDeskInvoiceDto,
  pending: PendingSync
): void {
  if (remoteCreateByLocalId.has(localInvoice.id)) return;

  const promise = tryWithSalesDeskFastTimeout(
    salesDeskApi.invoices.create(body),
    REMOTE_CREATE_TIMEOUT_MS
  );

  remoteCreateByLocalId.set(localInvoice.id, promise);
  void promise
    .then((remote) => {
      if (remote) {
        replaceLocalWithRemote(localInvoice.id, remote, pending.invoiceType);
      }
    })
    .finally(() => {
      remoteCreateByLocalId.delete(localInvoice.id);
    });
}

async function tryRemoteListAll(): Promise<SalesDeskInvoiceDto[] | null> {
  const remotePage = await tryWithSalesDeskFastTimeout(
    salesDeskApi.invoices.list({
      pageNumber: 1,
      pageSize: 500,
      sortBy: 'InvoiceDate',
      sortDirection: 'desc',
    }),
    8_000
  );
  return remotePage?.data ?? null;
}

async function syncRemoteInvoicesInternal(): Promise<boolean> {
  const remoteRows = await tryRemoteListAll();
  if (!remoteRows) return false;
  const changed = mergeRemoteIntoLocalStore(remoteRows);
  if (changed) notifyInvoicesSynced();
  return changed;
}

function scheduleBackgroundSync(force = false): void {
  if (!force && Date.now() - lastSyncAt < SYNC_MIN_INTERVAL_MS) return;
  if (syncInFlight) return;

  syncInFlight = syncRemoteInvoicesInternal().finally(() => {
    lastSyncAt = Date.now();
    syncInFlight = null;
  });
}

function listLocalInvoices(): SalesDeskInvoiceDto[] {
  const store = readStore();
  const deduped = dedupeInvoices(store.invoices);
  const pending = pruneExpiredPending(store.pending);

  if (deduped.length !== store.invoices.length || pending.length !== store.pending.length) {
    store.invoices = deduped;
    store.pending = pending;
    writeStore(store);
    notifyInvoicesSynced();
  }

  return store.invoices;
}

function sortInvoices(rows: SalesDeskInvoiceDto[], params?: PagedParams): SalesDeskInvoiceDto[] {
  const sortBy = (params?.sortBy ?? 'InvoiceDate').toLowerCase();
  const direction = params?.sortDirection === 'asc' ? 1 : -1;

  const fieldMap: Record<string, keyof SalesDeskInvoiceDto> = {
    id: 'id',
    invoicenumber: 'invoiceNumber',
    customername: 'customerName',
    invoicedate: 'invoiceDate',
    duedate: 'dueDate',
    status: 'status',
    subtotal: 'subTotal',
    grandtotal: 'grandTotal',
  };

  const field = fieldMap[sortBy.replace(/[^a-z0-9]/g, '')] ?? 'invoiceDate';

  return [...rows].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'tr') * direction;
  });
}

function filterInvoices(rows: SalesDeskInvoiceDto[], params?: PagedParams): SalesDeskInvoiceDto[] {
  const search = params?.search?.trim().toLocaleLowerCase('tr-TR');
  if (!search) return rows;

  return rows.filter((row) =>
    [
      row.invoiceNumber,
      row.customerName,
      row.notes,
      (row.lines ?? []).map((line) => line.productName).join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(search)
  );
}

export function buildSalesDeskInvoiceListPage(
  rows: SalesDeskInvoiceDto[],
  params?: PagedParams
): PagedResponse<SalesDeskInvoiceDto> {
  const filtered = filterInvoices(rows, params);
  const sorted = sortInvoices(filtered, params);
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;

  return normalizePagedResponse<SalesDeskInvoiceDto>(
    {
      data: sorted.slice(start, start + pageSize),
      totalCount,
      pageNumber,
      totalPages,
      pageSize,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
    { pageNumber, pageSize }
  );
}

async function ensureInitialListSync(): Promise<void> {
  if (!initialListSync) {
    initialListSync = syncRemoteInvoicesInternal().catch(() => false);
  }
  await initialListSync;
}

export const salesDeskInvoicesApi = {
  listLocalPaged(params?: PagedParams): PagedResponse<SalesDeskInvoiceDto> {
    return buildSalesDeskInvoiceListPage(listLocalInvoices(), params);
  },

  list: async (params?: PagedParams): Promise<PagedResponse<SalesDeskInvoiceDto>> => {
    await ensureInitialListSync();
    scheduleBackgroundSync(false);
    return buildSalesDeskInvoiceListPage(listLocalInvoices(), params);
  },

  syncRemoteInvoices: async (options?: { force?: boolean }): Promise<boolean> => {
    if (options?.force) {
      lastSyncAt = 0;
      syncInFlight = null;
    }

    if (!options?.force && Date.now() - lastSyncAt < SYNC_MIN_INTERVAL_MS) {
      return false;
    }

    if (syncInFlight) {
      return syncInFlight;
    }

    syncInFlight = syncRemoteInvoicesInternal().finally(() => {
      lastSyncAt = Date.now();
      syncInFlight = null;
    });

    return syncInFlight;
  },

  get: async (id: number): Promise<SalesDeskInvoiceDto> => {
    const local = listLocalInvoices().find((item) => item.id === id);
    if (local) return local;
    return salesDeskApi.invoices.get(id);
  },

  create: async (
    input: CreateSalesDeskInvoiceInput
  ): Promise<{ invoice: SalesDeskInvoiceDto; savedLocally: boolean }> => {
    if (createLock) {
      throw new Error('Fatura kaydi devam ediyor, lutfen bekleyin.');
    }

    const validLines = input.lines.filter((line) => line.productId > 0 && line.quantity > 0);
    if (input.lines.length > 0 && validLines.length === 0) {
      throw new Error('Kalemlerde urun secimi ve miktar zorunludur.');
    }

    const linePayload = validLines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
    }));
    const body = toInvoicePayload(input.values, linePayload);

    createLock = true;
    try {
      const remote = await tryRemoteCreate(body);
      if (remote) {
        mergeRemoteIntoLocalStore([normalizeInvoice(remote)]);
        notifyInvoicesSynced();
        return { invoice: normalizeInvoice(remote), savedLocally: false };
      }

      const store = readStore();
      const invoice = buildInvoiceDto({ ...input, lines: validLines }, store.seq);
      const pending: PendingSync = {
        localId: invoice.id,
        invoiceType: invoice.invoiceType ?? SALES_DESK_INVOICE_TYPE.sales,
        customerId: invoice.customerId,
        invoiceDate: invoice.invoiceDate,
        grandTotal: invoice.grandTotal,
        createdAt: Date.now(),
      };

      store.seq += 1;
      store.invoices = dedupeInvoices([invoice, ...store.invoices]);
      store.pending = pruneExpiredPending([...store.pending, pending]);
      writeStore(store);
      notifyInvoicesSynced();

      scheduleRemoteCreate(body, invoice, pending);
      return { invoice, savedLocally: true };
    } finally {
      createLock = false;
    }
  },

  update: async (
    id: number,
    input: CreateSalesDeskInvoiceInput
  ): Promise<{ invoice: SalesDeskInvoiceDto; savedLocally: boolean }> => {
    const validLines = input.lines.filter((line) => line.productId > 0 && line.quantity > 0);
    const linePayload = (validLines.length > 0 ? validLines : input.lines).map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate,
    }));
    const body = toInvoicePayload(input.values, linePayload);

    if (!isLocalId(id)) {
      try {
        const invoice = await salesDeskApi.invoices.update(id, body);
        mergeRemoteIntoLocalStore([invoice]);
        notifyInvoicesSynced();
        return { invoice, savedLocally: false };
      } catch (error) {
        if (error instanceof Error) throw error;
        throw new Error('Fatura guncellenemedi.');
      }
    }

    const store = readStore();
    const localIndex = store.invoices.findIndex((item) => item.id === id);
    if (localIndex < 0) {
      throw new Error('Fatura bulunamadi.');
    }

    const invoice = buildInvoiceDto(
      { ...input, lines: validLines.length > 0 ? validLines : input.lines },
      id
    );
    store.invoices[localIndex] = invoice;
    writeStore(store);
    notifyInvoicesSynced();
    return { invoice, savedLocally: true };
  },

  delete: async (id: number): Promise<void> => {
    const store = readStore();
    const before = store.invoices.length;
    store.invoices = store.invoices.filter((item) => item.id !== id);
    store.pending = store.pending.filter((item) => item.localId !== id);

    if (store.invoices.length !== before) {
      writeStore(store);
      notifyInvoicesSynced();
      if (!isLocalId(id)) {
        try {
          await salesDeskApi.invoices.delete(id);
        } catch {
          // Yerel silindi; sunucu sonra senkronlanir.
        }
      }
      return;
    }

    await salesDeskApi.invoices.delete(id);
    await syncRemoteInvoicesInternal();
  },

  /** Karisik yerel veriyi sifirlar (sunucu kayitlari yeniden cekilir). */
  resetLocalStore: async (): Promise<void> => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(LEGACY_STORAGE_KEY);
    lastSyncAt = 0;
    syncInFlight = null;
    remoteCreateByLocalId.clear();
    await syncRemoteInvoicesInternal();
    notifyInvoicesSynced();
  },
};

export { INVOICES_SYNCED_EVENT };
