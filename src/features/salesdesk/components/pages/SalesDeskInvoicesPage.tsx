import { type ReactElement, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Plus, ShoppingBag } from 'lucide-react';
import type { SalesDeskInvoiceDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm, type SalesDeskFormField } from '../SalesDeskEntityForm';
import { SalesDeskInvoiceTypeTabs } from '../SalesDeskInvoiceTypeTabs';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import { SalesDeskQuotePreviewDialog } from '../quotes/SalesDeskQuotePreviewDialog';
import { SalesDeskInvoiceShareActions } from '../invoices/SalesDeskInvoiceShareActions';
import type { SalesDeskQuotePreviewData } from '../../lib/build-salesdesk-quote-preview-data';
import { salesDeskInvoicesApi } from '../../api/salesdesk-invoices-api';
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
import {
  filterInvoicesByType,
  resolveInvoiceType,
  SALES_DESK_INVOICE_TYPE,
  SALES_DESK_INVOICE_TYPE_LABELS,
  type SalesDeskInvoiceTypeFilter,
} from '../../types/invoice-types';
import { DocumentStatusBadge, InvoiceTypeBadge } from './salesdesk-badges';
import { Button } from '@/components/ui/button';
import { ADD_BUTTON_CLASS } from '@/lib/management-list-layout';

function parseTypeFilter(value: string | null): SalesDeskInvoiceTypeFilter {
  if (value === 'sales' || value === 'purchase') return value;
  return 'all';
}

