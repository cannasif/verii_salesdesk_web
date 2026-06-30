import { useQuery } from '@tanstack/react-query';
import { contactApi } from '../api/contact-api';
import { queryKeys } from '../utils/query-keys';
import type { ContactDto } from '../types/contact-types';

export interface ContactStats {
  totalContacts: number;
  activeContacts: number;
  newThisMonth: number;
}

export const useContactStats = () => {
  return useQuery<ContactStats>({
    queryKey: queryKeys.stats(),
    queryFn: async (): Promise<ContactStats> => {
      const allContactsResponse = await contactApi.getList({
        pageNumber: 1,
        pageSize: 1000,
      });

      const allContacts = allContactsResponse.data || [];
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const totalContacts = allContactsResponse.totalCount || 0;
      const activeContacts = allContacts.filter((contact: ContactDto) => !contact.isDeleted).length;
      const newThisMonth = allContacts.filter(
        (contact: ContactDto) => contact.createdDate && new Date(contact.createdDate) >= startOfMonth
      ).length;

      return {
        totalContacts,
        activeContacts,
        newThisMonth,
      };
    },
    staleTime: 5 * 60 * 1000,
  });
};
