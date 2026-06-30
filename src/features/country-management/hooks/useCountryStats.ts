import { useQuery } from '@tanstack/react-query';
import { countryApi } from '../api/country-api';
import { queryKeys } from '../utils/query-keys';
import type { CountryDto } from '../types/country-types';

export interface CountryStats {
  totalCountries: number;
  activeCountries: number;
  newThisMonth: number;
}

export const useCountryStats = (): ReturnType<typeof useQuery<CountryStats>> => {
  return useQuery({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<CountryStats> => {
      const allCountriesResponse = await countryApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allCountries = allCountriesResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalCountries = allCountriesResponse.totalCount || 0;
      const activeCountries = allCountries.filter((country: CountryDto) => !country.isDeleted).length;
      const newThisMonth = allCountries.filter(
        (country: CountryDto) => country.createdDate && new Date(country.createdDate) >= startOfMonth
      ).length;

      return {
        totalCountries,
        activeCountries,
        newThisMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
