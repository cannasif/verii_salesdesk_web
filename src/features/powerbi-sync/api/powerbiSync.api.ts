import { api } from '@/lib/axios';
import type { PowerBIReportSyncResponse } from '../types/powerbiSync.types';

export const powerbiSyncApi = {
  sync: async (workspaceId?: string | null): Promise<PowerBIReportSyncResponse['data']> => {
    const params = new URLSearchParams();
    if (workspaceId?.trim()) params.append('workspaceId', workspaceId.trim());
    const url = params.toString() ? `/api/powerbi/reports/sync?${params.toString()}` : '/api/powerbi/reports/sync';
    const response = await api.post<PowerBIReportSyncResponse>(url);
    if (!response.success) {
      throw new Error(response.message ?? 'Sync failed');
    }
    return response.data;
  },
};
