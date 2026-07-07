import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, BookOpen, Bot, CopySlash, Newspaper, Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskErpNewsItemEnriched, ErpNewsFeedFilter } from '../../lib/erp-news-types';
import { isNewsVisibleToUser } from '../../lib/erp-news-automation';
import { enrichErpNewsItems } from '../../lib/erp-news-normalize';
import { matchesNewsFeedFilter } from '../../lib/erp-news-ui';
import { toErpNewsFormValues } from '../../types/salesdesk-schemas';
import { SalesDeskKpiCards } from '../SalesDeskKpiCards';
import { SalesDeskErpNewsFeed } from '../erp-news/SalesDeskErpNewsFeed';
import {
  useDeleteSalesDeskErpNews,
  useSalesDeskErpNewsList,
  useSalesDeskErpNewsStats,
  useUpdateSalesDeskErpNews,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { useSalesDeskGroupList } from '../../hooks/useSalesDeskGroups';
import { useDeleteErpNewsMetaOverlay, useErpNewsMetaBundle, useTriggerErpNewsAutomation } from '../../hooks/useErpNewsMeta';
import {
  useDedupeErpNewsDuplicates,
  usePreviewErpNewsDedupe,
  type ErpNewsDedupePreview,
} from '../../hooks/useErpNewsDedupe';
import { salesDeskPageShellClass } from '../../lib/salesdesk-shared';
import {
  SD_DELETE_DIALOG_ACTION,
  SD_PAGE_ADD_BUTTON,
  SD_PAGE_HEADER_ROW,
  SD_PAGE_ICON_BOX,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
} from '../../lib/salesdesk-popup-styles';

export function SalesDeskErpNewsPage(): ReactElement {
  const navigate = useNavigate();
  const userId = useAuthStore((state) => state.user?.id);
  const listPage = useSalesDeskListPage(10);
  const [deleting, setDeleting] = useState<SalesDeskErpNewsItemEnriched | null>(null);
  const [feedFilter, setFeedFilter] = useState<ErpNewsFeedFilter>('all');
  const [togglingReadId, setTogglingReadId] = useState<number | null>(null);
  const [dedupeOpen, setDedupeOpen] = useState(false);
  const [dedupePreview, setDedupePreview] = useState<ErpNewsDedupePreview | null>(null);
  const [dedupeProgress, setDedupeProgress] = useState<{ done: number; total: number } | null>(null);

  const previewDedupe = usePreviewErpNewsDedupe();
  const dedupeDuplicates = useDedupeErpNewsDuplicates();
  const autoDedupePrompted = useRef(false);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'PublishedAt', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskErpNewsList(listParams);
  const { data: statsData } = useSalesDeskErpNewsStats();
  const { data: metaBundle } = useErpNewsMetaBundle();
  const { data: groups = [] } = useSalesDeskGroupList();
  const deleteNews = useDeleteSalesDeskErpNews();
  const deleteOverlay = useDeleteErpNewsMetaOverlay();
  const updateNews = useUpdateSalesDeskErpNews();
  const triggerAutomation = useTriggerErpNewsAutomation();

  const enrichedRows = useMemo(() => {
    const rows = data?.data ?? [];
    const overlays = metaBundle?.overlays ?? {};
    return enrichErpNewsItems(rows, overlays);
  }, [data?.data, metaBundle?.overlays]);

  const overlays = useMemo(() => metaBundle?.overlays ?? {}, [metaBundle?.overlays]);
  const statsRows = statsData?.data ?? [];
  const todayKey = new Date().toISOString().slice(0, 10);

  const filteredRows = useMemo(() => {
    return enrichedRows.filter((item) => {
      if (feedFilter === 'my-feed' && !isNewsVisibleToUser(item, userId, groups)) return false;
      if (feedFilter !== 'all' && feedFilter !== 'my-feed' && !matchesNewsFeedFilter(item, feedFilter, todayKey)) {
        return false;
      }
      return true;
    });
  }, [enrichedRows, feedFilter, todayKey, userId, groups]);

  const systemCount = useMemo(() => enrichedRows.filter((item) => item.sourceType === 'system').length, [enrichedRows]);

  const handleRefresh = (): void => {
    refetch();
  };

  const handleToggleRead = async (item: SalesDeskErpNewsItemEnriched): Promise<void> => {
    setTogglingReadId(item.id);
    try {
      const overlay = overlays[String(item.id)];
      const values = toErpNewsFormValues(item, overlay);
      await updateNews.mutateAsync({
        id: item.id,
        values: { ...values, isRead: !item.isRead },
      });
    } finally {
      setTogglingReadId(null);
    }
  };

  const handleOpenDedupe = useCallback(async (): Promise<void> => {
    setDedupeOpen(true);
    setDedupePreview(null);
    setDedupeProgress(null);
    try {
      const preview = await previewDedupe.mutateAsync(undefined);
      setDedupePreview(preview);
    } catch {
      setDedupeOpen(false);
    }
  }, [previewDedupe]);

  const handleConfirmDedupe = async (): Promise<void> => {
    setDedupeProgress({ done: 0, total: dedupePreview?.duplicateCount ?? 0 });
    try {
      await dedupeDuplicates.mutateAsync({
        keepPerTitle: 1,
        onProgress: (done, total) => setDedupeProgress({ done, total }),
      });
      setDedupeOpen(false);
      setDedupePreview(null);
      setDedupeProgress(null);
      refetch();
    } catch {
      setDedupeProgress(null);
    }
  };

  const isDedupeBusy = previewDedupe.isPending || dedupeDuplicates.isPending;

  useEffect(() => {
    const total = statsData?.totalCount ?? 0;
    if (autoDedupePrompted.current || total <= 50 || isDedupeBusy || dedupeOpen) return;
    autoDedupePrompted.current = true;
    void handleOpenDedupe();
  }, [statsData?.totalCount, isDedupeBusy, dedupeOpen, handleOpenDedupe]);

  return (
    <div className={salesDeskPageShellClass}>
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="flex min-w-0 items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <Newspaper size={22} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className={SD_PAGE_TITLE}>ERP Haber Takibi</h1>
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
              <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
              Sistem tetikleyicileri, modul olaylari ve dis kaynak haberlerini tek akista yonetin
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {(statsData?.totalCount ?? 0) > 20 ? (
            <button
              type="button"
              onClick={() => void handleOpenDedupe()}
              disabled={isDedupeBusy}
              className="inline-flex h-11 min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-rose-500/40 bg-rose-500/10 px-4 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20 disabled:opacity-60 sm:w-auto"
            >
              <CopySlash size={16} />
              {isDedupeBusy ? 'Temizleniyor...' : 'Yinelenenleri Temizle'}
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => triggerAutomation.mutate({ groups, silent: false })}
            disabled={triggerAutomation.isPending}
            className={cn(SD_SECONDARY_BUTTON, 'w-full sm:w-auto')}
          >
            <Bot size={16} />
            {triggerAutomation.isPending ? 'Taraniyor...' : 'Tetikleyicileri Calistir'}
          </button>
          <button type="button" onClick={() => navigate('/salesdesk/erp-news/new')} className={SD_PAGE_ADD_BUTTON}>
            <Plus size={16} className="mr-2" />
            Yeni Haber
          </button>
        </div>
      </div>

      <SalesDeskKpiCards
        isLoading={isLoading}
        items={[
          {
            key: 'total',
            label: 'Toplam',
            value: statsData?.totalCount ?? 0,
            hint: 'Tum haber kayitlari',
            tone: 'brand',
            icon: Newspaper,
          },
          {
            key: 'system',
            label: 'Sistem',
            value: systemCount,
            hint: 'Otomatik olusturulan haberler',
            tone: 'sky',
            icon: Bot,
          },
          {
            key: 'critical',
            label: 'Kritik',
            value: statsRows.filter((item) => item.isCritical).length,
            hint: 'Acil takip gerektirenler',
            tone: 'rose',
            icon: AlertTriangle,
          },
          {
            key: 'unread',
            label: 'Okunmamis',
            value: statsRows.filter((item) => !item.isRead).length,
            hint: 'Henuz okunmayan kayitlar',
            tone: 'amber',
            icon: BookOpen,
          },
        ]}
      />

      <SalesDeskErpNewsFeed
        items={filteredRows}
        totalCount={
          feedFilter === 'all' || feedFilter === 'my-feed'
            ? filteredRows.length
            : filteredRows.length
        }
        feedFilter={feedFilter}
        onFeedFilterChange={setFeedFilter}
        isLoading={isLoading}
        isFetching={isFetching || triggerAutomation.isPending || isDedupeBusy}
        isError={isError}
        errorMessage={(error as Error | null)?.message}
        searchTerm={listPage.searchTerm}
        onSearchChange={listPage.setSearchTerm}
        onRefresh={handleRefresh}
        pageNumber={listPage.pageNumber}
        pageSize={listPage.pageSize}
        totalPages={Math.max(1, data?.totalPages ?? 1)}
        onPageChange={listPage.setPageNumber}
        onPageSizeChange={listPage.setPageSize}
        onEdit={(item) => navigate(`/salesdesk/erp-news/${item.id}/edit`)}
        onDelete={setDeleting}
        onToggleRead={handleToggleRead}
        togglingReadId={togglingReadId}
        onAdd={() => navigate('/salesdesk/erp-news/new')}
      />

      <SalesDeskDeleteDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Haberi sil"
        description={
          deleting
            ? buildSalesDeskDeleteDescription(deleting.title)
            : 'Bu islem geri alinamaz.'
        }
        onConfirm={async () => {
          if (!deleting) return;
          await deleteNews.mutateAsync(deleting.id);
          deleteOverlay.mutate(deleting.id);
          setDeleting(null);
        }}
        isDeleting={deleteNews.isPending}
      />

      <AlertDialog
        open={dedupeOpen}
        onOpenChange={(open) => {
          if (!isDedupeBusy) {
            setDedupeOpen(open);
            if (!open) {
              setDedupePreview(null);
              setDedupeProgress(null);
            }
          }
        }}
      >
        <AlertDialogContent className={`w-[90%] max-w-lg gap-0 overflow-hidden rounded-2xl p-0 sm:w-full ${SD_SURFACE_DIALOG}`}>
          <AlertDialogHeader className="px-6 pb-4 pt-8 text-center sm:text-left">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Yinelenen haberleri temizle
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-[var(--crm-app-text-muted)]">
                {previewDedupe.isPending ? (
                  <p>Kayitlar taranıyor...</p>
                ) : dedupePreview ? (
                  <>
                    <p>
                      Ayni basliga sahip kayitlardan <strong>yalnizca 1 tanesi</strong> birakilacak.
                    </p>
                    <div className="rounded-xl border border-[var(--crm-app-border)] bg-black/20 px-4 py-3 text-left">
                      <p>
                        <span className="font-semibold text-rose-300">{dedupePreview.duplicateCount}</span> kayit
                        silinecek
                      </p>
                      <p>
                        <span className="font-semibold text-emerald-300">{dedupePreview.keepCount}</span> kayit kalacak
                      </p>
                    </div>
                    {dedupePreview.duplicateTitles.length > 0 ? (
                      <ul className="max-h-40 space-y-1 overflow-y-auto text-left text-xs">
                        {dedupePreview.duplicateTitles.slice(0, 8).map((item) => (
                          <li key={item.title} className="truncate">
                            {item.title} — {item.count} adet ({item.removing} silinecek)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Yinelenen kayit bulunamadi.</p>
                    )}
                    {dedupeProgress ? (
                      <p className="text-xs">
                        Siliniyor: {dedupeProgress.done} / {dedupeProgress.total}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <p>Onizleme yuklenemedi.</p>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-4">
            <AlertDialogCancel className={SD_SECONDARY_BUTTON} disabled={isDedupeBusy}>
              Iptal
            </AlertDialogCancel>
            <AlertDialogAction
              className={`${SD_DELETE_DIALOG_ACTION} disabled:opacity-60`}
              disabled={isDedupeBusy || !dedupePreview || dedupePreview.duplicateCount === 0}
              onClick={(event) => {
                event.preventDefault();
                void handleConfirmDedupe();
              }}
            >
              {dedupeDuplicates.isPending
                ? `Siliniyor${dedupeProgress ? ` (${dedupeProgress.done}/${dedupeProgress.total})` : ''}...`
                : 'Yinelenenleri Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
