import { api } from '@/lib/axios';
import { normalizePagedResponse } from '@/lib/paged-response';
import type { ApiResponse, PagedParams, PagedResponse } from '@/types/api';
import type { SalesDeskCompanyDto } from '../types/company-management-types';

const BASE = '/api/salesdesk/companies';
const READ_TIMEOUT_MS = 8_000;

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

export const salesDeskCompaniesApi = {
  list: async (params?: PagedParams): Promise<PagedResponse<SalesDeskCompanyDto>> => {
    const response = await api.get<ApiResponse<PagedResponse<SalesDeskCompanyDto>>>(
      `${BASE}${buildQuery(params)}`,
      { timeout: READ_TIMEOUT_MS }
    );
    const paged = unwrapApiData(response, 'Sirketler yuklenemedi');
    return normalizePagedResponse(paged, {
      pageNumber: params?.pageNumber,
      pageSize: params?.pageSize,
    });
  },

  get: async (id: number): Promise<SalesDeskCompanyDto> => {
    const response = await api.get<ApiResponse<SalesDeskCompanyDto>>(`${BASE}/${id}`, {
      timeout: READ_TIMEOUT_MS,
    });
    return unwrapApiData(response, 'Sirket bulunamadi.');
  },

  create: async (body: Omit<SalesDeskCompanyDto, 'id'>): Promise<SalesDeskCompanyDto> => {
    const payload = normalizePayload(body);
    if (!payload.name) throw new Error('Sirket adi zorunludur.');

    const response = await api.post<ApiResponse<SalesDeskCompanyDto>>(BASE, payload);
    return unwrapApiData(response, 'Sirket olusturulamadi.');
  },

  update: async (id: number, body: Omit<SalesDeskCompanyDto, 'id'>): Promise<SalesDeskCompanyDto> => {
    const payload = normalizePayload(body);
    if (!payload.name) throw new Error('Sirket adi zorunludur.');

    const response = await api.put<ApiResponse<SalesDeskCompanyDto>>(`${BASE}/${id}`, payload);
    return unwrapApiData(response, 'Sirket guncellenemedi.');
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<unknown>>(`${BASE}/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Sirket silinemedi.');
    }
  },
};
