import { type ReactElement, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Calculator, Eye, FileText, Layers, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useCreateSalesDeskQuote,
  useSalesDeskCustomerOptions,
  useSalesDeskProductOptions,
} from '../../hooks/useSalesDeskModules';
import {
  quoteFormSchema,
  toQuoteFormValues,
  type QuoteFormValues,
} from '../../types/salesdesk-schemas';
import {
  invoiceLinesToPayload,
  type InvoiceLineFormState,
} from '../../types/invoice-create-types';
import {
  SD_CREATE_ACTION_BAR_CLASSNAME,
  SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME,
  SD_CREATE_MAIN_GRID_CLASSNAME,
  SD_CREATE_PAGE_CONTAINER_CLASSNAME,
  SD_CREATE_SECTION_BADGE_CLASSNAME,
  SD_CREATE_SECTION_BADGE_SUMMARY_CLASSNAME,
  SD_CREATE_SECTION_BODY_CLASSNAME,
  SD_CREATE_SECTION_CARD_CLASSNAME,
  SD_CREATE_SECTION_HEADER_CLASSNAME,
  SD_CREATE_SECTION_TITLE_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import {
  SD_DOCUMENT_BUTTON_BASE,
  SD_DOCUMENT_BUTTON_PREVIEW,
  SD_DOCUMENT_BUTTON_SAVE,
} from '../../lib/salesdesk-document-button-styles';
import { SalesDeskDocumentCreatePageHeader } from '../invoices/SalesDeskDocumentCreatePageHeader';
import { SalesDeskDocumentLineTable } from '../invoices/SalesDeskDocumentLineTable';
import { SalesDeskDocumentSummaryCard } from '../invoices/SalesDeskDocumentSummaryCard';
import { SalesDeskQuoteHeaderForm } from './SalesDeskQuoteHeaderForm';
import { cn } from '@/lib/utils';

export function SalesDeskQuoteCreateForm(): ReactElement {
  const navigate = useNavigate();
  const createQuote = useCreateSalesDeskQuote();
  const {
    data: customers,
    isPending: customersPending,
    isError: customersError,
    error: customersFetchError,
  } = useSalesDeskCustomerOptions();
  const {
    data: products,
    isPending: productsPending,
    isError: productsError,
    error: productsFetchError,
  } = useSalesDeskProductOptions();
  const [lines, setLines] = useState<InvoiceLineFormState[]>([]);

  const optionsPending = customersPending || productsPending;
  const optionsErrorMessage =
    customersError || productsError
      ? (customersFetchError as Error | undefined)?.message ||
        (productsFetchError as Error | undefined)?.message ||
        'Cari ve urun listesi yuklenemedi.'
      : null;

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));

  const form = useForm<QuoteFormValues>({
    resolver: zodResolver(quoteFormSchema as never) as Resolver<QuoteFormValues>,
    defaultValues: toQuoteFormValues(),
  });

  useEffect(() => {
    form.reset(toQuoteFormValues());
    setLines([]);
  }, [form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (lines.length === 0) {
      toast.error('Kaydetmeden once en az bir kalem ekleyin.');
      return;
    }

    await createQuote.mutateAsync({
      values,
      lines: invoiceLinesToPayload(lines),
    });
    toast.success('Teklif basariyla olusturuldu.');
    navigate('/salesdesk/quotes');
  });

  const handlePreview = (): void => {
    toast.info('Onizleme yakinda eklenecek.');
  };

  return (
    <div className={SD_CREATE_PAGE_CONTAINER_CLASSNAME}>
      <SalesDeskDocumentCreatePageHeader
        title="Yeni Teklif"
        description="Cari secerek teklif olusturun, kalemleri ekleyip ozeti kontrol edin."
        onBack={() => navigate('/salesdesk/quotes')}
        backLabel="Tekliflere don"
        helpTitle="Teklif olusturma"
        helpSteps={[
          'Cari ve teklif bilgilerini doldurun.',
          'Kalem Ekle ile urun satirlari ekleyin.',
          'Ozette toplamlari kontrol edip kaydedin.',
        ]}
      />

      {optionsErrorMessage ? (
        <div className="mb-4 rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {optionsErrorMessage}
        </div>
      ) : null}

      {optionsPending && customerOptions.length === 0 ? (
        <div className="mb-4 flex items-center gap-2 text-sm text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--crm-brand-primary)]" />
          Cari ve urun listesi yukleniyor...
        </div>
      ) : null}

      <FormProvider {...form}>
        <form onSubmit={handleSubmit}>
          <div className={SD_CREATE_MAIN_GRID_CLASSNAME}>
            <div className="flex min-w-0 flex-col gap-6">
              <section className={SD_CREATE_SECTION_CARD_CLASSNAME}>
                <div className={SD_CREATE_SECTION_HEADER_CLASSNAME}>
                  <div className={SD_CREATE_SECTION_BADGE_CLASSNAME}>1</div>
                  <FileText className="h-4 w-4 text-zinc-400" />
                  <h3 className={SD_CREATE_SECTION_TITLE_CLASSNAME}>Teklif Bilgileri</h3>
                </div>
                <div className={cn(SD_CREATE_SECTION_BODY_CLASSNAME, SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME)}>
                  <SalesDeskQuoteHeaderForm customerOptions={customerOptions} optionsPending={optionsPending} />
                </div>
              </section>

              <section className={SD_CREATE_SECTION_CARD_CLASSNAME}>
                <div className={SD_CREATE_SECTION_HEADER_CLASSNAME}>
                  <div className={SD_CREATE_SECTION_BADGE_CLASSNAME}>2</div>
                  <Layers className="h-4 w-4 text-zinc-400" />
                  <h3 className={SD_CREATE_SECTION_TITLE_CLASSNAME}>Teklif Kalemleri</h3>
                </div>
                <div className="overflow-x-auto p-0">
                  <SalesDeskDocumentLineTable
                    lines={lines}
                    onLinesChange={setLines}
                    products={products ?? []}
                    productsPending={optionsPending}
                    title="Teklif Kalemleri"
                  />
                </div>
              </section>
            </div>

            <aside className="w-full xl:sticky xl:top-6">
              <section className={SD_CREATE_SECTION_CARD_CLASSNAME}>
                <div className={SD_CREATE_SECTION_HEADER_CLASSNAME}>
                  <div className={SD_CREATE_SECTION_BADGE_SUMMARY_CLASSNAME}>3</div>
                  <Calculator className="h-4 w-4 text-zinc-400" />
                  <h3 className={SD_CREATE_SECTION_TITLE_CLASSNAME}>Ozet</h3>
                </div>
                <SalesDeskDocumentSummaryCard lines={lines} title="Teklif Ozeti" />
              </section>
            </aside>
          </div>

          <div className={SD_CREATE_ACTION_BAR_CLASSNAME}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/salesdesk/quotes')}
              className="w-full sm:w-auto"
            >
              <X className="mr-2 h-4 w-4" />
              Iptal
            </Button>

            <Button
              type="button"
              onClick={handlePreview}
              className={cn(SD_DOCUMENT_BUTTON_BASE, SD_DOCUMENT_BUTTON_PREVIEW)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Onizle
            </Button>

            <Button
              type="submit"
              disabled={createQuote.isPending || optionsPending}
              className={cn('sm:min-w-[140px]', SD_DOCUMENT_BUTTON_BASE, SD_DOCUMENT_BUTTON_SAVE)}
            >
              <Save className="mr-2 h-4 w-4" />
              {createQuote.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
