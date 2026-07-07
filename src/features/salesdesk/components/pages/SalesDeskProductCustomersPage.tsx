import { type ReactElement, useMemo, useState } from 'react';
import { Link2, Loader2, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
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
  SD_BRAND_PRIMARY,
  SD_PAGE_ADD_BUTTON,
  SD_PAGE_HEADER_ROW,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
  SD_SEARCH_FOCUS,
} from '../../lib/salesdesk-popup-styles';
import {
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
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="space-y-1">
          <h1 className={SD_PAGE_TITLE}>Urun Bazli Musteriler</h1>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
            <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
            Urun secin; o urunle iliskili carileri ve potansiyel musterileri listeleyin
          </p>
        </div>
        <Button
          onClick={() => setLinkOpen(true)}
          disabled={!selectedProduct}
          variant="ghost"
          className={cn(SD_PAGE_ADD_BUTTON, !selectedProduct && 'opacity-60')}
        >
          <Plus size={20} className="mr-2 stroke-[3px]" />
          Baglanti Ekle
        </Button>
      </div>

      {selectedProduct ? (
        <div className="sticky top-0 z-20 flex items-center justify-between gap-3 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3 shadow-sm backdrop-blur-md lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--crm-app-text-muted)]">
              Secili urun
            </p>
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{selectedProduct.name}</p>
            <p className="text-xs text-[var(--crm-app-text-muted)]">
              {customerCount} cari · {potentialCount} potansiyel
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setLinkOpen(true)}
            className={cn(SD_BRAND_PRIMARY, 'h-11 shrink-0 px-4 text-sm font-semibold')}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Ekle
          </Button>
        </div>
      ) : null}

      <SalesDeskKpiCards
        isLoading={productsLoading}
        items={salesDeskMetricsToKpiItems([
          { label: 'Urun', value: productData?.totalCount ?? products.length },
          { label: 'Cari', value: customerCount, tone: 'green' },
          { label: 'Potansiyel', value: potentialCount, tone: 'violet' },
        ])}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_1fr]">
        <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
          <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
            <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>Stok Listesi</CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="group/search relative min-w-0 flex-1">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)] transition-colors group-focus-within/search:text-[var(--crm-brand-primary)]"
                  aria-hidden
                />
                <input
                  type="search"
                  className={cn(
                    'h-11 w-full rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] py-0 pl-9 pr-3 text-sm text-slate-100 shadow-sm placeholder:text-[var(--crm-app-text-muted)]',
                    'focus:outline-none',
                    SD_SEARCH_FOCUS
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
                className={cn(MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME, 'h-11 shrink-0 sm:w-auto')}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Yenile
              </Button>
            </div>
          </CardHeader>
          <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
            <div className="max-h-[min(480px,50vh)] overflow-y-auto rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-table-shell)] lg:max-h-[480px]">
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
                      'block w-full min-h-[44px] border-b border-[var(--crm-app-border)] px-4 py-3.5 text-left text-sm transition last:border-b-0',
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
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 space-y-1">
                <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>Bagli Cariler</CardTitle>
                <p className="text-sm text-[var(--crm-app-text-muted)]">
                  {selectedProduct
                    ? `${selectedProduct.name}: ${customerCount} cari, ${potentialCount} potansiyel`
                    : 'Once bir urun secin (mobilde yukaridaki listeden).'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => refetchLinks()}
                className={cn(MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME, 'h-11 shrink-0 sm:w-auto')}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Baglantilari Yenile
              </Button>
            </div>
          </CardHeader>
          <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
            <div className={MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME}>
              <ManagementDataTableChrome>
                <SalesDeskManagementTable
                  columns={linkColumns}
                  rows={selectedProduct ? filteredLinks : []}
                  isLoading={Boolean(selectedProduct) && linksLoading}
                  emptyText={selectedProduct ? 'Bagli kayit yok.' : 'Baglanti gormek icin once urun secin.'}
                  minTableWidthClassName="min-w-0 md:min-w-[480px]"
                  mobilePrimaryKey="name"
                  mobileDetailKeys={['type']}
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
            { name: 'customerId', label: 'Cari', type: 'select', options: withNoneOption(customerOptions), colSpan: 2 },
            {
              name: 'potentialCustomerId',
              label: 'Potansiyel',
              type: 'select',
              options: withNoneOption(potentialOptions),
            },
          ]}
        />
      ) : null}

      <SalesDeskDeleteDialog
        open={deletingLink != null}
        onOpenChange={(open) => !open && setDeletingLink(null)}
        title="Baglantiyi sil"
        description="Bu urun-cari baglantisini silmek istediginize emin misiniz? Bu islem geri alinamaz."
        onConfirm={async () => {
          if (!deletingLink) return;
          await deleteLink.mutateAsync(deletingLink.id);
          setDeletingLink(null);
        }}
        isDeleting={deleteLink.isPending}
      />
    </div>
  );
}
