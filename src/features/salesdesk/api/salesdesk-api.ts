import { api } from '@/lib/axios';
import axios, { type AxiosRequestConfig } from 'axios';
import { normalizePagedResponse } from '@/lib/paged-response';
import type { ApiResponse, PagedParams, PagedResponse } from '@/types/api';
import { isWeeklyPlanTask } from '../lib/salesdesk-weekly-plan';
import { isSalesDeskActivityTask } from '../lib/salesdesk-activities';

export type SalesDeskCustomerKind = 1 | 2 | 3;
export type SalesDeskPotentialStatus = 1 | 2 | 3 | 4 | 5 | 6;
export type SalesDeskDocumentStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SalesDeskPriority = 1 | 2 | 3 | 4;
export type SalesDeskTaskStatus = 1 | 2 | 3 | 4;
export type SalesDeskVisitStatus = 1 | 2 | 3;
export type SalesDeskFixedAssetStatus = 1 | 2 | 3;
export type SalesDeskRecurringPaymentType = 1 | 2;
export type SalesDeskInvoiceType = 1 | 2;

export interface SalesDeskDashboardDto {
  customerCount: number;
  potentialCount: number;
  productCount: number;
  openTaskCount: number;
  todayVisitCount: number;
  pendingQuoteCount: number;
  toBeIssuedInvoiceCount: number;
  monthlySalesTotal: number;
}

export interface SalesDeskSearchResultDto {
  type: string;
  id: number;
  code: string;
  title: string;
  subtitle?: string | null;
  url?: string | null;
}

export interface SalesDeskCustomerDto {
  id: number;
  code: string;
  name: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  kind: SalesDeskCustomerKind;
  balance: number;
  city?: string | null;
  district?: string | null;
}

export interface SalesDeskPotentialCustomerDto {
  id: number;
  code: string;
  companyName: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  city?: string | null;
  district?: string | null;
  status: SalesDeskPotentialStatus;
  matchScore: number;
  lastResearchDate?: string | null;
}

export interface SalesDeskProductDto {
  id: number;
  code: string;
  name: string;
  category?: string | null;
  unit: string;
  salesPrice: number;
  stockQuantity: number;
  minimumStockQuantity: number;
  isLowStock: boolean;
}

export interface SalesDeskProductCustomerDto {
  id: number;
  productId: number;
  productCode: string;
  productName: string;
  customerId?: number | null;
  customerName?: string | null;
  potentialCustomerId?: number | null;
  potentialCustomerName?: string | null;
}

export interface SalesDeskLineDto {
  id: number;
  productId: number;
  productCode?: string | null;
  productName?: string | null;
  quantity: number;
  unitPrice: number;
  vatRate: number;
  lineTotal: number;
}

