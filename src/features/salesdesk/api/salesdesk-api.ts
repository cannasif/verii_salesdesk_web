import { api } from '@/lib/axios';
import { normalizePagedResponse } from '@/lib/paged-response';
import type { ApiResponse, PagedParams, PagedResponse } from '@/types/api';

export type SalesDeskCustomerKind = 1 | 2 | 3;
export type SalesDeskPotentialStatus = 1 | 2 | 3 | 4 | 5 | 6;
export type SalesDeskDocumentStatus = 1 | 2 | 3 | 4 | 5 | 6 | 7;
export type SalesDeskPriority = 1 | 2 | 3 | 4;
export type SalesDeskTaskStatus = 1 | 2 | 3 | 4;
export type SalesDeskVisitStatus = 1 | 2 | 3;
export type SalesDeskFixedAssetStatus = 1 | 2 | 3;
export type SalesDeskRecurringPaymentType = 1 | 2;

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

export interface SalesDeskQuoteDto {
  id: number;
  quoteNumber: string;
  customerId: number;
  customerName: string;
  quoteDate: string;
  status: SalesDeskDocumentStatus;
  subTotal: number;
  vatTotal: number;
  grandTotal: number;
  notes?: string | null;
  lines: SalesDeskLineDto[];
}

export interface SalesDeskInvoiceDto {
  id: number;
  invoiceNumber: string;
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

async function getPaged<T>(path: string, params?: PagedParams): Promise<PagedResponse<T>> {
  const response = await api.get<ApiResponse<PagedResponse<T>>>(`${BASE}/${path}${buildQuery(params)}`);
  return normalizePagedResponse<T>(response.data, {
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
  });
}

async function postPaged<T>(path: string, params?: PagedParams): Promise<PagedResponse<T>> {
  const response = await api.post<ApiResponse<PagedResponse<T>>>(`${BASE}/${path}/query`, params ?? {});
  return normalizePagedResponse<T>(response.data, {
    pageNumber: params?.pageNumber,
    pageSize: params?.pageSize,
  });
}

async function getOne<T>(path: string, id: number): Promise<T> {
  const response = await api.get<ApiResponse<T>>(`${BASE}/${path}/${id}`);
  return response.data;
}

async function createOne<T, TBody>(path: string, body: TBody): Promise<T> {
  const response = await api.post<ApiResponse<T>>(`${BASE}/${path}`, body);
  return response.data;
}

async function updateOne<T, TBody>(path: string, id: number, body: TBody): Promise<T> {
  const response = await api.put<ApiResponse<T>>(`${BASE}/${path}/${id}`, body);
  return response.data;
}

async function deleteOne(path: string, id: number): Promise<void> {
  await api.delete<ApiResponse<unknown>>(`${BASE}/${path}/${id}`);
}

export const salesDeskApi = {
  async dashboard(): Promise<SalesDeskDashboardDto> {
    const response = await api.get<ApiResponse<SalesDeskDashboardDto>>(`${BASE}/dashboard`);
    return response.data;
  },
  async search(q: string, take = 12): Promise<SalesDeskSearchResultDto[]> {
    const response = await api.get<ApiResponse<SalesDeskSearchResultDto[]>>(`${BASE}/search`, { params: { q, take } });
    return response.data;
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
    create: (body: Partial<SalesDeskQuoteDto>) => createOne<SalesDeskQuoteDto, Partial<SalesDeskQuoteDto>>('quotes', body),
    update: (id: number, body: Partial<SalesDeskQuoteDto>) => updateOne<SalesDeskQuoteDto, Partial<SalesDeskQuoteDto>>('quotes', id, body),
    delete: (id: number) => deleteOne('quotes', id),
  },
  invoices: {
    list: (params?: PagedParams) => getPaged<SalesDeskInvoiceDto>('invoices', params),
    get: (id: number) => getOne<SalesDeskInvoiceDto>('invoices', id),
    create: (body: Partial<SalesDeskInvoiceDto>) => createOne<SalesDeskInvoiceDto, Partial<SalesDeskInvoiceDto>>('invoices', body),
    update: (id: number, body: Partial<SalesDeskInvoiceDto>) => updateOne<SalesDeskInvoiceDto, Partial<SalesDeskInvoiceDto>>('invoices', id, body),
    delete: (id: number) => deleteOne('invoices', id),
  },
  tasks: {
    list: (params?: PagedParams) => getPaged<SalesDeskTaskDto>('tasks', params),
    openItems: (params?: PagedParams) => getPaged<SalesDeskTaskDto>('tasks/open-items', params),
    create: (body: Partial<SalesDeskTaskDto>) => createOne<SalesDeskTaskDto, Partial<SalesDeskTaskDto>>('tasks', body),
    update: (id: number, body: Partial<SalesDeskTaskDto>) => updateOne<SalesDeskTaskDto, Partial<SalesDeskTaskDto>>('tasks', id, body),
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
