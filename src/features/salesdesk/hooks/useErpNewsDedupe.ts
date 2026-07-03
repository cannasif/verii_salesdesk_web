import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { previewErpNewsDedupe, runErpNewsDedupe, type ErpNewsDedupePreview } from '../lib/erp-news-dedupe';
import { ERP_NEWS_META_QUERY_KEY } from './useErpNewsMeta';

interface DedupeInput {
  keepPerTitle?: number;
  onProgress?: (done: number, total: number) => void;
}

export function usePreviewErpNewsDedupe() {
  return useMutation({
    mutationFn: (keepPerTitle?: number) => previewErpNewsDedupe(keepPerTitle ?? 1),
  });
}

export function useDedupeErpNewsDuplicates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ keepPerTitle = 1, onProgress }: DedupeInput) =>
      runErpNewsDedupe(keepPerTitle, onProgress),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: ['salesdesk', 'erp-news'] });
      void queryClient.invalidateQueries({ queryKey: ERP_NEWS_META_QUERY_KEY });

      if (result.deleted > 0) {
        toast.success(`${result.deleted} yinelenen haber silindi.`, {
          description: `${result.kept} benzersiz kayit kaldi.`,
        });
      } else {
        toast.message('Yinelenen haber bulunamadi.');
      }

      if (result.failed > 0) {
        toast.error(`${result.failed} kayit silinemedi.`, {
          description: result.errors[0],
        });
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Temizlik tamamlanamadi.');
    },
  });
}

export type { ErpNewsDedupePreview };
