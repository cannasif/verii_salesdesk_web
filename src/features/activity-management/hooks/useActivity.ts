import { useQuery } from '@tanstack/react-query';
import { activityApi } from '../api/activity-api';
import { queryKeys } from '../utils/query-keys';
import type { ActivityDto } from '../types/activity-types';

export const useActivity = (id: number): ReturnType<typeof useQuery<ActivityDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id),
    queryFn: () => activityApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
