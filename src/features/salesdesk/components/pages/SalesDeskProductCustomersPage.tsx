import { type ReactElement, useMemo, useState } from 'react';
import { Link2, Loader2, Plus, RefreshCw, Search, Trash2, UsersRound } from 'lucide-react';
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
import type { SalesDeskProductCustomerDto, SalesDeskProductDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import {
  useCreateSalesDeskProductCustomer,
  useDeleteSalesDeskProductCustomer,
  useSalesDeskCustomerOptions,
  useSalesDeskProductCustomerList,
  useSalesDeskProductList,
  useSalesDeskPotentialOptions,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { surfaceClass, withNoneOption } from '../../lib/salesdesk-shared';
import {
  productCustomerFormSchema,
  toProductCustomerFormValues,
  toProductCustomerPayload,
  type ProductCustomerFormValues,
} from '../../types/salesdesk-schemas';

export function SalesDeskProductCustomersPage(): ReactElement {
  const productListPage = useSalesDeskListPage(20);
  const [selectedProduct, setSelectedProduct] = useState<SalesDeskProductDto | null>(null);
  const [linkOpen, setLinkOpen] = useState(false);
  const [deletingLink, setDeletingLink] = useState<SalesDeskProductCustomerDto | null>(null);

  const productParams = useMemo(
    () => ({ ...productListPage.listParams, sortBy: 'Name', sortDirection: 'asc' }),
    [productListPage.listParams]
  );

  const { data: productData, isLoading: productsLoading, refetch: refetchProducts } = useSalesDeskProductList(productParams);
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
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/15 text-cyan-300">
            <Link2 size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-7 w-1 rounded-full bg-violet-500 shadow-[0_0_24px_rgba(139,92,246,.7)]" />
              <h1 className="text-2xl font-semibold text-slate-50">Urun Bazli Musteriler</h1>
            </div>
            <p className="mt-1 text-sm text-slate-400">
              Urun secin; o urunle iliskili carileri ve potansiyel musterileri listeleyin
            </p>
          </div>
        </div>
        <button
          type="button"
          disabled={!selectedProduct}
          onClick={() => setLinkOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-400 disabled:opacity-50"
        >
          <Plus size={16} />
          Baglanti Ekle
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Urun', value: productData?.totalCount ?? products.length },
          { label: 'Cari', value: customerCount, tone: 'text-emerald-300' },
          { label: 'Potansiyel', value: potentialCount, tone: 'text-pink-300' },
        ].map((metric) => (
          <div key={metric.label} className={`min-h-[100px] rounded-xl p-5 ${surfaceClass}`}>
            <p className="text-xs font-semibold uppercase text-slate-500">{metric.label}</p>
            <p className={`mt-3 text-3xl font-semibold ${metric.tone ?? 'text-blue-300'}`}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <section className={`rounded-xl p-4 ${surfaceClass}`}>
          <h2 className="text-lg font-semibold">Stok Listesi</h2>
          <div className="relative mt-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              className="h-10 w-full rounded-lg border border-white/10 bg-[#050711]/80 pl-10 pr-3 text-sm text-slate-200 outline-none"
              placeholder="Stok ara..."
              value={productListPage.searchTerm}
              onChange={(event) => productListPage.setSearchTerm(event.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => refetchProducts()}
            className="mt-2 inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200"
          >
            <RefreshCw size={14} />
            Yenile
          </button>
          <div className="mt-3 max-h-[480px] overflow-y-auto rounded-lg border border-white/10">
            {productsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="animate-spin text-slate-400" />
              </div>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className={`block w-full border-b border-white/10 px-4 py-3 text-left text-sm transition hover:bg-white/[.04] ${
                    selectedProduct?.id === product.id ? 'bg-violet-500/15 text-violet-100' : 'text-slate-300'
                  }`}
                >
                  <p className="font-semibold">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.code}</p>
                </button>
              ))
            )}
          </div>
        </section>

        <section className={`rounded-xl p-4 ${surfaceClass}`}>
          <div className="flex items-center gap-2">
            <UsersRound size={18} className="text-violet-300" />
            <h2 className="text-lg font-semibold">Bagli Cariler</h2>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            {selectedProduct
              ? `${selectedProduct.name}: ${customerCount} cari, ${potentialCount} potansiyel`
              : 'Sol taraftan bir urun secin.'}
          </p>
          <div className="mt-4 overflow-hidden rounded-xl border border-white/10 bg-[#070a13]/72">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-white/10 bg-white/[.025] text-xs uppercase text-slate-300">
                <tr>
                  {['TIP', 'AD', 'ISLEM'].map((column) => (
                    <th key={column} className="px-4 py-3 font-semibold">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!selectedProduct ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      Urun secilmedi.
                    </td>
                  </tr>
                ) : linksLoading ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center">
                      <Loader2 className="mx-auto animate-spin text-slate-400" />
                    </td>
                  </tr>
                ) : filteredLinks.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-slate-400">
                      Bagli kayit yok.
                    </td>
                  </tr>
                ) : (
                  filteredLinks.map((link) => (
                    <tr key={link.id} className="border-b border-white/10 text-slate-300">
                      <td className="px-4 py-3">{link.customerId ? 'Cari' : 'Potansiyel'}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {link.customerName || link.potentialCustomerName || '-'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-slate-500 hover:text-rose-300"
                          onClick={() => setDeletingLink(link)}
                          aria-label="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <button
            type="button"
            onClick={() => refetchLinks()}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-200"
          >
            <RefreshCw size={14} />
            Baglantilari Yenile
          </button>
        </section>
      </div>

      {selectedProduct && (
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
      )}

      <AlertDialog open={deletingLink != null} onOpenChange={(open) => !open && setDeletingLink(null)}>
        <AlertDialogContent className="border border-white/10 bg-[#0a0f1e] text-slate-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Baglantiyi sil</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              Bu urun-cari baglantisini silmek istediginize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-transparent text-slate-200">Iptal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-600 hover:bg-rose-500"
              onClick={async () => {
                if (!deletingLink) return;
                await deleteLink.mutateAsync(deletingLink.id);
                setDeletingLink(null);
              }}
            >
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
