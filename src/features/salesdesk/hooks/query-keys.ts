import type { PagedParams } from '@/types/api';

export const salesDeskCustomerQueryKeys = {
  all: () => ['salesdesk', 'customers'] as const,
  list: (params: PagedParams) => [...salesDeskCustomerQueryKeys.all(), 'list', params] as const,
  stats: () => [...salesDeskCustomerQueryKeys.all(), 'stats'] as const,
  detail: (id: number) => [...salesDeskCustomerQueryKeys.all(), 'detail', id] as const,
};

export const salesDeskPotentialQueryKeys = {
  all: () => ['salesdesk', 'potentials'] as const,
  list: (params: PagedParams) => [...salesDeskPotentialQueryKeys.all(), 'list', params] as const,
  stats: () => [...salesDeskPotentialQueryKeys.all(), 'stats'] as const,
  detail: (id: number) => [...salesDeskPotentialQueryKeys.all(), 'detail', id] as const,
};
