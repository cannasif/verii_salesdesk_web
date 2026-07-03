import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { toast } from 'sonner';
import type { PagedParams, PagedResponse } from '@/types/api';
import {
  salesDeskApi,
  type SalesDeskCustomerDto,
  type SalesDeskDashboardDto,
  type SalesDeskProductCustomerDto,
  type SalesDeskProductDto,
  type SalesDeskActivitiesListResult,
  type SalesDeskTaskDto,
} from '../api/salesdesk-api';
import { isSalesDeskActivityTask } from '../lib/salesdesk-activities';
import { createSalesDeskCrudHooks } from './createSalesDeskCrudHooks';
import { userApi } from '@/features/user-management/api/user-api';
import type {
  AssetFormValues,
  ErpNewsFormValues,
  GmailFormValues,
  InvoiceFormValues,
  ProductFormValues,
  QuoteFormValues,
  RecurringPaymentFormValues,
  SalesDeskActivityFormValues,
  SoftwareResearchFormValues,
  TaskFormValues,
  VisitFormRecordValues,
  VisitFormValues,
} from '../types/salesdesk-schemas';
import {
  toAssetPayload,
  toErpNewsPayload,
  toGmailPayload,
  toInvoicePayload,
  toProductPayload,
  toQuotePayload,
  toRecurringPaymentPayload,
  toSoftwareResearchPayload,
  toTaskPayload,
  toOpenItemTaskPayload,
  toSalesDeskActivityPayload,
  toVisitFormRecordPayload,
  toVisitPayload,
} from '../types/salesdesk-schemas';

const ACTIVITIES_LIST_KEY = ['salesdesk', 'tasks', 'activities'] as const;

function mergeActivityTask(
  saved: SalesDeskTaskDto,
  payload: Partial<SalesDeskTaskDto>
): SalesDeskTaskDto {
  return {
    ...saved,
    ...payload,
    id: saved.id,
    groupName: payload.groupName ?? saved.groupName,
    title: payload.title ?? saved.title,
    customerId: payload.customerId ?? saved.customerId,
    assignedUserId: payload.assignedUserId ?? saved.assignedUserId,
    priority: payload.priority ?? saved.priority,
    status: payload.status ?? saved.status,
    dueDate: payload.dueDate ?? saved.dueDate,
    description: payload.description ?? saved.description,
  };
}

function clearActivitiesQueryErrors(queryClient: QueryClient): void {
  queryClient.getQueryCache().findAll({ queryKey: ACTIVITIES_LIST_KEY }).forEach((query) => {
    if (!query.state.error) return;
    query.setState({
      error: null,
      status: 'success',
      fetchStatus: 'idle',
    });
  });
}

function upsertActivityTaskInCache(queryClient: QueryClient, task: SalesDeskTaskDto): void {
  if (!isSalesDeskActivityTask(task)) return;

  const todayKey = new Date().toISOString().slice(0, 10);
  const isToday = task.dueDate?.slice(0, 10) === todayKey;
  const isPlanned = task.status === 1 || task.status === 2;
  const isCompleted = task.status === 3;

  queryClient.setQueriesData<SalesDeskActivitiesListResult>({ queryKey: ACTIVITIES_LIST_KEY }, (old) => {
    if (!old) {
      return {
        data: [task],
        totalCount: 1,
        pageNumber: 1,
        pageSize: 10,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
        activityStats: {
          today: isToday ? 1 : 0,
          planned: isPlanned ? 1 : 0,
          completed: isCompleted ? 1 : 0,
        },
      };
    }

    const exists = old.data.some((item) => item.id === task.id);
    const previous = exists ? old.data.find((item) => item.id === task.id) : undefined;
    const nextData = exists
      ? old.data.map((item) => (item.id === task.id ? { ...item, ...task } : item))
      : [task, ...old.data];
    const totalCount = exists ? old.totalCount : old.totalCount + 1;

    const stats = { ...old.activityStats };
    if (previous) {
      if (previous.dueDate?.slice(0, 10) === todayKey) stats.today = Math.max(0, stats.today - 1);
      if (previous.status === 1 || previous.status === 2) stats.planned = Math.max(0, stats.planned - 1);
      if (previous.status === 3) stats.completed = Math.max(0, stats.completed - 1);
    }
    if (isToday) stats.today += 1;
    if (isPlanned) stats.planned += 1;
    if (isCompleted) stats.completed += 1;

    return {
      ...old,
      data: nextData.slice(0, old.pageSize),
      totalCount,
      totalPages: Math.max(1, Math.ceil(totalCount / old.pageSize)),
      activityStats: stats,
    };
  });
  clearActivitiesQueryErrors(queryClient);
}