export interface SalesDeskLineUpsertDto {
  productId: number;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export type SalesDeskInvoiceCreateBody = Omit<Partial<SalesDeskInvoiceDto>, 'lines'> & {
  lines?: SalesDeskLineUpsertDto[];
};

export interface SalesDeskQuoteDto {
  id: number;
  quoteNumber: string;
  customerId: number;
  customerName: string;
  quoteDate: string;
  status: SalesDeskDocumentStatus;
  discountRate?: number;
  discountTotal?: number;
  subTotal: number;
  vatTotal: number;
  grandTotal: number;
  notes?: string | null;
  lines: SalesDeskLineDto[];
}

export type SalesDeskQuoteCreateBody = Omit<Partial<SalesDeskQuoteDto>, 'lines'> & {
  lines?: SalesDeskLineUpsertDto[];
};

export interface SalesDeskInvoiceDto {
  id: number;
  invoiceNumber: string;
  /** 1 = satis, 2 = alis */
  invoiceType?: SalesDeskInvoiceType;
  customerId: number;
  customerName: string;
  quoteId?: number | null;
  quoteNumber?: string | null;
  invoiceDate: string;
  dueDate: string;
  status: SalesDeskDocumentStatus;
  discountRate: number;
  discountTotal: number;
  subTotal: number;
  vatTotal: number;
  grandTotal: number;
  notes?: string | null;
  lines: SalesDeskLineDto[];
}

export interface SalesDeskTaskDto {
  id: number;
  title: string;
  description?: string | null;
  groupName?: string | null;
  customerId?: number | null;
  customerName?: string | null;
  assignedUserId?: number | null;
  priority: SalesDeskPriority;
  status: SalesDeskTaskStatus;
  dueDate?: string | null;
}

export interface SalesDeskVisitDto {
  id: number;
  visitDate: string;
  visitTime?: string | null;
  title: string;
  customerId?: number | null;
  customerName?: string | null;
  visitType: string;
  status: SalesDeskVisitStatus;
  notes?: string | null;
}

export interface SalesDeskVisitFormDto {
  id: number;
  visitId?: number | null;
  customerId?: number | null;
  customerName?: string | null;
  title: string;
  formDate: string;
  content?: string | null;
  ownerUserId?: number | null;
}

export interface SalesDeskFixedAssetDto {
  id: number;
  code: string;
  name: string;
  category?: string | null;
  purchaseDate: string;
  value: number;
  status: SalesDeskFixedAssetStatus;
}

export interface SalesDeskRecurringPaymentDto {
  id: number;
  name: string;
  type: SalesDeskRecurringPaymentType;
  category?: string | null;
  dayOfMonth: number;
  amount: number;
  customerId?: number | null;
  customerName?: string | null;
  isActive: boolean;
}

export interface SalesDeskSoftwareResearchDto {
  id: number;
  potentialCustomerId?: number | null;
  potentialCustomerName?: string | null;
  provider: string;
  keywords?: string | null;
  host?: string | null;
  sourceUrl?: string | null;
  score: number;
  status: SalesDeskPotentialStatus;
  researchedAt?: string | null;
}

export interface SalesDeskErpNewsItemDto {
  id: number;
  topic: string;
  title: string;
  source?: string | null;
  sourceUrl?: string | null;
  score: number;
  isCritical: boolean;
  isRead: boolean;
  publishedAt: string;
}

export interface SalesDeskGmailMessageDto {
  id: number;
  gmailMessageId: string;
  sender: string;
  subject: string;
  preview?: string | null;
  receivedAt: string;
  isUnread: boolean;
  isMeeting: boolean;
  threadId?: string | null;
}

const BASE = '/api/salesdesk';

function buildQuery(params: PagedParams = {}): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null || value === '') return;
    if (Array.isArray(value)) return;
    search.set(key, String(value));
  });
  const query = search.toString();
  return query ? `?${query}` : '';
}

function unwrapApiData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (response.success && response.data != null) {
    return response.data;
  }
  throw new Error(response.message || fallbackMessage);
}

async function getPaged<T>(
  path: string,
  params?: PagedParams,
  requestConfig?: AxiosRequestConfig
): Promise<PagedResponse<T>> {
  const response = await api.get<ApiResponse<PagedResponse<T>>>(
    `${BASE}/${path}${buildQuery(params)}`,
    { ...salesDeskReadConfig, ...requestConfig }
  );
  const paged = unwrapApiData(response, 'Liste yuklenemedi');
  return normalizePagedResponse<T>(paged, {
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
  });
}

const OPEN_TASK_STATUSES = new Set<SalesDeskTaskStatus>([1, 2]);

export function isOpenSalesDeskTask(task: SalesDeskTaskDto): boolean {
  return OPEN_TASK_STATUSES.has(task.status);
}

const OPEN_ITEMS_FETCH_SIZE = 50;
const ACTIVITIES_FETCH_SIZE = 30;
const SALESDESK_READ_TIMEOUT_MS = 30_000;
const SALESDESK_TASKS_WRITE_TIMEOUT_MS = 45_000;

const salesDeskReadConfig: AxiosRequestConfig = { timeout: SALESDESK_READ_TIMEOUT_MS };

export interface SalesDeskActivityStats {
  today: number;
  planned: number;
  completed: number;
}

