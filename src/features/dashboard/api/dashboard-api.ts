import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/api';
import type { DashboardData, CurrencyRate } from '../types/dashboard';

export const dashboardApi = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<ApiResponse<DashboardData>>('/api/Dashboard');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Dashboard verileri yüklenemedi');
  },

  getCurrencyRates: async (): Promise<CurrencyRate[]> => {
    const response = await api.get<ApiResponse<CurrencyRate[]>>('/api/Dashboard/currencyRates');
    if (response.success && response.data) {
      return response.data;
    }
    throw new Error(response.message || 'Döviz kurları yüklenemedi');
  },
};
