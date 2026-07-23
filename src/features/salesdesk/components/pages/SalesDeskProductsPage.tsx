import { type ReactElement, useMemo, useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { SalesDeskProductDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskProduct,
  useDeleteSalesDeskProduct,
  useSalesDeskProductList,
  useSalesDeskProductStats,
  useUpdateSalesDeskProduct,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { formatMoney } from '../../lib/salesdesk-shared';
import {
  productFormSchema,
  toProductFormValues,
  type ProductFormValues,
} from '../../types/salesdesk-schemas';

export function SalesDeskProductsPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskProductDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskProductDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'Name', sortDirection: 'asc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskProductList(listParams);
  const { data: statsData } = useSalesDeskProductStats();
  const createProduct = useCreateSalesDeskProduct();
  const updateProduct = useUpdateSalesDeskProduct();
  const deleteProduct = useDeleteSalesDeskProduct();

  const rows = data?.data ?? [];

  const handleSubmit = async (values: ProductFormValues): Promise<void> => {
    if (editing) {
      await updateProduct.mutateAsync({ id: editing.id, values });
      return;
    }
    await createProduct.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-products"
      title="Stok / Urunler"
      subtitle="Gelismis filtre, sutun tercihi ve sayfalama ile urun listesi"
      tableTitle="Urun Listesi"
      actionLabel="Yeni Urun Ekle"
      icon={<ShoppingCart size={22} />}
      metrics={[
        { label: 'Toplam Urun', value: statsData?.totalCount ?? data?.totalCount ?? 0 },
        { label: 'Listelenen', value: rows.length },
      ]}
      columns={[
        { key: 'code', header: 'KOD', render: (row) => row.code },
        { key: 'name', header: 'URUN', render: (row) => <span className="font-semibold text-slate-100">{row.name}</span> },
        { key: 'category', header: 'KATEGORI', render: (row) => row.category || '-' },
        { key: 'unit', header: 'BIRIM', render: (row) => row.unit },
        { key: 'salesPrice', header: 'SATIS FIYATI', render: (row) => formatMoney(row.salesPrice) },
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
        await deleteProduct.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteProduct.isPending}
      deleteTitle="Urunu sil"
      deleteLabel={(row) => row.name}
      mobilePrimaryKey="name"
      mobileDetailKeys={['code', 'category', 'unit', 'salesPrice']}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Urunu Duzenle' : 'Yeni Urun'}
          description="Stok karti bilgilerini girin."
          schema={productFormSchema}
          defaultValues={toProductFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toProductFormValues(entity as SalesDeskProductDto)}
          onSubmit={handleSubmit}
          isLoading={createProduct.isPending || updateProduct.isPending}
          fields={[
            { name: 'code', label: 'Kod', placeholder: 'STK001' },
            { name: 'name', label: 'Urun Adi', required: true, colSpan: 2 },
            { name: 'category', label: 'Kategori' },
            { name: 'unit', label: 'Birim', required: true },
            { name: 'salesPrice', label: 'Satis Fiyati', type: 'number', min: 0, step: 0.01 },
          ]}
        />
      }
    />
  );
}
