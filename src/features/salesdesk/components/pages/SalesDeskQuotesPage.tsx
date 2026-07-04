import { type ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { SalesDeskQuoteDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import { SalesDeskQuotePreviewDialog } from '../quotes/SalesDeskQuotePreviewDialog';
import { SalesDeskQuoteShareActions } from '../quotes/SalesDeskQuoteShareActions';
import {
  useCreateSalesDeskQuote,
  useDeleteSalesDeskQuote,
  useSalesDeskCustomerOptions,
  useSalesDeskQuoteList,
  useSalesDeskQuoteStats,
  useUpdateSalesDeskQuote,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import type { SalesDeskQuotePreviewData } from '../../lib/build-salesdesk-quote-preview-data';
import { enumToSelectOptions, formatDate, formatMoney } from '../../lib/salesdesk-shared';
import { DOCUMENT_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  quoteFormSchema,
  toQuoteFormValues,
  type QuoteFormValues,
} from '../../types/salesdesk-schemas';
import { DocumentStatusBadge } from './salesdesk-badges';

export function SalesDeskQuotesPage(): ReactElement {
  const navigate = useNavigate();
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskQuoteDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskQuoteDto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<SalesDeskQuotePreviewData | null>(null);
  const [previewQuote, setPreviewQuote] = useState<SalesDeskQuoteDto | null>(null);

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

  const customerContacts = useMemo(() => {
    const map: Record<number, { email?: string | null; phone?: string | null }> = {};
    for (const customer of customers ?? []) {
      map[customer.id] = { email: customer.email, phone: customer.phone };
    }
    return map;
  }, [customers]);

  const handleSubmit = async (values: QuoteFormValues): Promise<void> => {
    const customerName =
      customerOptions.find((option) => option.value === String(values.customerId))?.label ?? 'Musteri';

    if (editing) {
      await updateQuote.mutateAsync({ id: editing.id, values, customerName });
      return;
    }
    await createQuote.mutateAsync({ values, lines: [], customerName });
  };

  const openPreview = (payload: { data: SalesDeskQuotePreviewData; quote: SalesDeskQuoteDto }): void => {
    setPreviewData(payload.data);
    setPreviewQuote(payload.quote);
    setPreviewOpen(true);
  };

  return (
    <>
      <SalesDeskListLayout
        pageKey="salesdesk-quotes"
        title="Teklifler"
        subtitle="Teklif olusturma, onizleme, PDF / Excel / Gmail / WhatsApp gonderimi"
        tableTitle="Teklif Listesi"
        actionLabel="Yeni Teklif Ekle"
        exportFileName="salesdesk-teklifler"
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
        onAdd={() => navigate('/salesdesk/quotes/new')}
        onEdit={(row) => {
          setEditing(row);
          setFormOpen(true);
        }}
        onDeleteRequest={setDeleting}
        renderExtraActions={(row) => (
          <SalesDeskQuoteShareActions
            quote={row}
            contact={customerContacts[row.customerId] ?? null}
            onPreview={openPreview}
          />
        )}
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

      <SalesDeskQuotePreviewDialog
        open={previewOpen}
        data={previewData}
        quote={previewQuote}
        quoteForExcel={previewQuote}
        contact={previewQuote ? customerContacts[previewQuote.customerId] ?? null : null}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewData(null);
            setPreviewQuote(null);
          }
        }}
      />
    </>
  );
}
