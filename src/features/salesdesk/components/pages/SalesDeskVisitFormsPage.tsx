import { type ReactElement, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import type { SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskVisitForm,
  useDeleteSalesDeskVisitForm,
  useSalesDeskCustomerOptions,
  useSalesDeskVisitFormList,
  useSalesDeskVisitFormStats,
  useUpdateSalesDeskVisitForm,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { formatDate, withNoneOption } from '../../lib/salesdesk-shared';
import {
  toVisitFormRecordValues,
  visitFormRecordSchema,
  type VisitFormRecordValues,
} from '../../types/salesdesk-schemas';

export function SalesDeskVisitFormsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskVisitFormDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskVisitFormDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'FormDate', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskVisitFormList(listParams);
  const { data: statsData } = useSalesDeskVisitFormStats();
  const { data: customers } = useSalesDeskCustomerOptions();
  const createForm = useCreateSalesDeskVisitForm();
  const updateForm = useUpdateSalesDeskVisitForm();
  const deleteForm = useDeleteSalesDeskVisitForm();

  const rows = data?.data ?? [];
  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );

  const handleSubmit = async (values: VisitFormRecordValues): Promise<void> => {
    if (editing) {
      await updateForm.mutateAsync({ id: editing.id, values });
      return;
    }
    await createForm.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      title="Ziyaret Formu"
      subtitle="Cari ziyaretlerini kayit altina alin"
      tableTitle="Ziyaret Formlari"
      actionLabel="Yeni Ziyaret Formu"
      icon={<ClipboardList size={22} />}
      metrics={[{ label: 'Toplam Form', value: statsData?.totalCount ?? 0 }]}
      columns={[
        { key: 'title', header: 'BASLIK', render: (row) => row.title },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName || '-' },
        { key: 'formDate', header: 'TARIH', render: (row) => formatDate(row.formDate) },
        {
          key: 'content',
          header: 'ICERIK',
          render: (row) => (row.content ? `${row.content.slice(0, 60)}...` : '-'),
        },
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
        await deleteForm.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteForm.isPending}
      deleteLabel={(row) => row.title}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Formu Duzenle' : 'Yeni Ziyaret Formu'}
          description="Ziyaret formu bilgilerini girin."
          schema={visitFormRecordSchema}
          defaultValues={toVisitFormRecordValues()}
          entity={editing}
          mapEntityToForm={(entity) => toVisitFormRecordValues(entity as SalesDeskVisitFormDto)}
          onSubmit={handleSubmit}
          isLoading={createForm.isPending || updateForm.isPending}
          fields={[
            { name: 'title', label: 'Baslik', required: true, colSpan: 2 },
            { name: 'formDate', label: 'Form Tarihi', type: 'date', required: true },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
            { name: 'visitId', label: 'Ziyaret ID', placeholder: 'Opsiyonel' },
            { name: 'content', label: 'Icerik', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
