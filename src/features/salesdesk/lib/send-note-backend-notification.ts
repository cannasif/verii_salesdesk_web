import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { CreateNotificationRequest } from '@/features/notification/types/notification';

export async function sendBackendNoteNotification(
  request: CreateNotificationRequest
): Promise<boolean> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/api/Notification', request);
    return response.success === true;
  } catch {
    return false;
  }
}
