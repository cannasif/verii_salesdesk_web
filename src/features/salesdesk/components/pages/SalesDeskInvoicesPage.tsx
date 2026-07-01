import { type ReactElement, useMemo, useState } from 'react';
import { CreditCard } from 'lucide-react';
import type { SalesDeskInvoiceDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskInvoice,
  useDeleteSalesDeskInvoice,
  useSalesDeskCustomerOptions,
  useSalesDeskInvoiceList,
  useSalesDeskInvoiceStats,
  useUpdateSalesDeskInvoice,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatDate, formatMoney, withNoneOption } from '../../lib/salesdesk-shared';
import { DOCUMENT_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  invoiceFormSchema,
  toInvoiceFormValues,
  type InvoiceFormValues,
} from '../../types/salesdesk-schemas';
import { DocumentStatusBadge } from './salesdesk-badges';

export function SalesDeskInvoicesPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskInvoiceDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskInvoiceDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'InvoiceDate', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskInvoiceList(listParams);
  const { data: statsData } = useSalesDeskInvoiceStats();
  const { data: customers } = useSalesDeskCustomerOptions();
  const createInvoice = useCreateSalesDeskInvoice();
  const updateInvoice = useUpdateSalesDeskInvoice();
  const deleteInvoice = useDeleteSalesDeskInvoice();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const toIssueCount = statsRows.filter((item) => item.status === 5).length;
  const issuedCount = statsRows.filter((item) => item.status === 6).length;

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));

  const handleSubmit = async (values: InvoiceFormValues): Promise<void> => {
    if (editing) {
      await updateInvoice.mutateAsync({ id: editing.id, values });
      return;
    }
    await createInvoice.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      title="Faturalar"
      subtitle="Satis faturasi kesimi, vade takibi ve teklif donusumu"
      tableTitle="Fatura Listesi"
      actionLabel="Yeni Fatura Ekle"
      icon={<CreditCard size={22} />}
      accentClass="border-pink-400/20 bg-pink-500/15 text-pink-300"
      metrics={[
        { label: 'Toplam Fatura', value: statsData?.totalCount ?? 0 },
        { label: 'Kesilecek', value: toIssueCount, tone: 'yellow' },
        { label: 'Kesildi', value: issuedCount, tone: 'green' },
      ]}
      columns={[
        { key: 'invoiceNumber', header: 'FATURA NO', render: (row) => row.invoiceNumber },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName },
        { key: 'invoiceDate', header: 'TARIH', render: (row) => formatDate(row.invoiceDate) },
        { key: 'dueDate', header: 'VADE', render: (row) => formatDate(row.dueDate) },
        { key: 'status', header: 'DURUM', render: (row) => <DocumentStatusBadge status={row.status} /> },
        { key: 'grandTotal', header: 'TOPLAM', render: (row) => formatMoney(row.grandTotal) },
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
        await deleteInvoice.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteInvoice.isPending}
      deleteLabel={(row) => row.invoiceNumber}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Faturayi Duzenle' : 'Yeni Fatura'}
          description="Fatura baslik bilgilerini girin."
          schema={invoiceFormSchema}
          defaultValues={toInvoiceFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toInvoiceFormValues(entity as SalesDeskInvoiceDto)}
          onSubmit={handleSubmit}
          isLoading={createInvoice.isPending || updateInvoice.isPending}
          fields={[
            { name: 'invoiceNumber', label: 'Fatura No', placeholder: 'Otomatik' },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions, required: true },
            { name: 'quoteId', label: 'Teklif ID', type: 'select', options: withNoneOption([], 'Yok') },
            { name: 'invoiceDate', label: 'Fatura Tarihi', type: 'date', required: true },
            { name: 'dueDate', label: 'Vade Tarihi', type: 'date', required: true },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(DOCUMENT_STATUS_LABELS),
              required: true,
            },
            { name: 'discountRate', label: 'Iskonto (%)', type: 'number', min: 0, max: 100 },
            { name: 'notes', label: 'Notlar', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
