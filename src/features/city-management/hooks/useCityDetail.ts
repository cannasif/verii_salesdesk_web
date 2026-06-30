import { useQuery } from '@tanstack/react-query';
import { cityApi } from '../api/city-api';
import { queryKeys } from '../utils/query-keys';
import type { CityDto } from '../types/city-types';

export const useCityDetail = (
  id: number | null
): ReturnType<typeof useQuery<CityDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id ?? 0),
    queryFn: () => cityApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};