export type SalesDeskActivitiesListResult = PagedResponse<SalesDeskTaskDto> & {
  activityStats: SalesDeskActivityStats;
};

function computeActivityStats(rows: SalesDeskTaskDto[]): SalesDeskActivityStats {
  const todayKey = new Date().toISOString().slice(0, 10);
  return {
    today: rows.filter((item) => item.dueDate?.slice(0, 10) === todayKey).length,
    planned: rows.filter((item) => item.status === 1 || item.status === 2).length,
    completed: rows.filter((item) => item.status === 3).length,
  };
}

function emptyTaskPage(params?: PagedParams): SalesDeskActivitiesListResult {
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  return {
    ...normalizePagedResponse<SalesDeskTaskDto>(
      {
        data: [],
        totalCount: 0,
        pageNumber,
        pageSize,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
      { pageNumber, pageSize }
    ),
    activityStats: { today: 0, planned: 0, completed: 0 },
  };
}

function emptyOpenItemsPage(params?: PagedParams): PagedResponse<SalesDeskTaskDto> {
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  return normalizePagedResponse<SalesDeskTaskDto>(
    {
      data: [],
      totalCount: 0,
      pageNumber,
      pageSize,
      totalPages: 1,
      hasPreviousPage: false,
      hasNextPage: false,
    },
    { pageNumber, pageSize }
  );
}

async function fetchActivitySourceRows(params?: PagedParams): Promise<SalesDeskTaskDto[]> {
  try {
    const result = await getPaged<SalesDeskTaskDto>('tasks', {
      pageNumber: 1,
      pageSize: ACTIVITIES_FETCH_SIZE,
      sortBy: params?.sortBy ?? 'DueDate',
      sortDirection: params?.sortDirection ?? 'desc',
      search: params?.search?.trim() || 'Aktivite',
    });
    return filterActivityTasks(result.data);
  } catch {
    return [];
  }
}

async function fetchOpenItemSourceRows(params?: PagedParams): Promise<SalesDeskTaskDto[]> {
  const fetchParams = {
    pageNumber: 1,
    pageSize: OPEN_ITEMS_FETCH_SIZE,
    sortBy: params?.sortBy ?? 'DueDate',
    sortDirection: params?.sortDirection ?? 'asc',
  };

  try {
    const result = await getPaged<SalesDeskTaskDto>('tasks/open-items', fetchParams);
    return filterOpenItemTasks(result.data);
  } catch (error) {
    if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
      return [];
    }

    try {
      const result = await getPaged<SalesDeskTaskDto>('tasks', fetchParams);
      return filterOpenItemTasks(result.data);
    } catch {
      return [];
    }
  }
}

function filterOpenItemTasks(tasks: SalesDeskTaskDto[]): SalesDeskTaskDto[] {
  return tasks.filter(
    (task) => isOpenSalesDeskTask(task) && !isWeeklyPlanTask(task) && !isSalesDeskActivityTask(task)
  );
}

function filterActivityTasks(tasks: SalesDeskTaskDto[]): SalesDeskTaskDto[] {
  return tasks.filter((task) => isSalesDeskActivityTask(task));
}

function matchesTaskSearch(task: SalesDeskTaskDto, search?: string): boolean {
  if (!search?.trim()) return true;
  const query = search.trim().toLocaleLowerCase('tr-TR');
  const haystack = [task.title, task.description, task.groupName, task.customerName]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase('tr-TR');
  return haystack.includes(query);
}

function paginateTaskRows(
  allRows: SalesDeskTaskDto[],
  params?: PagedParams
): PagedResponse<SalesDeskTaskDto> {
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const filteredRows = allRows.filter((task) => matchesTaskSearch(task, params?.search));
  const totalCount = filteredRows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;
  const pageRows = filteredRows.slice(start, start + pageSize);

  return normalizePagedResponse<SalesDeskTaskDto>(
    {
      data: pageRows,
      totalCount,
      pageNumber,
      pageSize,
      totalPages,
      hasPreviousPage: pageNumber > 1,
      hasNextPage: pageNumber < totalPages,
    },
    { pageNumber, pageSize }
  );
}

