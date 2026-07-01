import { type ReactElement, useMemo, useState } from 'react';
import { Wallet } from 'lucide-react';
import type { SalesDeskRecurringPaymentDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskRecurringPayment,
  useDeleteSalesDeskRecurringPayment,
  useSalesDeskCustomerOptions,
  useSalesDeskRecurringPaymentList,
  useSalesDeskRecurringPaymentStats,
  useUpdateSalesDeskRecurringPayment,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatMoney, withNoneOption } from '../../lib/salesdesk-shared';
import { PAYMENT_TYPE_LABELS } from '../../lib/salesdesk-labels';
import {
  recurringPaymentFormSchema,
  toRecurringPaymentFormValues,
  type RecurringPaymentFormValues,
} from '../../types/salesdesk-schemas';
import { ActiveBadge, PaymentTypeBadge } from './salesdesk-badges';

export function SalesDeskPaymentsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskRecurringPaymentDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskRecurringPaymentDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'Name', sortDirection: 'asc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskRecurringPaymentList(listParams);
  const { data: statsData } = useSalesDeskRecurringPaymentStats();
  const { data: customers } = useSalesDeskCustomerOptions();
  const createPayment = useCreateSalesDeskRecurringPayment();
  const updatePayment = useUpdateSalesDeskRecurringPayment();
  const deletePayment = useDeleteSalesDeskRecurringPayment();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const expenseTotal = statsRows.filter((item) => item.type === 1 && item.isActive).reduce((sum, item) => sum + item.amount, 0);
  const incomeTotal = statsRows.filter((item) => item.type === 2 && item.isActive).reduce((sum, item) => sum + item.amount, 0);

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );

  const handleSubmit = async (values: RecurringPaymentFormValues): Promise<void> => {
    if (editing) {
      await updatePayment.mutateAsync({ id: editing.id, values });
      return;
    }
    await createPayment.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      title="Standart Odemeler & Gelirler"
      subtitle="Aylik sabit gider ve gelir kalemlerini planlayin"
      tableTitle="Kalem Listesi"
      actionLabel="Yeni Kalem Ekle"
      icon={<Wallet size={22} />}
      metrics={[
        { label: 'Aylik Giderler', value: formatMoney(expenseTotal), tone: 'red' },
        { label: 'Aylik Gelirler', value: formatMoney(incomeTotal), tone: 'green' },
        { label: 'Net Aylik', value: formatMoney(incomeTotal - expenseTotal), tone: incomeTotal >= expenseTotal ? 'green' : 'red' },
        { label: 'Toplam Kalem', value: statsData?.totalCount ?? 0 },
      ]}
      columns={[
        { key: 'name', header: 'AD', render: (row) => row.name },
        { key: 'type', header: 'TIP', render: (row) => <PaymentTypeBadge type={row.type} /> },
        { key: 'category', header: 'KATEGORI', render: (row) => row.category || '-' },
        { key: 'dayOfMonth', header: 'GUN', render: (row) => row.dayOfMonth },
        { key: 'amount', header: 'TUTAR', render: (row) => formatMoney(row.amount) },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName || '-' },
        { key: 'active', header: 'AKTIF', render: (row) => <ActiveBadge isActive={row.isActive} /> },
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
        await deletePayment.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deletePayment.isPending}
      deleteLabel={(row) => row.name}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Kalemi Duzenle' : 'Yeni Kalem'}
          description="Standart odeme veya gelir kalemi bilgilerini girin."
          schema={recurringPaymentFormSchema}
          defaultValues={toRecurringPaymentFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toRecurringPaymentFormValues(entity as SalesDeskRecurringPaymentDto)}
          onSubmit={handleSubmit}
          isLoading={createPayment.isPending || updatePayment.isPending}
          fields={[
            { name: 'name', label: 'Ad', required: true, colSpan: 2 },
            { name: 'type', label: 'Tip', type: 'select', options: enumToSelectOptions(PAYMENT_TYPE_LABELS), required: true },
            { name: 'category', label: 'Kategori' },
            { name: 'dayOfMonth', label: 'Ay Gunu', type: 'number', min: 1, max: 31 },
            { name: 'amount', label: 'Tutar', type: 'number', min: 0 },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
            { name: 'isActive', label: 'Aktif', type: 'checkbox' },
          ]}
        />
      }
    />
  );
}
