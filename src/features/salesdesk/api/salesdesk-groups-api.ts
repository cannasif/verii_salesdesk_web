import { isAxiosError } from 'axios';
import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import { getLocalServerUrl } from '../lib/local-server-url';
import type { SalesDeskGroupDto, SalesDeskGroupFormSchema } from '../types/salesdesk-group-types';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

const GROUPS_BASE = '/groups';
const BACKEND_GROUPS_BASE = '/api/salesdesk/groups';

type GroupsSource = 'backend' | 'local';

let resolvedSource: GroupsSource | null = null;

function unwrapBackendGroups(response: ApiResponse<SalesDeskGroupDto[]>): SalesDeskGroupDto[] {
  if (response.success && Array.isArray(response.data)) {
    return response.data;
  }
  throw new Error(response.message || 'Gruplar yuklenemedi.');
}

function unwrapBackendGroup(response: ApiResponse<SalesDeskGroupDto>, fallbackMessage: string): SalesDeskGroupDto {
  if (response.success && response.data) {
    return response.data;
  }
  throw new Error(response.message || fallbackMessage);
}

function isBackendGroupsUnavailable(error: unknown): boolean {
  if (!isAxiosError(error)) return false;
  if ([404, 405, 501].includes(error.response?.status ?? 0)) return true;
  return error.code === 'ECONNABORTED' || !error.response;
}

async function detectGroupsSource(): Promise<GroupsSource> {
  if (resolvedSource) return resolvedSource;

  try {
    const response = await api.get<ApiResponse<SalesDeskGroupDto[]>>(BACKEND_GROUPS_BASE, {
      timeout: 10_000,
    });
    unwrapBackendGroups(response);
    resolvedSource = 'backend';
    return 'backend';
  } catch (error) {
    if (isBackendGroupsUnavailable(error)) {
      resolvedSource = 'local';
      return 'local';
    }
    throw error;
  }
}

async function requestLocalJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getLocalServerUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
      signal: init?.signal ?? AbortSignal.timeout(15_000),
    });
  } catch {
    throw new Error(
      'Yerel sunucuya ulasilamadi. Uygulamayi "npm run dev" ile baslatin veya production icin yardimci sunucuyu deploy edin.'
    );
  }

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || `Sunucu hatasi (${response.status}).`);
  }

  if (payload.data === undefined) {
    throw new Error('Yerel sunucudan gecersiz yanit alindi.');
  }

  return payload.data;
}

async function listFromBackend(): Promise<SalesDeskGroupDto[]> {
  const response = await api.get<ApiResponse<SalesDeskGroupDto[]>>(BACKEND_GROUPS_BASE, {
    timeout: 15_000,
  });
  return unwrapBackendGroups(response);
}

async function withSource<T>(fn: (source: GroupsSource) => Promise<T>): Promise<T> {
  const source = await detectGroupsSource();
  return fn(source);
}

export const salesDeskGroupsApi = {
  getSource: detectGroupsSource,

  list: async (): Promise<SalesDeskGroupDto[]> =>
    withSource(async (source) =>
      source === 'backend' ? listFromBackend() : requestLocalJson<SalesDeskGroupDto[]>(GROUPS_BASE)
    ),

  getById: async (id: number): Promise<SalesDeskGroupDto> =>
    withSource(async (source) => {
      if (source === 'backend') {
        const response = await api.get<ApiResponse<SalesDeskGroupDto>>(`${BACKEND_GROUPS_BASE}/${id}`);
        return unwrapBackendGroup(response, 'Grup bulunamadi.');
      }
      return requestLocalJson<SalesDeskGroupDto>(`${GROUPS_BASE}/${id}`);
    }),

  create: async (dto: SalesDeskGroupFormSchema): Promise<SalesDeskGroupDto> =>
    withSource(async (source) => {
      if (source === 'backend') {
        const response = await api.post<ApiResponse<SalesDeskGroupDto>>(BACKEND_GROUPS_BASE, dto);
        return unwrapBackendGroup(response, 'Grup olusturulamadi.');
      }
      return requestLocalJson<SalesDeskGroupDto>(GROUPS_BASE, {
        method: 'POST',
        body: JSON.stringify(dto),
      });
    }),

  update: async (
    id: number,
    dto: Pick<SalesDeskGroupFormSchema, 'name' | 'description'>
  ): Promise<SalesDeskGroupDto> =>
    withSource(async (source) => {
      if (source === 'backend') {
        const response = await api.put<ApiResponse<SalesDeskGroupDto>>(`${BACKEND_GROUPS_BASE}/${id}`, dto);
        return unwrapBackendGroup(response, 'Grup guncellenemedi.');
      }
      return requestLocalJson<SalesDeskGroupDto>(`${GROUPS_BASE}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(dto),
      });
    }),

  setMembers: async (id: number, memberUserIds: number[]): Promise<SalesDeskGroupDto> =>
    withSource(async (source) => {
      if (source === 'backend') {
        const response = await api.put<ApiResponse<SalesDeskGroupDto>>(
          `${BACKEND_GROUPS_BASE}/${id}/members`,
          { memberUserIds }
        );
        return unwrapBackendGroup(response, 'Grup uyeleri guncellenemedi.');
      }
      return requestLocalJson<SalesDeskGroupDto>(`${GROUPS_BASE}/${id}/members`, {
        method: 'PUT',
        body: JSON.stringify({ memberUserIds }),
      });
    }),

  delete: async (id: number): Promise<void> => {
    await withSource(async (source) => {
      if (source === 'backend') {
        const response = await api.delete<ApiResponse<unknown>>(`${BACKEND_GROUPS_BASE}/${id}`);
        if (!response.success) {
          throw new Error(response.message || 'Grup silinemedi.');
        }
        return;
      }
      await requestLocalJson<unknown>(`${GROUPS_BASE}/${id}`, { method: 'DELETE' });
    });
  },
};
