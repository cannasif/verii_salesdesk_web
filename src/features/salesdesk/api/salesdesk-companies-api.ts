import { normalizePagedResponse } from '@/lib/paged-response';
import type { PagedParams, PagedResponse } from '@/types/api';
import type { SalesDeskCompanyDto } from '../types/company-management-types';

const STORAGE_KEY = 'salesdesk-companies-v1';

interface CompanyStore {
  seq: number;
  companies: SalesDeskCompanyDto[];
}

function readStore(): CompanyStore {
  if (typeof window === 'undefined') {
    return { seq: 1, companies: [] };
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { seq: 1, companies: [] };
    const parsed = JSON.parse(raw) as Partial<CompanyStore>;
    return {
      seq: typeof parsed.seq === 'number' ? parsed.seq : 1,
      companies: Array.isArray(parsed.companies) ? parsed.companies : [],
    };
  } catch {
    return { seq: 1, companies: [] };
  }
}

function writeStore(store: CompanyStore): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
}

function normalizePayload(payload: Omit<SalesDeskCompanyDto, 'id'>): Omit<SalesDeskCompanyDto, 'id'> {
  const trim = (value: string | undefined) => (value ?? '').trim();
  return {
    name: trim(payload.name),
    ipAddress: trim(payload.ipAddress),
    ipUsername: trim(payload.ipUsername),
    ipPassword: trim(payload.ipPassword),
    vpnName: trim(payload.vpnName),
    vpnUsername: trim(payload.vpnUsername),
    vpnPassword: trim(payload.vpnPassword),
    vpnIpAddress: trim(payload.vpnIpAddress),
    vpnPort: trim(payload.vpnPort),
    databaseUsername: trim(payload.databaseUsername),
    databasePassword: trim(payload.databasePassword),
    loginUrl: trim(payload.loginUrl),
    description: trim(payload.description),
    description1: trim(payload.description1),
  };
}

function sortCompanies(rows: SalesDeskCompanyDto[], params?: PagedParams): SalesDeskCompanyDto[] {
  const sortBy = (params?.sortBy ?? 'Name').toLowerCase();
  const direction = params?.sortDirection === 'desc' ? -1 : 1;

  const fieldMap: Record<string, keyof SalesDeskCompanyDto> = {
    id: 'id',
    name: 'name',
    ipaddress: 'ipAddress',
    ipusername: 'ipUsername',
    ippassword: 'ipPassword',
    vpnname: 'vpnName',
    vpnusername: 'vpnUsername',
    vpnpassword: 'vpnPassword',
    vpnipaddress: 'vpnIpAddress',
    vpnport: 'vpnPort',
    databaseusername: 'databaseUsername',
    databasepassword: 'databasePassword',
    loginurl: 'loginUrl',
    description: 'description',
    description1: 'description1',
  };

  const field = fieldMap[sortBy.replace(/[^a-z0-9]/g, '')] ?? 'name';

  return [...rows].sort((a, b) => {
    const left = a[field];
    const right = b[field];
    if (typeof left === 'number' && typeof right === 'number') {
      return (left - right) * direction;
    }
    return String(left ?? '').localeCompare(String(right ?? ''), 'tr') * direction;
  });
}

function filterCompanies(rows: SalesDeskCompanyDto[], params?: PagedParams): SalesDeskCompanyDto[] {
  const search = params?.search?.trim().toLocaleLowerCase('tr-TR');
  if (!search) return rows;

  return rows.filter((row) =>
    [
      row.name,
      row.ipAddress,
      row.ipUsername,
      row.vpnName,
      row.vpnUsername,
      row.vpnIpAddress,
      row.vpnPort,
      row.databaseUsername,
      row.loginUrl,
      row.description,
      row.description1,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('tr-TR')
      .includes(search)
  );
}

function paginateCompanies(rows: SalesDeskCompanyDto[], params?: PagedParams): PagedResponse<SalesDeskCompanyDto> {
  const pageNumber = params?.pageNumber ?? 1;
  const pageSize = params?.pageSize ?? 10;
  const totalCount = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const start = (pageNumber - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return normalizePagedResponse<SalesDeskCompanyDto>(
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

function listAll(): SalesDeskCompanyDto[] {
  return readStore().companies;
}

export const salesDeskCompaniesApi = {
  list: async (params?: PagedParams): Promise<PagedResponse<SalesDeskCompanyDto>> => {
    const all = listAll();
    const filtered = filterCompanies(all, params);
    const sorted = sortCompanies(filtered, params);
    return paginateCompanies(sorted, params);
  },

  get: async (id: number): Promise<SalesDeskCompanyDto> => {
    const company = listAll().find((item) => item.id === id);
    if (!company) {
      throw new Error('Sirket bulunamadi.');
    }
    return company;
  },

  create: async (body: Omit<SalesDeskCompanyDto, 'id'>): Promise<SalesDeskCompanyDto> => {
    const payload = normalizePayload(body);
    if (!payload.name) {
      throw new Error('Sirket adi zorunludur.');
    }

    const store = readStore();
    const now = new Date().toISOString();
    const company: SalesDeskCompanyDto = {
      id: store.seq,
      ...payload,
      createdAt: now,
      updatedAt: now,
    };
    store.seq += 1;
    store.companies = [company, ...store.companies];
    writeStore(store);
    return company;
  },

  update: async (id: number, body: Omit<SalesDeskCompanyDto, 'id'>): Promise<SalesDeskCompanyDto> => {
    const payload = normalizePayload(body);
    if (!payload.name) {
      throw new Error('Sirket adi zorunludur.');
    }

    const store = readStore();
    const index = store.companies.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new Error('Sirket bulunamadi.');
    }

    const updated: SalesDeskCompanyDto = {
      ...store.companies[index],
      ...payload,
      id,
      updatedAt: new Date().toISOString(),
    };
    store.companies[index] = updated;
    writeStore(store);
    return updated;
  },

  delete: async (id: number): Promise<void> => {
    const store = readStore();
    const before = store.companies.length;
    store.companies = store.companies.filter((item) => item.id !== id);
    if (store.companies.length === before) {
      throw new Error('Sirket bulunamadi.');
    }
    writeStore(store);
  },
};
