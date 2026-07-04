import { normalizePagedResponse } from '@/lib/paged-response';
import type { PagedParams, PagedResponse } from '@/types/api';
import type { SalesDeskQuoteCreateBody, SalesDeskQuoteDto } from './salesdesk-api';
import { salesDeskApi } from './salesdesk-api';
import {
  calculateInvoiceLineTotal,
  calculateInvoiceTotals,
  type InvoiceLineFormState,
} from '../types/invoice-create-types';
import { quoteFormSchema, normalizeQuoteFormInput, toQuotePayload, type QuoteFormValues } from '../types/salesdesk-schemas';
import { tryWithSalesDeskFastTimeout } from '../lib/salesdesk-fast-timeout';

const STORAGE_KEY = 'salesdesk-quotes-v1';
const LOCAL_ID_START = 900_000;
const QUOTES_SYNCED_EVENT = 'salesdesk-quotes-synced';

interface QuoteStore {
  seq: number;
  quotes: SalesDeskQuoteDto[];
}

export interface CreateSalesDeskQuoteInput {
  values: QuoteFormValues;
  lines: InvoiceLineFormState[];
  customerName: string;
}

function normalizeQuote(dto: SalesDeskQuoteDto): SalesDeskQuoteDto {
  return {
    ...dto,
    lines: Array.isArray(dto.lines) ? dto.lines : [],
  };
}

function readStore(): QuoteStore {
  if (typeof window === 'undefined') {
    return { seq: LOCAL_ID_START, quotes: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { seq: LOCAL_ID_START, quotes: [] };
    const parsed = JSON.parse(raw) as Partial<QuoteStore>;
    return {
      seq: typeof parsed.seq === 'number' ? parsed.seq : LOCAL_ID_START,
      quotes: Array.isArray(parsed.quotes) ? parsed.quotes.map((item) => normalizeQuote(item as SalesDeskQuoteDto)) : [],
    };
  } catch {
    return { seq: LOCAL_ID_START, quotes: [] };
  }
}

function writeStore(store: QuoteStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function listLocalQuotes(): SalesDeskQuoteDto[] {
  return readStore().quotes;
}

function notifyQuotesSynced(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(QUOTES_SYNCED_EVENT));
}

function buildQuoteDto(input: CreateSalesDeskQuoteInput, id: number): SalesDeskQuoteDto {
  const parsed = quoteFormSchema.parse(normalizeQuoteFormInput(input.values));
  const discountRate = parsed.discountRate ?? 0;
  const totals = calculateInvoiceTotals(input.lines, discountRate);

  return {
    id,
    quoteNumber: parsed.quoteNumber?.trim() || `TKL-${String(id).padStart(5, '0')}`,
    customerId: parsed.customerId,
    customerName: input.customerName.trim() || 'Musteri',
    quoteDate: parsed.quoteDate,
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
    })),
  };
}

function sortQuotes(rows: SalesDeskQuoteDto[], params?: PagedParams): SalesDeskQuoteDto[] {
  const sortBy = (params?.sortBy ?? 'QuoteDate').toLowerCase();
  const direction = params?.sortDirection === 'asc' ? 1 : -1;

  const fieldMap: Record<string, keyof SalesDeskQuoteDto> = {
    id: 'id',
    quotenumber: 'quoteNumber',
    customername: 'customerName',
    quotedate: 'quoteDate',
    status: 'status',
    subtotal: 'subTotal',
    grandtotal: 'grandTotal',
  };

  const field = fieldMap[sortBy.replace(/[^a-z0-9]/g, '')] ?? 'quoteDate';

  return [...rows].sort((left, right) => {
    const leftValue = left[field];
    const rightValue = right[field];
    if (typeof leftValue === 'number' && typeof rightValue === 'number') {
      return (leftValue - rightValue) * direction;
    }
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'tr') * direction;
  });
}

