import { type ReactElement, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { SalesDeskSoftwareResearchDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskSoftwareResearch,
  useDeleteSalesDeskSoftwareResearch,
  useSalesDeskPotentialOptions,
  useSalesDeskSoftwareResearchList,
  useSalesDeskSoftwareResearchStats,
  useUpdateSalesDeskSoftwareResearch,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatDate, withNoneOption } from '../../lib/salesdesk-shared';
import { POTENTIAL_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  softwareResearchFormSchema,
  toSoftwareResearchFormValues,
  type SoftwareResearchFormValues,
} from '../../types/salesdesk-schemas';
import { PotentialStatusBadge } from './salesdesk-badges';

export function SalesDeskSoftwareResearchPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskSoftwareResearchDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskSoftwareResearchDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'ResearchedAt', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskSoftwareResearchList(listParams);
  const { data: statsData } = useSalesDeskSoftwareResearchStats();
  const { data: potentials } = useSalesDeskPotentialOptions();
  const createResearch = useCreateSalesDeskSoftwareResearch();
  const updateResearch = useUpdateSalesDeskSoftwareResearch();
  const deleteResearch = useDeleteSalesDeskSoftwareResearch();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];

  const potentialOptions = withNoneOption(
    (potentials ?? []).map((item) => ({ value: String(item.id), label: item.companyName }))
  );

  const handleSubmit = async (values: SoftwareResearchFormValues): Promise<void> => {
    if (editing) {
      await updateResearch.mutateAsync({ id: editing.id, values });
      return;
    }
    await createResearch.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-software-research"
      title="Yazilim Arastirma"
      subtitle="Potansiyel cariler icin yazilim kullanim arastirmasi"
      tableTitle="Arastirma Sonuclari"
      actionLabel="Yeni Arastirma"
      icon={<Search size={22} />}
      metrics={[
        { label: 'Toplam', value: statsData?.totalCount ?? 0 },
        { label: 'Bekleyen', value: statsRows.filter((item) => item.status === 1).length },
        { label: 'Bulunan', value: statsRows.filter((item) => item.status === 2).length, tone: 'green' },
        { label: 'Guclu', value: statsRows.filter((item) => item.status === 4).length, tone: 'yellow' },
      ]}
      columns={[
        { key: 'provider', header: 'SAGLAYICI', render: (row) => row.provider },
        { key: 'potential', header: 'FIRMA', render: (row) => row.potentialCustomerName || '-' },
        { key: 'status', header: 'DURUM', render: (row) => <PotentialStatusBadge status={row.status} /> },
        { key: 'score', header: 'SKOR', render: (row) => row.score },
        { key: 'host', header: 'HOST', render: (row) => row.host || '-' },
        { key: 'researchedAt', header: 'TARIH', render: (row) => formatDate(row.researchedAt) },
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
        await deleteResearch.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteResearch.isPending}
      deleteLabel={(row) => row.provider}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Arastirmayi Duzenle' : 'Yeni Arastirma'}
          description="Yazilim arastirma kaydi olusturun."
          schema={softwareResearchFormSchema}
          defaultValues={toSoftwareResearchFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toSoftwareResearchFormValues(entity as SalesDeskSoftwareResearchDto)}
          onSubmit={handleSubmit}
          isLoading={createResearch.isPending || updateResearch.isPending}
          fields={[
            { name: 'provider', label: 'Saglayici', required: true },
            { name: 'potentialCustomerId', label: 'Potansiyel Cari', type: 'select', options: potentialOptions },
            { name: 'keywords', label: 'Anahtar Kelimeler', colSpan: 2 },
            { name: 'host', label: 'Host' },
            { name: 'sourceUrl', label: 'Kaynak URL' },
            { name: 'score', label: 'Skor', type: 'number', min: 0, max: 100 },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(POTENTIAL_STATUS_LABELS),
              required: true,
            },
          ]}
        />
      }
    />
  );
}
