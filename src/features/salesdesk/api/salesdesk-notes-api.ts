import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  SalesDeskNoteDto,
  SalesDeskNoteNotificationPayload,
  UpsertSalesDeskNoteInput,
} from '../types/notes-types';

const BASE = '/api/salesdesk/notes';
const READ_TIMEOUT_MS = 8_000;

function unwrapApiData<T>(response: ApiResponse<T>, fallbackMessage: string): T {
  if (response.success && response.data != null) {
    return response.data;
  }
  throw new Error(response.message || fallbackMessage);
}

function normalizeIds(ids: number[] | undefined): number[] {
  if (!Array.isArray(ids)) return [];
  const unique = new Set<number>();
  for (const id of ids) {
    const numeric = Number(id);
    if (Number.isFinite(numeric) && numeric > 0) unique.add(Math.trunc(numeric));
  }
  return [...unique];
}

export const salesDeskNotesApi = {
  listForUser: async (userId: number): Promise<SalesDeskNoteDto[]> => {
    const response = await api.get<ApiResponse<SalesDeskNoteDto[]>>(
      `${BASE}?userId=${encodeURIComponent(String(userId))}`,
      { timeout: READ_TIMEOUT_MS }
    );
    return unwrapApiData(response, 'Notlar yuklenemedi.');
  },

  get: async (id: number): Promise<SalesDeskNoteDto> => {
    const response = await api.get<ApiResponse<SalesDeskNoteDto>>(`${BASE}/${id}`, {
      timeout: READ_TIMEOUT_MS,
    });
    return unwrapApiData(response, 'Not bulunamadi.');
  },

  create: async (input: UpsertSalesDeskNoteInput): Promise<SalesDeskNoteDto> => {
    const response = await api.post<ApiResponse<SalesDeskNoteDto>>(BASE, input);
    return unwrapApiData(response, 'Not olusturulamadi.');
  },

  update: async (
    id: number,
    input: Omit<UpsertSalesDeskNoteInput, 'createdByUserId' | 'createdByName'>
  ): Promise<SalesDeskNoteDto> => {
    const response = await api.put<ApiResponse<SalesDeskNoteDto>>(`${BASE}/${id}`, {
      title: String(input.title ?? '').trim(),
      content: String(input.content ?? '').trim(),
      recipientUserIds: normalizeIds(input.recipientUserIds),
      notifyRecipients: input.notifyRecipients !== false,
    });
    return unwrapApiData(response, 'Not guncellenemedi.');
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<unknown>>(`${BASE}/${id}`);
    if (!response.success) {
      throw new Error(response.message || 'Not silinemedi.');
    }
  },

  pullPendingNotifications: async (userId: number): Promise<SalesDeskNoteNotificationPayload[]> => {
    const numericUserId = Number(userId);
    if (!Number.isFinite(numericUserId) || numericUserId <= 0) return [];

    const response = await api.get<ApiResponse<SalesDeskNoteNotificationPayload[]>>(
      `${BASE}/notifications/pending?userId=${encodeURIComponent(String(numericUserId))}`,
      { timeout: READ_TIMEOUT_MS }
    );
    return unwrapApiData(response, 'Bildirimler yuklenemedi.');
  },

  ackNotification: async (notificationId: number): Promise<void> => {
    const response = await api.post<ApiResponse<unknown>>(
      `${BASE}/notifications/${notificationId}/ack`,
      {}
    );
    if (!response.success) {
      throw new Error(response.message || 'Bildirim onaylanamadi.');
    }
  },
};
