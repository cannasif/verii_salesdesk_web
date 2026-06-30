import { useQuery } from '@tanstack/react-query';
import { cityApi } from '../api/city-api';
import type { CityDto } from '../types/city-types';

export const useCityOptions = (): ReturnType<typeof useQuery<CityDto[]>> => {
  return useQuery({
    queryKey: ['cityOptions'],
    queryFn: async (): Promise<CityDto[]> => {
      const response = await cityApi.getList({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'Name',
        sortDirection: 'asc',
      });
      return response.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });
};