/** open-items endpoint yoksa veya hata verirse tasks listesinden acik kayitlari filtreler. */
async function listOpenItems(params?: PagedParams): Promise<PagedResponse<SalesDeskTaskDto>> {
  try {
    const sourceRows = await fetchOpenItemSourceRows(params);
    return paginateTaskRows(sourceRows, params);
  } catch {
    return emptyOpenItemsPage(params);
  }
}

/** SalesDesk aktivite kayitlari (groupName: Aktivite|...). */
async function listActivities(params?: PagedParams): Promise<SalesDeskActivitiesListResult> {
  try {
    const sourceRows = await fetchActivitySourceRows(params);
    return {
      ...paginateTaskRows(sourceRows, params),
      activityStats: computeActivityStats(sourceRows),
    };
  } catch {
    return emptyTaskPage(params);
  }
}

async function postPaged<T>(path: string, params?: PagedParams): Promise<PagedResponse<T>> {
  const response = await api.post<ApiResponse<PagedResponse<T>>>(
    `${BASE}/${path}/query`,
    params ?? {},
    salesDeskReadConfig
  );
  const paged = unwrapApiData(response, 'Liste yuklenemedi');
  return normalizePagedResponse<T>(paged, {
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
  });
}

async function getOne<T>(path: string, id: number): Promise<T> {
  const response = await api.get<ApiResponse<T>>(`${BASE}/${path}/${id}`, salesDeskReadConfig);
  return unwrapApiData(response, 'Kayit bulunamadi');
}

async function createOne<T, TBody>(
  path: string,
  body: TBody,
  requestConfig?: AxiosRequestConfig
): Promise<T> {
  const response = await api.post<ApiResponse<T>>(`${BASE}/${path}`, body, requestConfig);
  return unwrapApiData(response, 'Kayit olusturulamadi');
}

async function updateOne<T, TBody>(
  path: string,
  id: number,
  body: TBody,
  requestConfig?: AxiosRequestConfig
): Promise<T> {
  const response = await api.put<ApiResponse<T>>(`${BASE}/${path}/${id}`, body, {
    useNativeHttpMethod: true,
    ...requestConfig,
  });
  return unwrapApiData(response, 'Kayit guncellenemedi');
}

async function deleteOne(path: string, id: number): Promise<void> {
  const response = await api.delete<ApiResponse<unknown>>(`${BASE}/${path}/${id}`, { useNativeHttpMethod: true });
  if (!response.success) {
    throw new Error(response.message || 'Kayit silinemedi');
  }
}

