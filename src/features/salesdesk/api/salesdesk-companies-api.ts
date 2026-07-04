import { normalizePagedResponse } from '@/lib/paged-response';
import type { PagedParams, PagedResponse } from '@/types/api';
import { requestLocalServerJson } from '../lib/local-server-request';
import type { SalesDeskCompanyDto } from '../types/company-management-types';

const STORAGE_KEY = 'salesdesk-companies-v1';
const COMPANIES_PATH = '/companies';

interface CompanyStore {
  seq: number;
  companies: SalesDeskCompanyDto[];
}

function readLocalStore(): CompanyStore {
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

function writeLocalStore(store: CompanyStore): void {
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

  return normalizePagedResponse<SalesDeskCompanyDto>(
    {
      data: rows.slice(start, start + pageSize),
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

async function listFromServer(): Promise<SalesDeskCompanyDto[]> {
  return requestLocalServerJson<SalesDeskCompanyDto[]>(COMPANIES_PATH);
}

function listFromLocalStore(): SalesDeskCompanyDto[] {
  return readLocalStore().companies;
}

function createLocal(body: Omit<SalesDeskCompanyDto, 'id'>): SalesDeskCompanyDto {
  const payload = normalizePayload(body);
  if (!payload.name) throw new Error('Sirket adi zorunludur.');

  const store = readLocalStore();
  const now = new Date().toISOString();
  const company: SalesDeskCompanyDto = {
    id: store.seq,
    ...payload,
    createdAt: now,
    updatedAt: now,
  };
  store.seq += 1;
  store.companies = [company, ...store.companies];
  writeLocalStore(store);
  return company;
}

export const salesDeskCompaniesApi = {
  list: async (params?: PagedParams): Promise<PagedResponse<SalesDeskCompanyDto>> => {
    try {
      const all = await listFromServer();
      const filtered = filterCompanies(all, params);
      const sorted = sortCompanies(filtered, params);
      return paginateCompanies(sorted, params);
    } catch (error) {
      if (!import.meta.env.DEV) throw error;
      const all = listFromLocalStore();
      const filtered = filterCompanies(all, params);
      const sorted = sortCompanies(filtered, params);
      return paginateCompanies(sorted, params);
    }
  },

  get: async (id: number): Promise<SalesDeskCompanyDto> => {
    try {
      return await requestLocalServerJson<SalesDeskCompanyDto>(`${COMPANIES_PATH}/${id}`);
    } catch (error) {
      if (!import.meta.env.DEV) throw error;
      const company = listFromLocalStore().find((item) => item.id === id);
      if (!company) throw new Error('Sirket bulunamadi.');
      return company;
    }
  },

  create: async (body: Omit<SalesDeskCompanyDto, 'id'>): Promise<SalesDeskCompanyDto> => {
    const payload = normalizePayload(body);
    if (!payload.name) throw new Error('Sirket adi zorunludur.');

    try {
      return await requestLocalServerJson<SalesDeskCompanyDto>(COMPANIES_PATH, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (!import.meta.env.DEV) throw error;
      return createLocal(payload);
    }
  },

  update: async (id: number, body: Omit<SalesDeskCompanyDto, 'id'>): Promise<SalesDeskCompanyDto> => {
    const payload = normalizePayload(body);
    if (!payload.name) throw new Error('Sirket adi zorunludur.');

    try {
      return await requestLocalServerJson<SalesDeskCompanyDto>(`${COMPANIES_PATH}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    } catch (error) {
      if (!import.meta.env.DEV) throw error;
      const store = readLocalStore();
      const index = store.companies.findIndex((item) => item.id === id);
      if (index === -1) throw new Error('Sirket bulunamadi.');

      const updated: SalesDeskCompanyDto = {
        ...store.companies[index],
        ...payload,
        id,
        updatedAt: new Date().toISOString(),
      };
      store.companies[index] = updated;
      writeLocalStore(store);
      return updated;
    }
  },

  delete: async (id: number): Promise<void> => {
    try {
      await requestLocalServerJson<null>(`${COMPANIES_PATH}/${id}`, { method: 'DELETE' });
      return;
    } catch (error) {
      if (!import.meta.env.DEV) throw error;
      const store = readLocalStore();
      const before = store.companies.length;
      store.companies = store.companies.filter((item) => item.id !== id);
      if (store.companies.length === before) throw new Error('Sirket bulunamadi.');
      writeLocalStore(store);
    }
  },
};
