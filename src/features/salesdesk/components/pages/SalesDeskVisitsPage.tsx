import { type ReactElement, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import type { SalesDeskVisitDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskVisit,
  useDeleteSalesDeskVisit,
  useSalesDeskCustomerOptions,
  useSalesDeskVisitList,
  useSalesDeskVisitStats,
  useUpdateSalesDeskVisit,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatDate, formatTime, withNoneOption } from '../../lib/salesdesk-shared';
import { VISIT_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  toVisitFormValues,
  visitFormSchema,
  type VisitFormValues,
} from '../../types/salesdesk-schemas';
import { VisitStatusBadge } from './salesdesk-badges';

const VISIT_TYPE_OPTIONS = [
  { value: 'Yuz Yuze', label: 'Yuz Yuze' },
  { value: 'Telefon', label: 'Telefon' },
  { value: 'Online', label: 'Online' },
];

export function SalesDeskVisitsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskVisitDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskVisitDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'VisitDate', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskVisitList(listParams);
  const { data: statsData } = useSalesDeskVisitStats();
  const { data: customers } = useSalesDeskCustomerOptions();
  const createVisit = useCreateSalesDeskVisit();
  const updateVisit = useUpdateSalesDeskVisit();
  const deleteVisit = useDeleteSalesDeskVisit();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const today = new Date().toISOString().slice(0, 10);
  const todayCount = statsRows.filter((item) => item.visitDate.slice(0, 10) === today).length;
  const plannedCount = statsRows.filter((item) => item.status === 1).length;
  const doneCount = statsRows.filter((item) => item.status === 2).length;

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );

  const handleSubmit = async (values: VisitFormValues): Promise<void> => {
    if (editing) {
      await updateVisit.mutateAsync({ id: editing.id, values });
      return;
    }
    await createVisit.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-visits"
      title="Haftalik Ziyaretler"
      subtitle="Planlanan ve tamamlanan musteri ziyaretleri"
      tableTitle="Ziyaret Listesi"
      actionLabel="Yeni Ziyaret Ekle"
      icon={<CalendarDays size={22} />}
      metrics={[
        { label: 'Bugun', value: todayCount, tone: 'cyan' },
        { label: 'Planlandi', value: plannedCount },
        { label: 'Yapildi', value: doneCount, tone: 'green' },
        { label: 'Toplam', value: statsData?.totalCount ?? 0 },
      ]}
      columns={[
        { key: 'visitDate', header: 'TARIH', render: (row) => formatDate(row.visitDate) },
        { key: 'visitTime', header: 'SAAT', render: (row) => formatTime(row.visitTime) },
        { key: 'title', header: 'BASLIK', render: (row) => row.title },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName || '-' },
        { key: 'visitType', header: 'TIP', render: (row) => row.visitType },
        { key: 'status', header: 'DURUM', render: (row) => <VisitStatusBadge status={row.status} /> },
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
        await deleteVisit.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteVisit.isPending}
      deleteLabel={(row) => row.title}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Ziyareti Duzenle' : 'Yeni Ziyaret'}
          description="Ziyaret planlama bilgilerini girin."
          schema={visitFormSchema}
          defaultValues={toVisitFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toVisitFormValues(entity as SalesDeskVisitDto)}
          onSubmit={handleSubmit}
          isLoading={createVisit.isPending || updateVisit.isPending}
          validateMode="onSubmit"
          fields={[
            { name: 'visitDate', label: 'Tarih', type: 'date', required: true },
            { name: 'visitTime', label: 'Saat', type: 'time' },
            { name: 'title', label: 'Baslik', required: true, colSpan: 2 },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
            { name: 'visitType', label: 'Ziyaret Tipi', type: 'select', options: VISIT_TYPE_OPTIONS, required: true },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(VISIT_STATUS_LABELS),
              required: true,
            },
            { name: 'notes', label: 'Notlar', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
