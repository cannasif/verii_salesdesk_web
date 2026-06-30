import { useQuery } from '@tanstack/react-query';
import { districtApi } from '../api/district-api';
import type { DistrictDto } from '../types/district-types';

export const useDistrictOptions = (cityId?: number) => {
  return useQuery({
    queryKey: ['districtOptions', cityId],
    queryFn: async (): Promise<DistrictDto[]> => {
      const response = await districtApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Name',
        sortDirection: 'asc',
        filters: cityId ? [{ column: 'CityId', operator: 'eq', value: cityId.toString() }] : undefined,
      });
      return response.data || [];
    },
    enabled: !cityId || cityId > 0,
    staleTime: 5 * 60 * 1000,
  });
};