function removeActivityTaskFromCache(queryClient: QueryClient, id: number): void {
  queryClient.setQueriesData<SalesDeskActivitiesListResult>({ queryKey: ACTIVITIES_LIST_KEY }, (old) => {
    if (!old) return old;

    const removed = old.data.find((item) => item.id === id);
    const data = old.data.filter((item) => item.id !== id);
    const removedCount = old.data.length - data.length;
    const todayKey = new Date().toISOString().slice(0, 10);
    const stats = { ...old.activityStats };

    if (removed) {
      if (removed.dueDate?.slice(0, 10) === todayKey) stats.today = Math.max(0, stats.today - 1);
      if (removed.status === 1 || removed.status === 2) stats.planned = Math.max(0, stats.planned - 1);
      if (removed.status === 3) stats.completed = Math.max(0, stats.completed - 1);
    }

    return {
      ...old,
      data,
      totalCount: Math.max(0, old.totalCount - removedCount),
      totalPages: Math.max(1, Math.ceil(Math.max(0, old.totalCount - removedCount) / old.pageSize)),
      activityStats: stats,
    };
  });
  clearActivitiesQueryErrors(queryClient);
}

const products = createSalesDeskCrudHooks('products', salesDeskApi.products, {
  createSuccess: 'Urun olusturuldu',
  updateSuccess: 'Urun guncellendi',
  deleteSuccess: 'Urun silindi',
  createError: 'Urun olusturulamadi',
  updateError: 'Urun guncellenemedi',
  deleteError: 'Urun silinemedi',
});

const quotes = createSalesDeskCrudHooks('quotes', salesDeskApi.quotes, {
  createSuccess: 'Teklif olusturuldu',
  updateSuccess: 'Teklif guncellendi',
  deleteSuccess: 'Teklif silindi',
  createError: 'Teklif olusturulamadi',
  updateError: 'Teklif guncellenemedi',
  deleteError: 'Teklif silinemedi',
});

const invoices = createSalesDeskCrudHooks('invoices', salesDeskApi.invoices, {
  createSuccess: 'Fatura olusturuldu',
  updateSuccess: 'Fatura guncellendi',
  deleteSuccess: 'Fatura silindi',
  createError: 'Fatura olusturulamadi',
  updateError: 'Fatura guncellenemedi',
  deleteError: 'Fatura silinemedi',
});

const tasks = createSalesDeskCrudHooks('tasks', salesDeskApi.tasks, {
  createSuccess: 'Gorev olusturuldu',
  updateSuccess: 'Gorev guncellendi',
  deleteSuccess: 'Gorev silindi',
  createError: 'Gorev olusturulamadi',
  updateError: 'Gorev guncellenemedi',
  deleteError: 'Gorev silinemedi',
});

const visits = createSalesDeskCrudHooks('visits', salesDeskApi.visits, {
  createSuccess: 'Ziyaret olusturuldu',
  updateSuccess: 'Ziyaret guncellendi',
  deleteSuccess: 'Ziyaret silindi',
  createError: 'Ziyaret olusturulamadi',
  updateError: 'Ziyaret guncellenemedi',
  deleteError: 'Ziyaret silinemedi',
});

const visitForms = createSalesDeskCrudHooks('visit-forms', salesDeskApi.visitForms, {
  createSuccess: 'Ziyaret formu olusturuldu',
  updateSuccess: 'Ziyaret formu guncellendi',
  deleteSuccess: 'Ziyaret formu silindi',
  createError: 'Ziyaret formu olusturulamadi',
  updateError: 'Ziyaret formu guncellenemedi',
  deleteError: 'Ziyaret formu silinemedi',
});

