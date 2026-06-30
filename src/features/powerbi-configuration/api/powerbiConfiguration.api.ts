import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type {
  PowerBIConfigurationGetDto,
  CreatePowerBIConfigurationDto,
  UpdatePowerBIConfigurationDto,
} from '../types/powerbiConfiguration.types';

export const powerbiConfigurationApi = {
  get: async (): Promise<PowerBIConfigurationGetDto | null> => {
    try {
      const response = await api.get<ApiResponse<PowerBIConfigurationGetDto | null>>(
        '/api/powerbi/configuration'
      );
      if (response.success && response.data) return response.data;
      return null;
    } catch (err) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 404) return null;
      throw err;
    }
  },

  create: async (
    data: CreatePowerBIConfigurationDto
  ): Promise<PowerBIConfigurationGetDto> => {
    const response = await api.post<ApiResponse<PowerBIConfigurationGetDto>>(
      '/api/powerbi/configuration',
      data
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'PowerBI configuration could not be created');
  },

  update: async (
    id: number,
    data: UpdatePowerBIConfigurationDto
  ): Promise<PowerBIConfigurationGetDto> => {
    const response = await api.put<ApiResponse<PowerBIConfigurationGetDto>>(
      `/api/powerbi/configuration/${id}`,
      data
    );
    if (response.success && response.data) return response.data;
    throw new Error(response.message ?? 'PowerBI configuration could not be updated');
  },

  delete: async (id: number): Promise<void> => {
    const response = await api.delete<ApiResponse<object>>(
      `/api/powerbi/configuration/${id}`
    );
    if (!response.success) {
      throw new Error(response.message ?? 'PowerBI configuration could not be deleted');
    }
  },
};
