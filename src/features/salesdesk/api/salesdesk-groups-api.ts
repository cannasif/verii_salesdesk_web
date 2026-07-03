import { getLocalServerUrl } from '../lib/local-server-url';
import type { SalesDeskGroupDto, SalesDeskGroupFormSchema } from '../types/salesdesk-group-types';

interface ApiEnvelope<T> {
  success?: boolean;
  data?: T;
  error?: string;
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${getLocalServerUrl()}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers ?? {}),
      },
    });
  } catch {
    throw new Error(
      'Yerel sunucuya ulasilamadi. Uygulamayi "npm run dev" ile baslatin; yerel sunucu otomatik acilir.'
    );
  }

  const payload = (await response.json().catch(() => ({}))) as ApiEnvelope<T>;
  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || `Sunucu hatasi (${response.status}).`);
  }

  return payload.data as T;
}

export const salesDeskGroupsApi = {
  list: async (): Promise<SalesDeskGroupDto[]> => requestJson<SalesDeskGroupDto[]>('/salesdesk/groups'),

  getById: async (id: number): Promise<SalesDeskGroupDto> =>
    requestJson<SalesDeskGroupDto>(`/salesdesk/groups/${id}`),

  create: async (dto: SalesDeskGroupFormSchema): Promise<SalesDeskGroupDto> =>
    requestJson<SalesDeskGroupDto>('/salesdesk/groups', {
      method: 'POST',
      body: JSON.stringify(dto),
    }),

  update: async (
    id: number,
    dto: Pick<SalesDeskGroupFormSchema, 'name' | 'description'>
  ): Promise<SalesDeskGroupDto> =>
    requestJson<SalesDeskGroupDto>(`/salesdesk/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto),
    }),

  setMembers: async (id: number, memberUserIds: number[]): Promise<SalesDeskGroupDto> =>
    requestJson<SalesDeskGroupDto>(`/salesdesk/groups/${id}/members`, {
      method: 'PUT',
      body: JSON.stringify({ memberUserIds }),
    }),

  delete: async (id: number): Promise<void> => {
    await requestJson<unknown>(`/salesdesk/groups/${id}`, { method: 'DELETE' });
  },
};