const assets = createSalesDeskCrudHooks('assets', salesDeskApi.assets, {
  createSuccess: 'Demirbas olusturuldu',
  updateSuccess: 'Demirbas guncellendi',
  deleteSuccess: 'Demirbas silindi',
  createError: 'Demirbas olusturulamadi',
  updateError: 'Demirbas guncellenemedi',
  deleteError: 'Demirbas silinemedi',
});

const recurringPayments = createSalesDeskCrudHooks('recurring-payments', salesDeskApi.recurringPayments, {
  createSuccess: 'Odeme kalemi olusturuldu',
  updateSuccess: 'Odeme kalemi guncellendi',
  deleteSuccess: 'Odeme kalemi silindi',
  createError: 'Odeme kalemi olusturulamadi',
  updateError: 'Odeme kalemi guncellenemedi',
  deleteError: 'Odeme kalemi silinemedi',
});

const softwareResearch = createSalesDeskCrudHooks('software-research', salesDeskApi.softwareResearch, {
  createSuccess: 'Arastirma kaydi olusturuldu',
  updateSuccess: 'Arastirma kaydi guncellendi',
  deleteSuccess: 'Arastirma kaydi silindi',
  createError: 'Arastirma kaydi olusturulamadi',
  updateError: 'Arastirma kaydi guncellenemedi',
  deleteError: 'Arastirma kaydi silinemedi',
});

const erpNews = createSalesDeskCrudHooks('erp-news', salesDeskApi.erpNews, {
  createSuccess: 'Haber kaydi olusturuldu',
  updateSuccess: 'Haber kaydi guncellendi',
  deleteSuccess: 'Haber kaydi silindi',
  createError: 'Haber kaydi olusturulamadi',
  updateError: 'Haber kaydi guncellenemedi',
  deleteError: 'Haber kaydi silinemedi',
});

const gmail = createSalesDeskCrudHooks('gmail', salesDeskApi.gmail, {
  createSuccess: 'Gmail kaydi olusturuldu',
  updateSuccess: 'Gmail kaydi guncellendi',
  deleteSuccess: 'Gmail kaydi silindi',
  createError: 'Gmail kaydi olusturulamadi',
  updateError: 'Gmail kaydi guncellenemedi',
  deleteError: 'Gmail kaydi silinemedi',
});

export const useSalesDeskProductList = products.useList;
export const useSalesDeskProductStats = products.useStats;
export const useCreateSalesDeskProduct = () => {
  const mutation = products.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: ProductFormValues) => mutation.mutateAsync(toProductPayload(values)),
  };
};
export const useUpdateSalesDeskProduct = () => {
  const mutation = products.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: ProductFormValues }) =>
      mutation.mutateAsync({ id, body: toProductPayload(values) }),
  };
};
export const useDeleteSalesDeskProduct = products.useDelete;

export const useSalesDeskQuoteList = quotes.useList;
export const useSalesDeskQuoteStats = quotes.useStats;
export const useCreateSalesDeskQuote = () => {
  const mutation = quotes.useCreate();
  return {
    ...mutation,
    mutateAsync: (
      valuesOrInput:
        | QuoteFormValues
        | {
            values: QuoteFormValues;
            lines?: Parameters<typeof toQuotePayload>[1];
          }
    ) => {
      if (typeof valuesOrInput === 'object' && valuesOrInput !== null && 'values' in valuesOrInput) {
        return mutation.mutateAsync(toQuotePayload(valuesOrInput.values, valuesOrInput.lines ?? []));
      }
      return mutation.mutateAsync(toQuotePayload(valuesOrInput));
    },
  };
};
export const useUpdateSalesDeskQuote = () => {
  const mutation = quotes.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: QuoteFormValues }) =>
      mutation.mutateAsync({ id, body: toQuotePayload(values) }),
  };
};
export const useDeleteSalesDeskQuote = quotes.useDelete;