export const salesDeskApi = {
  async dashboard(): Promise<SalesDeskDashboardDto> {
    const response = await api.get<ApiResponse<SalesDeskDashboardDto>>(`${BASE}/dashboard`, salesDeskReadConfig);
    return unwrapApiData(response, 'Dashboard yuklenemedi');
  },
  async search(q: string, take = 12): Promise<SalesDeskSearchResultDto[]> {
    const response = await api.get<ApiResponse<SalesDeskSearchResultDto[]>>(`${BASE}/search`, { params: { q, take } });
    return unwrapApiData(response, 'Arama yapilamadi');
  },

  customers: {
    list: (params?: PagedParams) => getPaged<SalesDeskCustomerDto>('customers', params),
    query: (params?: PagedParams) => postPaged<SalesDeskCustomerDto>('customers', params),
    get: (id: number) => getOne<SalesDeskCustomerDto>('customers', id),
    create: (body: Partial<SalesDeskCustomerDto>) => createOne<SalesDeskCustomerDto, Partial<SalesDeskCustomerDto>>('customers', body),
    update: (id: number, body: Partial<SalesDeskCustomerDto>) => updateOne<SalesDeskCustomerDto, Partial<SalesDeskCustomerDto>>('customers', id, body),
    delete: (id: number) => deleteOne('customers', id),
  },
  potentials: {
    list: (params?: PagedParams) => getPaged<SalesDeskPotentialCustomerDto>('potentials', params),
    query: (params?: PagedParams) => postPaged<SalesDeskPotentialCustomerDto>('potentials', params),
    get: (id: number) => getOne<SalesDeskPotentialCustomerDto>('potentials', id),
    create: (body: Partial<SalesDeskPotentialCustomerDto>) => createOne<SalesDeskPotentialCustomerDto, Partial<SalesDeskPotentialCustomerDto>>('potentials', body),
    update: (id: number, body: Partial<SalesDeskPotentialCustomerDto>) => updateOne<SalesDeskPotentialCustomerDto, Partial<SalesDeskPotentialCustomerDto>>('potentials', id, body),
    delete: (id: number) => deleteOne('potentials', id),
  },
  products: {
    list: (params?: PagedParams) => getPaged<SalesDeskProductDto>('products', params),
    query: (params?: PagedParams) => postPaged<SalesDeskProductDto>('products', params),
    get: (id: number) => getOne<SalesDeskProductDto>('products', id),
    create: (body: Partial<SalesDeskProductDto>) => createOne<SalesDeskProductDto, Partial<SalesDeskProductDto>>('products', body),
    update: (id: number, body: Partial<SalesDeskProductDto>) => updateOne<SalesDeskProductDto, Partial<SalesDeskProductDto>>('products', id, body),
    delete: (id: number) => deleteOne('products', id),
  },
  productCustomers: {
    list: (params?: PagedParams) => getPaged<SalesDeskProductCustomerDto>('product-customers', params),
    create: (body: Partial<SalesDeskProductCustomerDto>) => createOne<SalesDeskProductCustomerDto, Partial<SalesDeskProductCustomerDto>>('product-customers', body),
    delete: (id: number) => deleteOne('product-customers', id),
  },
  quotes: {
    list: (params?: PagedParams) => getPaged<SalesDeskQuoteDto>('quotes', params),
    get: (id: number) => getOne<SalesDeskQuoteDto>('quotes', id),
    create: (body: SalesDeskQuoteCreateBody) =>
      createOne<SalesDeskQuoteDto, SalesDeskQuoteCreateBody>('quotes', body),
    update: (id: number, body: SalesDeskQuoteCreateBody) =>
      updateOne<SalesDeskQuoteDto, SalesDeskQuoteCreateBody>('quotes', id, body),
    delete: (id: number) => deleteOne('quotes', id),
  },
  invoices: {
    list: (params?: PagedParams) => getPaged<SalesDeskInvoiceDto>('invoices', params),
    get: (id: number) => getOne<SalesDeskInvoiceDto>('invoices', id),
    create: (body: SalesDeskInvoiceCreateBody) =>
      createOne<SalesDeskInvoiceDto, SalesDeskInvoiceCreateBody>('invoices', body),
    update: (id: number, body: SalesDeskInvoiceCreateBody) =>
      updateOne<SalesDeskInvoiceDto, SalesDeskInvoiceCreateBody>('invoices', id, body),
    delete: (id: number) => deleteOne('invoices', id),
  },
  tasks: {
    list: (params?: PagedParams) => getPaged<SalesDeskTaskDto>('tasks', params),
    openItems: (params?: PagedParams) => listOpenItems(params),
    activities: (params?: PagedParams) => listActivities(params),
    create: (body: Partial<SalesDeskTaskDto>) =>
      createOne<SalesDeskTaskDto, Partial<SalesDeskTaskDto>>('tasks', body, {
        timeout: SALESDESK_TASKS_WRITE_TIMEOUT_MS,
      }),
    update: (id: number, body: Partial<SalesDeskTaskDto>) =>
      updateOne<SalesDeskTaskDto, Partial<SalesDeskTaskDto>>('tasks', id, body, {
        timeout: SALESDESK_TASKS_WRITE_TIMEOUT_MS,
      }),
    delete: (id: number) => deleteOne('tasks', id),
  },
  visits: {
    list: (params?: PagedParams) => getPaged<SalesDeskVisitDto>('visits', params),
    create: (body: Partial<SalesDeskVisitDto>) => createOne<SalesDeskVisitDto, Partial<SalesDeskVisitDto>>('visits', body),
    update: (id: number, body: Partial<SalesDeskVisitDto>) => updateOne<SalesDeskVisitDto, Partial<SalesDeskVisitDto>>('visits', id, body),
    delete: (id: number) => deleteOne('visits', id),
  },
  visitForms: {
    list: (params?: PagedParams) => getPaged<SalesDeskVisitFormDto>('visit-forms', params),
    create: (body: Partial<SalesDeskVisitFormDto>) => createOne<SalesDeskVisitFormDto, Partial<SalesDeskVisitFormDto>>('visit-forms', body),
    update: (id: number, body: Partial<SalesDeskVisitFormDto>) => updateOne<SalesDeskVisitFormDto, Partial<SalesDeskVisitFormDto>>('visit-forms', id, body),
    delete: (id: number) => deleteOne('visit-forms', id),
  },
  assets: {
    list: (params?: PagedParams) => getPaged<SalesDeskFixedAssetDto>('assets', params),
    create: (body: Partial<SalesDeskFixedAssetDto>) => createOne<SalesDeskFixedAssetDto, Partial<SalesDeskFixedAssetDto>>('assets', body),
    update: (id: number, body: Partial<SalesDeskFixedAssetDto>) => updateOne<SalesDeskFixedAssetDto, Partial<SalesDeskFixedAssetDto>>('assets', id, body),
    delete: (id: number) => deleteOne('assets', id),
  },
  recurringPayments: {
    list: (params?: PagedParams) => getPaged<SalesDeskRecurringPaymentDto>('recurring-payments', params),
    create: (body: Partial<SalesDeskRecurringPaymentDto>) => createOne<SalesDeskRecurringPaymentDto, Partial<SalesDeskRecurringPaymentDto>>('recurring-payments', body),
    update: (id: number, body: Partial<SalesDeskRecurringPaymentDto>) => updateOne<SalesDeskRecurringPaymentDto, Partial<SalesDeskRecurringPaymentDto>>('recurring-payments', id, body),
    delete: (id: number) => deleteOne('recurring-payments', id),
  },
  softwareResearch: {
    list: (params?: PagedParams) => getPaged<SalesDeskSoftwareResearchDto>('software-research', params),
    create: (body: Partial<SalesDeskSoftwareResearchDto>) => createOne<SalesDeskSoftwareResearchDto, Partial<SalesDeskSoftwareResearchDto>>('software-research', body),
    update: (id: number, body: Partial<SalesDeskSoftwareResearchDto>) => updateOne<SalesDeskSoftwareResearchDto, Partial<SalesDeskSoftwareResearchDto>>('software-research', id, body),
    delete: (id: number) => deleteOne('software-research', id),
  },
  erpNews: {
    list: (params?: PagedParams) => getPaged<SalesDeskErpNewsItemDto>('erp-news', params),
    create: (body: Partial<SalesDeskErpNewsItemDto>) => createOne<SalesDeskErpNewsItemDto, Partial<SalesDeskErpNewsItemDto>>('erp-news', body),
    update: (id: number, body: Partial<SalesDeskErpNewsItemDto>) => updateOne<SalesDeskErpNewsItemDto, Partial<SalesDeskErpNewsItemDto>>('erp-news', id, body),
    delete: (id: number) => deleteOne('erp-news', id),
  },
  gmail: {
    list: (params?: PagedParams) => getPaged<SalesDeskGmailMessageDto>('gmail', params),
    create: (body: Partial<SalesDeskGmailMessageDto>) => createOne<SalesDeskGmailMessageDto, Partial<SalesDeskGmailMessageDto>>('gmail', body),
    update: (id: number, body: Partial<SalesDeskGmailMessageDto>) => updateOne<SalesDeskGmailMessageDto, Partial<SalesDeskGmailMessageDto>>('gmail', id, body),
    delete: (id: number) => deleteOne('gmail', id),
  },
};
