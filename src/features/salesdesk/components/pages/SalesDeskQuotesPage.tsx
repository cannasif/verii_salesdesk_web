import { type ReactElement, useMemo, useState } from 'react';
import { FileText } from 'lucide-react';
import type { SalesDeskQuoteDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskQuote,
  useDeleteSalesDeskQuote,
  useSalesDeskCustomerOptions,
  useSalesDeskQuoteList,
  useSalesDeskQuoteStats,
  useUpdateSalesDeskQuote,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatDate, formatMoney } from '../../lib/salesdesk-shared';
import { DOCUMENT_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  quoteFormSchema,
  toQuoteFormValues,
  type QuoteFormValues,
} from '../../types/salesdesk-schemas';
import { DocumentStatusBadge } from './salesdesk-badges';

export function SalesDeskQuotesPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskQuoteDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskQuoteDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'QuoteDate', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskQuoteList(listParams);
  const { data: statsData } = useSalesDeskQuoteStats();
  const { data: customers } = useSalesDeskCustomerOptions();
  const createQuote = useCreateSalesDeskQuote();
  const updateQuote = useUpdateSalesDeskQuote();
  const deleteQuote = useDeleteSalesDeskQuote();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const pendingCount = statsRows.filter((item) => item.status === 1 || item.status === 2).length;
  const approvedCount = statsRows.filter((item) => item.status === 3).length;

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));

  const handleSubmit = async (values: QuoteFormValues): Promise<void> => {
    if (editing) {
      await updateQuote.mutateAsync({ id: editing.id, values });
      return;
    }
    await createQuote.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      title="Teklifler"
      subtitle="Teklif olusturma, durum takibi ve cari bazli listeleme"
      tableTitle="Teklif Listesi"
      actionLabel="Yeni Teklif Ekle"
      icon={<FileText size={22} />}
      metrics={[
        { label: 'Toplam Teklif', value: statsData?.totalCount ?? 0 },
        { label: 'Bekleyen', value: pendingCount, tone: 'yellow' },
        { label: 'Onayli', value: approvedCount, tone: 'green' },
      ]}
      columns={[
        { key: 'quoteNumber', header: 'TEKLIF NO', render: (row) => row.quoteNumber },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName },
        { key: 'quoteDate', header: 'TARIH', render: (row) => formatDate(row.quoteDate) },
        { key: 'status', header: 'DURUM', render: (row) => <DocumentStatusBadge status={row.status} /> },
        { key: 'subTotal', header: 'ARA TOPLAM', render: (row) => formatMoney(row.subTotal) },
        { key: 'grandTotal', header: 'GENEL TOPLAM', render: (row) => formatMoney(row.grandTotal) },
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
        await deleteQuote.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteQuote.isPending}
      deleteLabel={(row) => row.quoteNumber}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Teklifi Duzenle' : 'Yeni Teklif'}
          description="Teklif baslik bilgilerini girin. Kalemler opsiyoneldir."
          schema={quoteFormSchema}
          defaultValues={toQuoteFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toQuoteFormValues(entity as SalesDeskQuoteDto)}
          onSubmit={handleSubmit}
          isLoading={createQuote.isPending || updateQuote.isPending}
          fields={[
            { name: 'quoteNumber', label: 'Teklif No', placeholder: 'Otomatik' },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions, required: true },
            { name: 'quoteDate', label: 'Teklif Tarihi', type: 'date', required: true },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(DOCUMENT_STATUS_LABELS),
              required: true,
            },
            { name: 'notes', label: 'Notlar', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