export const useSalesDeskInvoiceList = invoices.useList;
export const useSalesDeskInvoiceStats = invoices.useStats;
export const useCreateSalesDeskInvoice = () => {
  const mutation = invoices.useCreate();
  return {
    ...mutation,
    mutateAsync: (
      valuesOrInput:
        | InvoiceFormValues
        | {
            values: InvoiceFormValues;
            lines?: Parameters<typeof toInvoicePayload>[1];
          }
    ) => {
      if (typeof valuesOrInput === 'object' && valuesOrInput !== null && 'values' in valuesOrInput) {
        return mutation.mutateAsync(
          toInvoicePayload(valuesOrInput.values, valuesOrInput.lines ?? [])
        );
      }
      return mutation.mutateAsync(toInvoicePayload(valuesOrInput));
    },
  };
};
export const useUpdateSalesDeskInvoice = () => {
  const mutation = invoices.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: InvoiceFormValues }) =>
      mutation.mutateAsync({ id, body: toInvoicePayload(values) }),
  };
};
export const useDeleteSalesDeskInvoice = invoices.useDelete;

export const useSalesDeskTaskList = tasks.useList;
export const useSalesDeskTaskStats = tasks.useStats;
export const useCreateSalesDeskTask = () => {
  const mutation = tasks.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: TaskFormValues) => mutation.mutateAsync(toTaskPayload(values)),
  };
};
export const useCreateSalesDeskOpenItem = () => {
  const mutation = tasks.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: TaskFormValues) => mutation.mutateAsync(toOpenItemTaskPayload(values)),
  };
};
export function useCreateSalesDeskActivity(): UseMutationResult<
  SalesDeskTaskDto,
  Error,
  SalesDeskActivityFormValues
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (values: SalesDeskActivityFormValues) => {
      const payload = toSalesDeskActivityPayload(values);
      const created = await salesDeskApi.tasks.create(payload);
      return mergeActivityTask(created, payload);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ACTIVITIES_LIST_KEY });
    },
    onSuccess: (task) => {
      upsertActivityTaskInCache(queryClient, task);
      toast.success('Aktivite olusturuldu');
    },
    onError: (error: Error) => toast.error(error.message || 'Aktivite olusturulamadi'),
  });
}
export const useUpdateSalesDeskTask = () => {
  const mutation = tasks.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: TaskFormValues }) =>
      mutation.mutateAsync({ id, body: toTaskPayload(values) }),
  };
};
export function useUpdateSalesDeskActivity(): UseMutationResult<
  SalesDeskTaskDto,
  Error,
  { id: number; values: SalesDeskActivityFormValues }
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, values }: { id: number; values: SalesDeskActivityFormValues }) => {
      const payload = toSalesDeskActivityPayload(values);
      const updated = await salesDeskApi.tasks.update(id, payload);
      return mergeActivityTask(updated, payload);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ACTIVITIES_LIST_KEY });
    },
    onSuccess: (task) => {
      upsertActivityTaskInCache(queryClient, task);
      toast.success('Aktivite guncellendi');
    },
    onError: (error: Error) => toast.error(error.message || 'Aktivite guncellenemedi'),
  });
}

export function useDeleteSalesDeskActivity(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => salesDeskApi.tasks.delete(id),
    onSuccess: (_, id) => {
      removeActivityTaskFromCache(queryClient, id);
      toast.success('Aktivite silindi');
    },
    onError: (error: Error) => toast.error(error.message || 'Aktivite silinemedi'),
  });
}

export const useDeleteSalesDeskTask = tasks.useDelete;

export const useSalesDeskVisitList = visits.useList;
export const useSalesDeskVisitStats = visits.useStats;
export const useCreateSalesDeskVisit = () => {
  const mutation = visits.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: VisitFormValues) => mutation.mutateAsync(toVisitPayload(values)),
  };
};
export const useUpdateSalesDeskVisit = () => {
  const mutation = visits.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: VisitFormValues }) =>
      mutation.mutateAsync({ id, body: toVisitPayload(values) }),
  };
};
export const useDeleteSalesDeskVisit = visits.useDelete;

