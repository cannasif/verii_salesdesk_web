import { type ReactElement, useMemo, useState } from 'react';
import { Newspaper } from 'lucide-react';
import type { SalesDeskErpNewsItemDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskErpNews,
  useDeleteSalesDeskErpNews,
  useSalesDeskErpNewsList,
  useSalesDeskErpNewsStats,
  useUpdateSalesDeskErpNews,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  erpNewsFormSchema,
  toErpNewsFormValues,
  type ErpNewsFormValues,
} from '../../types/salesdesk-schemas';
import { UnreadBadge } from './salesdesk-badges';

export function SalesDeskErpNewsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskErpNewsItemDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskErpNewsItemDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'PublishedAt', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskErpNewsList(listParams);
  const { data: statsData } = useSalesDeskErpNewsStats();
  const createNews = useCreateSalesDeskErpNews();
  const updateNews = useUpdateSalesDeskErpNews();
  const deleteNews = useDeleteSalesDeskErpNews();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const today = new Date().toISOString().slice(0, 10);

  const handleSubmit = async (values: ErpNewsFormValues): Promise<void> => {
    if (editing) {
      await updateNews.mutateAsync({ id: editing.id, values });
      return;
    }
    await createNews.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      title="ERP Haber Takibi"
      subtitle="GIB, Netsis, IK ve ERP gundemi"
      tableTitle="Haber Listesi"
      actionLabel="Yeni Haber"
      icon={<Newspaper size={22} />}
      metrics={[
        { label: 'Listelenen', value: statsData?.totalCount ?? 0 },
        { label: 'Kritik', value: statsRows.filter((item) => item.isCritical).length, tone: 'pink' },
        { label: 'Bugun', value: statsRows.filter((item) => item.publishedAt.slice(0, 10) === today).length, tone: 'green' },
        { label: 'Okunmamis', value: statsRows.filter((item) => !item.isRead).length, tone: 'yellow' },
      ]}
      columns={[
        { key: 'topic', header: 'KONU', render: (row) => row.topic },
        { key: 'title', header: 'BASLIK', render: (row) => row.title },
        { key: 'source', header: 'KAYNAK', render: (row) => row.source || '-' },
        { key: 'score', header: 'PUAN', render: (row) => row.score },
        { key: 'publishedAt', header: 'TARIH', render: (row) => formatDate(row.publishedAt) },
        { key: 'isRead', header: 'OKUNDU', render: (row) => <UnreadBadge isUnread={!row.isRead} /> },
      ]}
      rows={rows}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      error={error as Error | null}
      searchTerm={listPage.searchTerm}
      onSearchChange={listPage.setSearchTerm}
      pageSize={listPage.pageSize}
      onPageSizeChange={listPage.setPageSize}
      pageNumber={listPage.pageNumber}
      totalPages={Math.max(1, data?.totalPages ?? 1)}
      totalCount={data?.totalCount ?? 0}
      onPageChange={listPage.setPageNumber}
      onRefresh={() => refetch()}
      onAdd={() => {
        setEditing(null);
        setFormOpen(true);
      }}
      onEdit={(row) => {
        setEditing(row);
        setFormOpen(true);
      }}
      onDeleteRequest={setDeleting}
      deletingRow={deleting}
      onDeleteConfirm={async () => {
        if (!deleting) return;
        await deleteNews.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteNews.isPending}
      deleteLabel={(row) => row.title}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Haberi Duzenle' : 'Yeni Haber'}
          description="ERP haber kaydi olusturun."
          schema={erpNewsFormSchema}
          defaultValues={toErpNewsFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toErpNewsFormValues(entity as SalesDeskErpNewsItemDto)}
          onSubmit={handleSubmit}
          isLoading={createNews.isPending || updateNews.isPending}
          fields={[
            { name: 'topic', label: 'Konu', required: true },
            { name: 'title', label: 'Baslik', required: true, colSpan: 2 },
            { name: 'source', label: 'Kaynak' },
            { name: 'sourceUrl', label: 'Kaynak URL' },
            { name: 'score', label: 'Puan', type: 'number', min: 0, max: 10 },
            { name: 'publishedAt', label: 'Yayin Tarihi', type: 'date', required: true },
            { name: 'isCritical', label: 'Kritik', type: 'checkbox' },
            { name: 'isRead', label: 'Okundu', type: 'checkbox' },
          ]}
        />
      }
    />
  );
}
