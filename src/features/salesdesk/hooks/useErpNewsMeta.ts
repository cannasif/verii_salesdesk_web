import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { erpNewsMetaApi } from '../api/erp-news-meta-api';
import type { ErpNewsMetaOverlay } from '../lib/erp-news-types';
import type { SalesDeskGroupDto } from '../types/salesdesk-group-types';

export const ERP_NEWS_META_QUERY_KEY = ['salesdesk', 'erp-news', 'meta'] as const;

export function useErpNewsMetaBundle() {
  return useQuery({
    queryKey: ERP_NEWS_META_QUERY_KEY,
    queryFn: () => erpNewsMetaApi.getBundle(),
    staleTime: 15_000,
    retry: false,
  });
}

export function useSaveErpNewsMetaOverlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      newsId,
      overlay,
    }: {
      newsId: number;
      overlay: Omit<ErpNewsMetaOverlay, 'newsId' | 'updatedAt'>;
    }) => erpNewsMetaApi.saveOverlay(newsId, overlay),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ERP_NEWS_META_QUERY_KEY });
    },
  });
}

export function useDeleteErpNewsMetaOverlay() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newsId: number) => erpNewsMetaApi.deleteOverlay(newsId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ERP_NEWS_META_QUERY_KEY });
    },
  });
}

interface TriggerAutomationInput {
  groups: SalesDeskGroupDto[];
  silent?: boolean;
}

export function useTriggerErpNewsAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ groups }: TriggerAutomationInput) => {
      const { runErpNewsAutomation } = await import('../lib/erp-news-automation');
      return runErpNewsAutomation(groups);
    },
    onSuccess: (result, variables) => {
      queryClient.invalidateQueries({ queryKey: ERP_NEWS_META_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['salesdesk', 'erp-news'] });

      if (variables.silent) return;

      if (result.created > 0) {
        toast.success(`${result.created} otomatik haber olusturuldu.`);
      } else if (result.errors.length === 0) {
        toast.message('Yeni otomatik haber bulunamadi.', {
          description: `${result.skipped} kayit zaten mevcut.`,
        });
      }
      if (result.errors.length > 0) {
        toast.error(result.errors[0]);
      }
    },
    onError: (error, variables) => {
      if (variables.silent) return;
      toast.error(error instanceof Error ? error.message : 'Otomasyon calistirilamadi.');
    },
  });
}
