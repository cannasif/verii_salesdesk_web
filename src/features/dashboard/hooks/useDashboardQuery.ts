import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../api/dashboard-api';
import { queryKeys } from '../utils/query-keys';
import type { DashboardData } from '../types/dashboard';

export const useDashboardQuery = (): ReturnType<typeof useQuery<DashboardData>> => {
  return useQuery({
    queryKey: queryKeys.dashboard(),
    queryFn: dashboardApi.getDashboardData,
    staleTime: 60000,
  });
};