export const useSalesDeskVisitFormList = visitForms.useList;
export const useSalesDeskVisitFormStats = visitForms.useStats;
export const useCreateSalesDeskVisitForm = () => {
  const mutation = visitForms.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: VisitFormRecordValues) => mutation.mutateAsync(toVisitFormRecordPayload(values)),
  };
};
export const useUpdateSalesDeskVisitForm = () => {
  const mutation = visitForms.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: VisitFormRecordValues }) =>
      mutation.mutateAsync({ id, body: toVisitFormRecordPayload(values) }),
  };
};
export const useDeleteSalesDeskVisitForm = visitForms.useDelete;

export const useSalesDeskAssetList = assets.useList;
export const useSalesDeskAssetStats = assets.useStats;
export const useCreateSalesDeskAsset = () => {
  const mutation = assets.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: AssetFormValues) => mutation.mutateAsync(toAssetPayload(values)),
  };
};
export const useUpdateSalesDeskAsset = () => {
  const mutation = assets.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: AssetFormValues }) =>
      mutation.mutateAsync({ id, body: toAssetPayload(values) }),
  };
};
export const useDeleteSalesDeskAsset = assets.useDelete;

export const useSalesDeskRecurringPaymentList = recurringPayments.useList;
export const useSalesDeskRecurringPaymentStats = recurringPayments.useStats;
export const useCreateSalesDeskRecurringPayment = () => {
  const mutation = recurringPayments.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: RecurringPaymentFormValues) => mutation.mutateAsync(toRecurringPaymentPayload(values)),
  };
};
export const useUpdateSalesDeskRecurringPayment = () => {
  const mutation = recurringPayments.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: RecurringPaymentFormValues }) =>
      mutation.mutateAsync({ id, body: toRecurringPaymentPayload(values) }),
  };
};
export const useDeleteSalesDeskRecurringPayment = recurringPayments.useDelete;

export const useSalesDeskSoftwareResearchList = softwareResearch.useList;
export const useSalesDeskSoftwareResearchStats = softwareResearch.useStats;
export const useCreateSalesDeskSoftwareResearch = () => {
  const mutation = softwareResearch.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: SoftwareResearchFormValues) => mutation.mutateAsync(toSoftwareResearchPayload(values)),
  };
};
export const useUpdateSalesDeskSoftwareResearch = () => {
  const mutation = softwareResearch.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: SoftwareResearchFormValues }) =>
      mutation.mutateAsync({ id, body: toSoftwareResearchPayload(values) }),
  };
};
export const useDeleteSalesDeskSoftwareResearch = softwareResearch.useDelete;

export const useSalesDeskErpNewsList = erpNews.useList;
export const useSalesDeskErpNewsStats = erpNews.useStats;
export const useCreateSalesDeskErpNews = () => {
  const mutation = erpNews.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: ErpNewsFormValues) => mutation.mutateAsync(toErpNewsPayload(values)),
  };
};
export const useUpdateSalesDeskErpNews = () => {
  const mutation = erpNews.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: ErpNewsFormValues }) =>
      mutation.mutateAsync({ id, body: toErpNewsPayload(values) }),
  };
};
export const useDeleteSalesDeskErpNews = erpNews.useDelete;

export const useSalesDeskGmailList = gmail.useList;
export const useSalesDeskGmailStats = gmail.useStats;
export const useCreateSalesDeskGmail = () => {
  const mutation = gmail.useCreate();
  return {
    ...mutation,
    mutateAsync: (values: GmailFormValues) => mutation.mutateAsync(toGmailPayload(values)),
  };
};
export const useUpdateSalesDeskGmail = () => {
  const mutation = gmail.useUpdate();
  return {
    ...mutation,
    mutateAsync: ({ id, values }: { id: number; values: GmailFormValues }) =>
      mutation.mutateAsync({ id, body: toGmailPayload(values) }),
  };
};
export const useDeleteSalesDeskGmail = gmail.useDelete;

const productCustomersKey = ['salesdesk', 'product-customers'] as const;

export function useSalesDeskProductCustomerList(params: PagedParams): UseQueryResult<PagedResponse<SalesDeskProductCustomerDto>> {
  return useQuery({
    queryKey: [...productCustomersKey, 'list', params],
    queryFn: () => salesDeskApi.productCustomers.list(params),
    staleTime: 15000,
  });
}

export function useCreateSalesDeskProductCustomer(): UseMutationResult<
  SalesDeskProductCustomerDto,
  Error,
  Partial<SalesDeskProductCustomerDto>
> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body) => salesDeskApi.productCustomers.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCustomersKey });
      toast.success('Urun-cari baglantisi olusturuldu');
    },
    onError: (error: Error) => toast.error(error.message || 'Baglanti olusturulamadi'),
  });
}

export function useDeleteSalesDeskProductCustomer(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => salesDeskApi.productCustomers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productCustomersKey });
      toast.success('Baglanti silindi');
    },
    onError: (error: Error) => toast.error(error.message || 'Baglanti silinemedi'),
  });
}

export function useSalesDeskOpenItemsList(params: PagedParams): UseQueryResult<PagedResponse<SalesDeskTaskDto>> {
  return useQuery({
    queryKey: ['salesdesk', 'tasks', 'open-items', params],
    queryFn: () => salesDeskApi.tasks.openItems(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesDeskActivitiesList(
  params: PagedParams
): UseQueryResult<SalesDeskActivitiesListResult> {
  return useQuery({
    queryKey: [...ACTIVITIES_LIST_KEY, params],
    queryFn: () => salesDeskApi.tasks.activities(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesDeskDashboard(): UseQueryResult<SalesDeskDashboardDto> {
  return useQuery({
    queryKey: ['salesdesk', 'dashboard'],
    queryFn: () => salesDeskApi.dashboard(),
    staleTime: 30000,
  });
}

const SALESDESK_OPTIONS_STALE_TIME_MS = 5 * 60 * 1000;
const SALESDESK_OPTIONS_GC_TIME_MS = 30 * 60 * 1000;

export function useSalesDeskCustomerOptions(): UseQueryResult<SalesDeskCustomerDto[]> {
  return useQuery({
    queryKey: ['salesdesk', 'customers', 'options'],
    queryFn: async () => {
      const response = await salesDeskApi.customers.list({ pageNumber: 1, pageSize: 200, sortBy: 'Name', sortDirection: 'asc' });
      return response.data;
    },
    staleTime: SALESDESK_OPTIONS_STALE_TIME_MS,
    gcTime: SALESDESK_OPTIONS_GC_TIME_MS,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesDeskProductOptions(): UseQueryResult<SalesDeskProductDto[]> {
  return useQuery({
    queryKey: ['salesdesk', 'products', 'options'],
    queryFn: async () => {
      const response = await salesDeskApi.products.list({ pageNumber: 1, pageSize: 200, sortBy: 'Name', sortDirection: 'asc' });
      return response.data;
    },
    staleTime: SALESDESK_OPTIONS_STALE_TIME_MS,
    gcTime: SALESDESK_OPTIONS_GC_TIME_MS,
    placeholderData: (previousData) => previousData,
  });
}

export function useSalesDeskPotentialOptions(): UseQueryResult<
  Awaited<ReturnType<typeof salesDeskApi.potentials.list>>['data']
> {
  return useQuery({
    queryKey: ['salesdesk', 'potentials', 'options'],
    queryFn: async () => {
      const response = await salesDeskApi.potentials.list({ pageNumber: 1, pageSize: 200, sortBy: 'CompanyName', sortDirection: 'asc' });
      return response.data;
    },
    staleTime: 60000,
  });
}

export interface SalesDeskUserOption {
  id: number;
  name: string;
}

export function useSalesDeskUserOptions(): UseQueryResult<SalesDeskUserOption[]> {
  return useQuery({
    queryKey: ['salesdesk', 'users', 'options'],
    queryFn: async () => {
      const response = await userApi.getList({ pageNumber: 1, pageSize: 200, sortBy: 'Id', sortDirection: 'asc' });
      return (response.data ?? []).map((user) => {
        const fullName = user.fullName?.trim();
        const composed = [user.firstName, user.lastName].filter(Boolean).join(' ').trim();
        return {
          id: user.id,
          name: fullName || composed || user.username,
        } satisfies SalesDeskUserOption;
      });
    },
    staleTime: SALESDESK_OPTIONS_STALE_TIME_MS,
    gcTime: SALESDESK_OPTIONS_GC_TIME_MS,
    placeholderData: (previousData) => previousData,
  });
}