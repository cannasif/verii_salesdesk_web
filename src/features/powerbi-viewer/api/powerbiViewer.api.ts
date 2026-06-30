import { api } from '@/lib/axios';
import type { ApiResponse, PagedResponse } from '@/types/api';
import type { PowerBIReportListItemDto, EmbedConfigDto } from '../types/powerbiViewer.types';

function toListItems(raw: PagedResponse<PowerBIReportListItemDto> & { items?: PowerBIReportListItemDto[] }): PowerBIReportListItemDto[] {
  if (raw.items && Array.isArray(raw.items)) return raw.items;
  if (raw.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

export const powerbiViewerApi = {
  getList: async (): Promise<PowerBIReportListItemDto[]> => {
    const response = await api.get<ApiResponse<PagedResponse<PowerBIReportListItemDto>>>(
      '/api/PowerBIReportDefinition'
    );
    if (response.success && response.data) return toListItems(response.data as PagedResponse<PowerBIReportListItemDto> & { items?: PowerBIReportListItemDto[] });
    return [];
  },

  getEmbedConfig: async (id: number): Promise<EmbedConfigDto> => {
    const response = await api.get<ApiResponse<EmbedConfigDto>>(
      `/api/powerbi/reports/${id}/embed-config`
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'Embed config could not be loaded');
  },
};
