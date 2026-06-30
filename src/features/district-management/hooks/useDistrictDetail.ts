import { useQuery } from '@tanstack/react-query';
import { districtApi } from '../api/district-api';
import { queryKeys } from '../utils/query-keys';
import type { DistrictDto } from '../types/district-types';

export const useDistrictDetail = (
  id: number | null
): ReturnType<typeof useQuery<DistrictDto>> => {
  return useQuery({
    queryKey: queryKeys.detail(id ?? 0),
    queryFn: () => districtApi.getById(id!),
    enabled: id !== null && id > 0,
    staleTime: 5 * 60 * 1000,
  });
};
