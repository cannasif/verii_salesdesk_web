import { useQuery } from '@tanstack/react-query';
import { cityApi } from '../api/city-api';
import { queryKeys } from '../utils/query-keys';
import type { CityDto } from '../types/city-types';

export interface CityStats {
  totalCities: number;
  activeCities: number;
  newThisMonth: number;
}

export const useCityStats = (): ReturnType<typeof useQuery<CityStats>> => {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<CityStats> => {
      const allCitiesResponse = await cityApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allCities = allCitiesResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCities = allCitiesResponse.totalCount || 0;
      const activeCities = allCities.filter((city: CityDto) => !city.isDeleted).length;
      const newThisMonth = allCities.filter(
        (city: CityDto) => city.createdDate && new Date(city.createdDate) >= startOfMonth
      ).length;

      return {
        totalCities,
        activeCities,
        newThisMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