export function SalesDeskInvoicesPage(): ReactElement {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const typeFilter = parseTypeFilter(searchParams.get('type'));
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [formInvoiceType, setFormInvoiceType] = useState<1 | 2>(SALES_DESK_INVOICE_TYPE.sales);
  const [editing, setEditing] = useState<SalesDeskInvoiceDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskInvoiceDto | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<SalesDeskQuotePreviewData | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<SalesDeskInvoiceDto | null>(null);

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

  const allRows = useMemo(() => data?.data ?? [], [data?.data]);
  const rows = useMemo(() => filterInvoicesByType(allRows, typeFilter), [allRows, typeFilter]);
  const statsRows = statsData?.data ?? [];
  const salesCount = statsRows.filter((item) => resolveInvoiceType(item) === SALES_DESK_INVOICE_TYPE.sales).length;
  const purchaseCount = statsRows.filter((item) => resolveInvoiceType(item) === SALES_DESK_INVOICE_TYPE.purchase).length;
  const toIssueCount = rows.filter((item) => item.status === 5).length;
  const issuedCount = rows.filter((item) => item.status === 6).length;

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));

  const customerContacts = useMemo(() => {
    const map: Record<number, { email?: string | null; phone?: string | null }> = {};
    for (const customer of customers ?? []) {
      map[customer.id] = { email: customer.email, phone: customer.phone };
    }
    return map;
  }, [customers]);

  const handleTypeFilterChange = (next: SalesDeskInvoiceTypeFilter): void => {
    if (next === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ type: next });
  };

  const openCreateForm = (invoiceType: 1 | 2): void => {
    setEditing(null);
    setFormInvoiceType(invoiceType);
    setFormOpen(true);
  };

  const handleSubmit = async (values: InvoiceFormValues): Promise<void> => {
    const customerName =
      customerOptions.find((option) => option.value === String(values.customerId))?.label ?? 'Cari';

    if (editing) {
      await updateInvoice.mutateAsync({ id: editing.id, values, customerName });
      return;
    }
    await createInvoice.mutateAsync({
      values: {
        ...values,
        invoiceType: String(formInvoiceType) as InvoiceFormValues['invoiceType'],
      },
      lines: [],
      customerName,
    });
  };

  const openPreview = (payload: { data: SalesDeskQuotePreviewData; invoice: SalesDeskInvoiceDto }): void => {
    setPreviewData(payload.data);
    setPreviewInvoice(payload.invoice);
    setPreviewOpen(true);
  };

  const isPurchaseForm = formInvoiceType === SALES_DESK_INVOICE_TYPE.purchase;

  const invoiceFormFields = useMemo((): SalesDeskFormField<InvoiceFormValues>[] => {
    const baseFields: SalesDeskFormField<InvoiceFormValues>[] = [
      {
        name: 'invoiceType',
        label: 'Fatura Turu',
        type: 'select',
        options: [
          { value: '1', label: SALES_DESK_INVOICE_TYPE_LABELS[1] },
          { value: '2', label: SALES_DESK_INVOICE_TYPE_LABELS[2] },
        ],
        required: true,
      },
      { name: 'invoiceNumber', label: 'Fatura No', placeholder: 'Otomatik' },
      {
        name: 'customerId',
        label: isPurchaseForm ? 'Tedarikci / Cari' : 'Musteri / Cari',
        type: 'select',
        options: customerOptions,
        required: true,
      },
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
    ];

    if (isPurchaseForm) return baseFields;

    return [
      ...baseFields.slice(0, 3),
      { name: 'quoteId', label: 'Teklif ID', type: 'select', options: withNoneOption([], 'Yok') },
      ...baseFields.slice(3),
    ];
  }, [customerOptions, isPurchaseForm]);

  return (
    <>
      <div className="space-y-4">
      <SalesDeskInvoiceTypeTabs
        value={typeFilter}
        onChange={handleTypeFilterChange}
        counts={{
          all: statsData?.totalCount ?? allRows.length,
          sales: salesCount,
          purchase: purchaseCount,
        }}
      />

      <SalesDeskListLayout
        pageKey={`salesdesk-invoices-${typeFilter}`}
        title="Faturalar"
        subtitle="Satis ve alis faturalarini kaydedin; onizleme, PDF / Excel / Gmail / WhatsApp gonderimi"
        tableTitle={
          typeFilter === 'sales'
            ? 'Satis Fatura Listesi'
            : typeFilter === 'purchase'
              ? 'Alis Fatura Listesi'
              : 'Fatura Listesi'
        }
        actionLabel="Yeni Fatura Ekle"
        hideAddButton
        headerActions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              className={ADD_BUTTON_CLASS}
              onClick={() => navigate('/salesdesk/invoices/sales/new')}
            >
              <Plus size={18} className="mr-2 stroke-[3px]" />
              Satis Faturasi Ekle
            </Button>
            <Button
              variant="ghost"
              className={ADD_BUTTON_CLASS}
              onClick={() => navigate('/salesdesk/invoices/purchase/new')}
            >
              <ShoppingBag size={18} className="mr-2" />
              Alis Faturasi Ekle
            </Button>
          </div>
        }
        icon={<CreditCard size={22} />}
        metrics={[
          {
            label: typeFilter === 'purchase' ? 'Alis Faturasi' : typeFilter === 'sales' ? 'Satis Faturasi' : 'Toplam Fatura',
            value: rows.length,
          },
          { label: 'Kesilecek', value: toIssueCount, tone: 'yellow' },
          { label: 'Kesildi', value: issuedCount, tone: 'green' },
        ]}
        columns={[
          { key: 'invoiceType', header: 'TUR', render: (row) => <InvoiceTypeBadge type={resolveInvoiceType(row)} /> },
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
        totalCount={typeFilter === 'all' ? (data?.totalCount ?? 0) : rows.length}
        onPageChange={listPage.setPageNumber}
        onRefresh={() => {
          void salesDeskInvoicesApi.syncRemoteInvoices({ force: true }).finally(() => {
            void refetch();
          });
        }}
        onAdd={() => openCreateForm(SALES_DESK_INVOICE_TYPE.sales)}
        onEdit={(row) => {
          setEditing(row);
          setFormInvoiceType(resolveInvoiceType(row));
          setFormOpen(true);
        }}
        renderExtraActions={(row) => (
          <SalesDeskInvoiceShareActions
            invoice={row}
            contact={customerContacts[row.customerId] ?? null}
            onPreview={openPreview}
          />
        )}
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
            title={editing ? 'Faturayi Duzenle' : isPurchaseForm ? 'Yeni Alis Faturasi' : 'Yeni Satis Faturasi'}
            description={
              isPurchaseForm
                ? 'Alis faturasi baslik bilgilerini girin.'
                : 'Satis faturasi baslik bilgilerini girin.'
            }
            schema={invoiceFormSchema}
            defaultValues={toInvoiceFormValues(undefined, formInvoiceType)}
            entity={editing}
            mapEntityToForm={(entity) =>
              toInvoiceFormValues(entity as SalesDeskInvoiceDto, resolveInvoiceType(entity as SalesDeskInvoiceDto))
            }
            onSubmit={handleSubmit}
            isLoading={createInvoice.isPending || updateInvoice.isPending}
            fields={invoiceFormFields}
          />
        }
      />
      </div>

      <SalesDeskQuotePreviewDialog
        open={previewOpen}
        variant="invoice"
        data={previewData}
        invoice={previewInvoice}
        invoiceForExcel={previewInvoice}
        contact={previewInvoice ? customerContacts[previewInvoice.customerId] ?? null : null}
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewData(null);
            setPreviewInvoice(null);
          }
        }}
      />
    </>
  );
}
