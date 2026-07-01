import { type ReactElement, useMemo, useState } from 'react';
import type { SalesDeskPotentialCustomerDto } from '../api/salesdesk-api';
import { SalesDeskListLayout } from './SalesDeskListLayout';
import { SalesDeskPotentialForm } from './SalesDeskPotentialForm';
import {
  useCreateSalesDeskPotential,
  useDeleteSalesDeskPotential,
  useSalesDeskPotentialList,
  useSalesDeskPotentialStats,
  useUpdateSalesDeskPotential,
} from '../hooks/useSalesDeskPotentials';
import { useSalesDeskListPage } from '../hooks/useSalesDeskListPage';
import type { SalesDeskPotentialFormValues } from '../types/potential-types';
import { PotentialStatusBadge } from './pages/salesdesk-badges';

export function SalesDeskPotentialsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editingPotential, setEditingPotential] = useState<SalesDeskPotentialCustomerDto | null>(null);
  const [deletingPotential, setDeletingPotential] = useState<SalesDeskPotentialCustomerDto | null>(null);

  const listParams = useMemo(
    () => ({
      ...listPage.listParams,
      sortBy: 'CompanyName',
      sortDirection: 'asc',
    }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskPotentialList(listParams);
  const { data: statsData } = useSalesDeskPotentialStats();
  const createPotential = useCreateSalesDeskPotential();
  const updatePotential = useUpdateSalesDeskPotential();
  const deletePotential = useDeleteSalesDeskPotential();

  const potentials = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const totalPotentialCount = statsData?.totalCount ?? data?.totalCount ?? 0;
  const waitingCount = statsRows.filter((item) => item.status === 1).length;
  const strongCount = statsRows.filter((item) => item.status === 4).length;

  const handleFormSubmit = async (values: SalesDeskPotentialFormValues): Promise<void> => {
    if (editingPotential) {
      await updatePotential.mutateAsync({ id: editingPotential.id, values });
      return;
    }
    await createPotential.mutateAsync(values);
  };

  const isSaving = createPotential.isPending || updatePotential.isPending;

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-potentials"
      title="Potansiyel Cariler"
      subtitle="Gelismis filtre, sutun tercihi ve sayfalama ile potansiyel cari listesi"
      tableTitle="Potansiyel Cari Listesi"
      actionLabel="Potansiyel Ekle"
      metrics={[
        { label: 'Toplam Potansiyel', value: totalPotentialCount },
        { label: 'Bekleyen', value: waitingCount, tone: 'yellow' },
        { label: 'Guclu Aday', value: strongCount, tone: 'green' },
      ]}
      columns={[
        { key: 'code', header: 'KOD', render: (row) => row.code },
        {
          key: 'companyName',
          header: 'CARI ADI',
          render: (row) => <span className="font-semibold text-slate-100">{row.companyName}</span>,
        },
        { key: 'contactName', header: 'YETKILI', render: (row) => row.contactName || '-' },
        { key: 'phone', header: 'TELEFON', render: (row) => row.phone || '-' },
        { key: 'email', header: 'E-POSTA', render: (row) => row.email || '-' },
        {
          key: 'status',
          header: 'DURUM',
          render: (row) => <PotentialStatusBadge status={row.status} />,
        },
        { key: 'city', header: 'IL', render: (row) => row.city || '-' },
        { key: 'district', header: 'ILCE', render: (row) => row.district || '-' },
      ]}
      rows={potentials}
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
        setEditingPotential(null);
        setFormOpen(true);
      }}
      onEdit={(row) => {
        setEditingPotential(row);
        setFormOpen(true);
      }}
      onDeleteRequest={setDeletingPotential}
      deletingRow={deletingPotential}
      onDeleteConfirm={async () => {
        if (!deletingPotential) return;
        await deletePotential.mutateAsync(deletingPotential.id);
        setDeletingPotential(null);
      }}
      onDeleteCancel={() => setDeletingPotential(null)}
      isDeleting={deletePotential.isPending}
      deleteLabel={(row) => row.companyName}
      formDialog={
        <SalesDeskPotentialForm
          open={formOpen}
          onOpenChange={setFormOpen}
          onSubmit={handleFormSubmit}
          potential={editingPotential}
          isLoading={isSaving}
        />
      }
    />
  );
}
