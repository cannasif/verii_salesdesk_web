import { type ReactElement, useMemo, useState } from 'react';
import { Link2, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ManagementDataTableChrome } from '@/components/shared';
import type { SalesDeskProductCustomerDto, SalesDeskProductDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskKpiCards } from '../SalesDeskKpiCards';
import { salesDeskMetricsToKpiItems } from '../../lib/salesdesk-kpi-utils';
import { SalesDeskManagementTable } from '../SalesDeskManagementTable';
import type { SalesDeskColumn } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskProductCustomer,
  useDeleteSalesDeskProductCustomer,
  useSalesDeskCustomerOptions,
  useSalesDeskProductCustomerList,
  useSalesDeskProductList,
  useSalesDeskPotentialOptions,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { withNoneOption } from '../../lib/salesdesk-shared';
import {
  productCustomerFormSchema,
  toProductCustomerFormValues,
  toProductCustomerPayload,
  type ProductCustomerFormValues,
} from '../../types/salesdesk-schemas';
import {
  SD_PAGE_PULSE,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
} from '../../lib/salesdesk-popup-styles';
import {
  ADD_BUTTON_CLASS,
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME,
  MANAGEMENT_LIST_CARD_HEADER_CLASSNAME,
  MANAGEMENT_LIST_CARD_TITLE_CLASSNAME,
  MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME,
  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME,
} from '@/lib/management-list-layout';
import { cn } from '@/lib/utils';

const linkColumns: SalesDeskColumn<SalesDeskProductCustomerDto>[] = [
  {
    key: 'type',
    header: 'TIP',
    render: (row) => (row.customerId ? 'Cari' : 'Potansiyel'),
  },
  {
    key: 'name',
    header: 'AD',
    render: (row) => (
      <span className="font-semibold text-slate-100">
        {row.customerName || row.potentialCustomerName || '-'}
      </span>
    ),
  },
];