function filterQuotes(rows: SalesDeskQuoteDto[], params?: PagedParams): SalesDeskQuoteDto[] {
  const search = params?.search?.trim().toLocaleLowerCase('tr-TR');
  if (!search) return rows;

  return rows.filter((row) =>
    [
      row.quoteNumber,
      row.customerName,
      row.notes,
      (row.lines ?? []).map((line) => line.productName).join(' '),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(search),
  );
}

export function buildSalesDeskQuoteListPage(
  rows: SalesDeskQuoteDto[],
  params?: PagedParams,
): PagedResponse<SalesDeskQuoteDto> {
  const filtered = filterQuotes(rows, params);
  const sorted = sortQuotes(filtered, params);
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const totalCount = sorted.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;

  return normalizePagedResponse<SalesDeskQuoteDto>(
    {
      data: sorted.slice(start, start + pageSize),
      totalCount,
      pageNumber,
      totalPages,
      pageSize,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
    { pageNumber, pageSize },
  );
}

function mergeRemoteIntoLocalStore(remoteQuotes: SalesDeskQuoteDto[]): boolean {
  if (remoteQuotes.length === 0) return false;

  const store = readStore();
  const byId = new Map<number, SalesDeskQuoteDto>();

  for (const quote of store.quotes) {
    byId.set(quote.id, quote);
  }

  for (const remote of remoteQuotes.map(normalizeQuote)) {
    const existing = byId.get(remote.id);
    if (existing && existing.id >= LOCAL_ID_START && !remote.quoteNumber) {
      continue;
    }
    byId.set(remote.id, remote);
  }

  const merged = Array.from(byId.values());
  const changed =
    merged.length !== store.quotes.length ||
    merged.some((quote, index) => quote.id !== store.quotes[index]?.id);

  if (!changed) return false;

  store.quotes = merged;
  writeStore(store);
  return true;
}

function isRemoteQuoteWriteError(error: unknown): boolean {
  return error instanceof Error;
}

async function tryRemoteCreate(body: SalesDeskQuoteCreateBody): Promise<SalesDeskQuoteDto | null> {
  return tryWithSalesDeskFastTimeout(salesDeskApi.quotes.create(body));
}

async function tryRemoteListAll(): Promise<SalesDeskQuoteDto[] | null> {
  const remotePage = await tryWithSalesDeskFastTimeout(
    salesDeskApi.quotes.list({
      pageNumber: 1,
      pageSize: 500,
      sortBy: 'QuoteDate',
      sortDirection: 'desc',
    }),
  );
  return remotePage?.data ?? null;
}

async function syncRemoteQuotes(): Promise<boolean> {
  const remoteRows = await tryRemoteListAll();
  if (!remoteRows) return false;
  const changed = mergeRemoteIntoLocalStore(remoteRows);
  if (changed) notifyQuotesSynced();
  return changed;
}

export const salesDeskQuotesApi = {
  /** Anlik yerel liste — sunucu beklenmez. */
  listLocalPaged(params?: PagedParams): PagedResponse<SalesDeskQuoteDto> {
    return buildSalesDeskQuoteListPage(listLocalQuotes(), params);
  },

  list: async (params?: PagedParams): Promise<PagedResponse<SalesDeskQuoteDto>> => {
    void syncRemoteQuotes();
    return buildSalesDeskQuoteListPage(listLocalQuotes(), params);
  },

  syncRemoteQuotes,

  get: async (id: number): Promise<SalesDeskQuoteDto> => {
    const local = listLocalQuotes().find((item) => item.id === id);
    if (local) return local;

    return salesDeskApi.quotes.get(id);
  },

  create: async (input: CreateSalesDeskQuoteInput): Promise<{ quote: SalesDeskQuoteDto; savedLocally: boolean }> => {
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

    const body = toQuotePayload(input.values, linePayload);

    const store = readStore();
    const quote = buildQuoteDto({ ...input, lines: validLines }, store.seq);
    store.seq += 1;
    store.quotes = [quote, ...store.quotes];
    writeStore(store);
    notifyQuotesSynced();

    void tryRemoteCreate(body).then((remoteQuote) => {
      if (!remoteQuote) return;
      const syncedStore = readStore();
      const index = syncedStore.quotes.findIndex((item) => item.id === quote.id);
      if (index >= 0) {
        syncedStore.quotes[index] = { ...remoteQuote, id: quote.id };
        writeStore(syncedStore);
        notifyQuotesSynced();
      }
    });

    return { quote, savedLocally: true };
  },

  update: async (id: number, input: CreateSalesDeskQuoteInput): Promise<{ quote: SalesDeskQuoteDto; savedLocally: boolean }> => {
    const store = readStore();
    const localIndex = store.quotes.findIndex((item) => item.id === id);

    if (localIndex >= 0) {
      const validLines = input.lines.filter((line) => line.productId > 0 && line.quantity > 0);
      const quote = buildQuoteDto({ ...input, lines: validLines.length > 0 ? validLines : input.lines }, id);
      store.quotes[localIndex] = quote;
      writeStore(store);
      notifyQuotesSynced();
      return { quote, savedLocally: true };
    }

    try {
      const validLines = input.lines.filter((line) => line.productId > 0 && line.quantity > 0);
      const body = toQuotePayload(
        input.values,
        validLines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          vatRate: line.vatRate,
        })),
      );
      const quote = await salesDeskApi.quotes.update(id, body);
      return { quote, savedLocally: false };
    } catch (error) {
      if (!isRemoteQuoteWriteError(error)) throw error;
      throw new Error('Teklif guncellenemedi.');
    }
  },

  delete: async (id: number): Promise<void> => {
    const store = readStore();
    const before = store.quotes.length;
    store.quotes = store.quotes.filter((item) => item.id !== id);
    if (store.quotes.length !== before) {
      writeStore(store);
      notifyQuotesSynced();
      return;
    }

    await salesDeskApi.quotes.delete(id);
  },
};

export { QUOTES_SYNCED_EVENT };
