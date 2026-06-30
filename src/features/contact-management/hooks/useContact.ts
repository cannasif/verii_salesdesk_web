import { useQuery } from '@tanstack/react-query';
import { contactApi } from '../api/contact-api';
import { queryKeys } from '../utils/query-keys';
import type { ContactDto } from '../types/contact-types';

export const useContact = (id: number) => {
  return useQuery<ContactDto>({
    queryKey: queryKeys.detail(id),
    queryFn: () => contactApi.getById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};