export function SalesDeskProductCustomersPage(): ReactElement {
  const productListPage = useSalesDeskListPage(20);
  const [selectedProduct, setSelectedProduct] = useState<SalesDeskProductDto | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<SalesDeskProductCustomerDto | null>(null);

  const productParams = useMemo(
    () => ({ ...productListPage.listParams, sortBy: 'Name', sortDirection: 'asc' }),
    [productListPage.listParams]
  );

  const { data: productData, isLoading: productsLoading, refetch: refetchProducts } =
    useSalesDeskProductList(productParams);
  const { data: linkData, isLoading: linksLoading, refetch: refetchLinks } = useSalesDeskProductCustomerList({
    pageNumber: 1,
    pageSize: 500,
  });
  const { data: customers } = useSalesDeskCustomerOptions();
  const { data: potentials } = useSalesDeskPotentialOptions();
  const createLink = useCreateSalesDeskProductCustomer();
  const deleteLink = useDeleteSalesDeskProductCustomer();

  const products = productData?.data ?? [];
  const allLinks = linkData?.data ?? [];
  const filteredLinks = selectedProduct
    ? allLinks.filter((link) => link.productId === selectedProduct.id)
    : [];

  const customerCount = filteredLinks.filter((link) => link.customerId).length;
  const potentialCount = filteredLinks.filter((link) => link.potentialCustomerId).length;

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));
  const potentialOptions = (potentials ?? []).map((item) => ({
    value: String(item.id),
    label: item.companyName,
  }));

  const handleLinkSubmit = async (values: ProductCustomerFormValues): Promise<void> => {
    await createLink.mutateAsync(toProductCustomerPayload(values));
  };

  return (
    <div className="relative w-full space-y-6">
      <div className="flex flex-col justify-between gap-6 pt-2 md:flex-row md:items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 transition-colors dark:text-white">
            Urun Bazli Musteriler
          </h1>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
            <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
            Urun secin; o urunle iliskili carileri ve potansiyel musterileri listeleyin
          </p>
        </div>
        <Button
          onClick={() => setLinkOpen(true)}
          disabled={!selectedProduct}
          variant="ghost"
          className={ADD_BUTTON_CLASS}
        >
          <Plus size={20} className="mr-2 stroke-[3px]" />
          Baglanti Ekle
        </Button>
      </div>

      <SalesDeskKpiCards
        isLoading={productsLoading}
        items={salesDeskMetricsToKpiItems([
          { label: 'Urun', value: productData?.totalCount ?? products.length },
          { label: 'Cari', value: customerCount, tone: 'green' },
          { label: 'Potansiyel', value: potentialCount, tone: 'violet' },
        ])}
      />

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
          <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
            <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>Stok Listesi</CardTitle>
            <div className="group/search relative w-full">
              <Search
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)] transition-colors group-focus-within/search:text-[var(--crm-brand-primary)]"
                aria-hidden
              />
              <input
                type="search"
                className={cn(
                  'h-9 w-full rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] py-0 pl-9 pr-3 text-sm text-slate-100 shadow-sm placeholder:text-[var(--crm-app-text-muted)]',
                  'focus:border-[var(--crm-brand-primary)] focus:outline-none focus:ring-[3px] focus:ring-[var(--crm-brand-ring)]'
                )}
                placeholder="Stok ara..."
                value={productListPage.searchTerm}
                onChange={(event) => productListPage.setSearchTerm(event.target.value)}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchProducts()}
              className={MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
          </CardHeader>
          <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
            <div className="max-h-[480px] overflow-y-auto rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-table-shell)]">
              {productsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-slate-400" />
                </div>
              ) : products.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-[var(--crm-app-text-muted)]">Urun bulunamadi.</p>
              ) : (
                products.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProduct(product)}
                    className={cn(
                      'block w-full border-b border-[var(--crm-app-border)] px-4 py-3 text-left text-sm transition last:border-b-0',
                      selectedProduct?.id === product.id
                        ? 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-on-soft)]'
                        : 'text-slate-300 hover:bg-[var(--crm-app-table-row-hover)]'
                    )}
                  >
                    <p className="font-semibold">{product.name}</p>
                    <p className="text-xs text-[var(--crm-app-text-muted)]">{product.code}</p>
                  </button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
          <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
            <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>Bagli Cariler</CardTitle>
            <p className="text-sm text-[var(--crm-app-text-muted)]">
              {selectedProduct
                ? `${selectedProduct.name}: ${customerCount} cari, ${potentialCount} potansiyel`
                : 'Sol taraftan bir urun secin.'}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => refetchLinks()}
              className={MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Baglantilari Yenile
            </Button>
          </CardHeader>
          <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
            <div className={MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME}>
              <ManagementDataTableChrome>
                <SalesDeskManagementTable
                  columns={linkColumns}
                  rows={selectedProduct ? filteredLinks : []}
                  isLoading={Boolean(selectedProduct) && linksLoading}
                  emptyText={selectedProduct ? 'Bagli kayit yok.' : 'Urun secilmedi.'}
                  minTableWidthClassName="min-w-[480px]"
                  onDelete={selectedProduct ? setDeletingLink : undefined}
                  pageSize={Math.max(filteredLinks.length, 10)}
                  pageSizeOptions={[10, 20, 50] as const}
                  onPageSizeChange={() => undefined}
                  pageNumber={1}
                  totalPages={1}
                  onPageChange={() => undefined}
                  totalCount={filteredLinks.length}
                />
              </ManagementDataTableChrome>
            </div>
          </CardContent>
        </Card>
      </div>

      {selectedProduct ? (
        <SalesDeskEntityForm
          open={linkOpen}
          onOpenChange={setLinkOpen}
          title="Urun-Cari Baglantisi"
          description="Urun ile cari veya potansiyel musteri arasinda baglanti olusturun."
          schema={productCustomerFormSchema}
          defaultValues={toProductCustomerFormValues(selectedProduct.id)}
          mapEntityToForm={() => toProductCustomerFormValues(selectedProduct.id)}
          onSubmit={handleLinkSubmit}
          isLoading={createLink.isPending}
          icon={Link2}
          fields={[
            {
              name: 'productId',
              label: 'Urun',
              type: 'select',
              options: [{ value: String(selectedProduct.id), label: selectedProduct.name }],
            },
            { name: 'customerId', label: 'Cari', type: 'select', options: withNoneOption(customerOptions) },
            {
              name: 'potentialCustomerId',
              label: 'Potansiyel',
              type: 'select',
              options: withNoneOption(potentialOptions),
            },
          ]}
        />
      ) : null}

      <AlertDialog open={deletingLink != null} onOpenChange={(open) => !open && setDeletingLink(null)}>
        <AlertDialogContent className={`w-[90%] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:w-full ${SD_SURFACE_DIALOG}`}>
          <AlertDialogHeader className="px-6 pb-4 pt-8 text-center sm:text-left">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Baglantiyi sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[var(--crm-app-text-muted)]">
              Bu urun-cari baglantisini silmek istediginize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-4">
            <AlertDialogCancel className={SD_SECONDARY_BUTTON}>Iptal</AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-500"
              onClick={async () => {
                if (!deletingLink) return;
                await deleteLink.mutateAsync(deletingLink.id);
                setDeletingLink(null);
              }}
              disabled={deleteLink.isPending}
            >
              {deleteLink.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
