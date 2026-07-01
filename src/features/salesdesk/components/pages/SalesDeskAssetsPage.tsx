import { type ReactElement, useMemo, useState } from 'react';
import { Package } from 'lucide-react';
import type { SalesDeskFixedAssetDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskAsset,
  useDeleteSalesDeskAsset,
  useSalesDeskAssetList,
  useSalesDeskAssetStats,
  useUpdateSalesDeskAsset,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatDate, formatMoney } from '../../lib/salesdesk-shared';
import { ASSET_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  assetFormSchema,
  toAssetFormValues,
  type AssetFormValues,
} from '../../types/salesdesk-schemas';
import { AssetStatusBadge } from './salesdesk-badges';

export function SalesDeskAssetsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskFixedAssetDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskFixedAssetDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'Name', sortDirection: 'asc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskAssetList(listParams);
  const { data: statsData } = useSalesDeskAssetStats();
  const createAsset = useCreateSalesDeskAsset();
  const updateAsset = useUpdateSalesDeskAsset();
  const deleteAsset = useDeleteSalesDeskAsset();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];

  const handleSubmit = async (values: AssetFormValues): Promise<void> => {
    if (editing) {
      await updateAsset.mutateAsync({ id: editing.id, values });
      return;
    }
    await createAsset.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      title="Demirbaslar"
      subtitle="Sirket uzerine kayitli sabit kiymetler ve alim kayitlari"
      tableTitle="Demirbas Listesi"
      actionLabel="Yeni Demirbas Ekle"
      icon={<Package size={22} />}
      metrics={[
        { label: 'Toplam', value: statsData?.totalCount ?? 0 },
        { label: 'Aktif', value: statsRows.filter((item) => item.status === 1).length, tone: 'green' },
        { label: 'Bakimda', value: statsRows.filter((item) => item.status === 2).length, tone: 'yellow' },
        { label: 'Hurda', value: statsRows.filter((item) => item.status === 3).length, tone: 'red' },
      ]}
      columns={[
        { key: 'code', header: 'KOD', render: (row) => row.code },
        { key: 'name', header: 'AD', render: (row) => row.name },
        { key: 'category', header: 'KATEGORI', render: (row) => row.category || '-' },
        { key: 'purchaseDate', header: 'ALIS TARIHI', render: (row) => formatDate(row.purchaseDate) },
        { key: 'value', header: 'DEGER', render: (row) => formatMoney(row.value) },
        { key: 'status', header: 'DURUM', render: (row) => <AssetStatusBadge status={row.status} /> },
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
        await deleteAsset.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteAsset.isPending}
      deleteLabel={(row) => row.name}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Demirbasi Duzenle' : 'Yeni Demirbas'}
          description="Demirbas bilgilerini girin."
          schema={assetFormSchema}
          defaultValues={toAssetFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toAssetFormValues(entity as SalesDeskFixedAssetDto)}
          onSubmit={handleSubmit}
          isLoading={createAsset.isPending || updateAsset.isPending}
          fields={[
            { name: 'code', label: 'Kod', required: true },
            { name: 'name', label: 'Ad', required: true },
            { name: 'category', label: 'Kategori' },
            { name: 'purchaseDate', label: 'Alis Tarihi', type: 'date', required: true },
            { name: 'value', label: 'Deger', type: 'number', min: 0 },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(ASSET_STATUS_LABELS),
              required: true,
            },
          ]}
        />
      }
    />
  );
}
