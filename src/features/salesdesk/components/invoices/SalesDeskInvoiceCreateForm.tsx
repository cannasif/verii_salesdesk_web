import { type ReactElement, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FormProvider, useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Calculator, Eye, FileText, Layers, Loader2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  useCreateSalesDeskInvoice,
  useSalesDeskCustomerOptions,
  useSalesDeskProductOptions,
} from '../../hooks/useSalesDeskModules';
import {
  invoiceFormSchema,
  toInvoiceFormValues,
  type InvoiceFormValues,
} from '../../types/salesdesk-schemas';
import {
  type InvoiceLineFormState,
} from '../../types/invoice-create-types';
import {
  SALES_DESK_INVOICE_TYPE,
  SALES_DESK_INVOICE_TYPE_LABELS,
  type SalesDeskInvoiceType,
} from '../../types/invoice-types';
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
import { SalesDeskDocumentCreatePageHeader } from './SalesDeskDocumentCreatePageHeader';
import { SalesDeskInvoiceHeaderForm } from './SalesDeskInvoiceHeaderForm';
import { SalesDeskDocumentLineTable } from './SalesDeskDocumentLineTable';
import { SalesDeskDocumentSummaryCard } from './SalesDeskDocumentSummaryCard';
import { SalesDeskQuotePreviewDialog } from '../quotes/SalesDeskQuotePreviewDialog';
import { buildSalesDeskInvoicePreviewData } from '../../lib/build-salesdesk-invoice-preview-data';
import { cn } from '@/lib/utils';

const INVOICE_DUE_DAYS = 30;

function addDaysToDateOnly(dateValue: string, days: number): string {
  const date = new Date(`${dateValue}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
}

interface SalesDeskInvoiceCreateFormProps {
  invoiceType: SalesDeskInvoiceType;
}

export function SalesDeskInvoiceCreateForm({ invoiceType }: SalesDeskInvoiceCreateFormProps): ReactElement {
  const navigate = useNavigate();
  const createInvoice = useCreateSalesDeskInvoice();
  const submitLockRef = useRef(false);
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
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<ReturnType<typeof buildSalesDeskInvoicePreviewData> | null>(null);
  const [previewShareContext, setPreviewShareContext] = useState<{
    customerId: number;
    customerName: string;
  } | null>(null);

  const customerNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const item of customers ?? []) {
      map.set(String(item.id), item.name);
    }
    return map;
  }, [customers]);

  const customerContactById = useMemo(() => {
    const map = new Map<number, { email?: string | null; phone?: string | null }>();
    for (const item of customers ?? []) {
      map.set(item.id, { email: item.email, phone: item.phone });
    }
    return map;
  }, [customers]);

  const optionsPending = customersPending || productsPending;
  const optionsErrorMessage =
    customersError || productsError
      ? (customersFetchError as Error | undefined)?.message ||
        (productsFetchError as Error | undefined)?.message ||
        'Cari ve urun listesi yuklenemedi.'
      : null;

  const isPurchase = invoiceType === SALES_DESK_INVOICE_TYPE.purchase;
  const title = isPurchase ? 'Yeni Alis Faturasi' : 'Yeni Satis Faturasi';
  const subtitle = isPurchase
    ? 'Tedarikci cari secerek alis faturasi kaydi olusturun.'
    : 'Musteri cari secerek satis faturasi kaydi olusturun.';
  const partyLabel = isPurchase ? 'Tedarikci / Cari' : 'Musteri / Cari';

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema as never) as Resolver<InvoiceFormValues>,
    defaultValues: toInvoiceFormValues(undefined, invoiceType),
  });

  useEffect(() => {
    form.reset(toInvoiceFormValues(undefined, invoiceType));
    setLines([]);
  }, [form, invoiceType]);

  const watchedInvoiceDate = form.watch('invoiceDate');

  useEffect(() => {
    if (!watchedInvoiceDate) return;
    form.setValue('dueDate', addDaysToDateOnly(watchedInvoiceDate, INVOICE_DUE_DAYS), {
      shouldValidate: true,
    });
  }, [form, watchedInvoiceDate]);

  const handleInvalidSubmit = (): void => {
    toast.error('Lutfen zorunlu alanlari kontrol edin (cari, tarih, durum).');
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    if (submitLockRef.current || createInvoice.isPending) {
      return;
    }

    if (lines.length === 0) {
      toast.error('Kaydetmeden once en az bir kalem ekleyin.');
      return;
    }

    const validLines = lines.filter((line) => line.productId > 0 && line.quantity > 0);
    if (validLines.length === 0) {
      toast.error('Her kalemde urun secimi ve gecerli miktar olmalidir.');
      return;
    }

    const customerName = customerNameById.get(String(values.customerId)) ?? 'Cari';

    submitLockRef.current = true;
    try {
      await createInvoice.mutateAsync({
        values: {
          ...values,
          invoiceType: String(invoiceType) as InvoiceFormValues['invoiceType'],
        },
        lines: validLines,
        customerName,
      });
      navigate(isPurchase ? '/salesdesk/invoices?type=purchase' : '/salesdesk/invoices?type=sales');
    } catch {
      // Hata toast'u mutation tarafinda gosteriliyor.
    } finally {
      submitLockRef.current = false;
    }
  }, handleInvalidSubmit);

  const handlePreview = (): void => {
    const values = form.getValues();
    if (!values.customerId) {
      toast.error('Onizleme icin once cari secin.');
      return;
    }
    if (lines.length === 0) {
      toast.error('Onizleme icin en az bir kalem ekleyin.');
      return;
    }

    const customerName = customerNameById.get(String(values.customerId)) ?? 'Cari';
    const customerId = Number(values.customerId);
    setPreviewShareContext({ customerId, customerName });
    setPreviewData(
      buildSalesDeskInvoicePreviewData(
        {
          ...values,
          invoiceType: String(invoiceType) as InvoiceFormValues['invoiceType'],
        },
        lines,
        customerName
      )
    );
    setPreviewOpen(true);
  };

  return (
    <div className={SD_CREATE_PAGE_CONTAINER_CLASSNAME}>
      <SalesDeskDocumentCreatePageHeader
        title={title}
        description={subtitle}
        onBack={() => navigate('/salesdesk/invoices')}
        backLabel="Faturalara don"
        helpTitle={`${SALES_DESK_INVOICE_TYPE_LABELS[invoiceType]} olusturma`}
        helpSteps={[
          'Cari ve fatura bilgilerini doldurun.',
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
                  <h3 className={SD_CREATE_SECTION_TITLE_CLASSNAME}>Fatura Bilgileri</h3>
                </div>
                <div className={cn(SD_CREATE_SECTION_BODY_CLASSNAME, SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME)}>
                  <SalesDeskInvoiceHeaderForm
                    partyLabel={partyLabel}
                    isPurchase={isPurchase}
                    customerOptions={customerOptions}
                    optionsPending={optionsPending}
                  />
                </div>
              </section>

              <section className={SD_CREATE_SECTION_CARD_CLASSNAME}>
                <div className={SD_CREATE_SECTION_HEADER_CLASSNAME}>
                  <div className={SD_CREATE_SECTION_BADGE_CLASSNAME}>2</div>
                  <Layers className="h-4 w-4 text-zinc-400" />
                  <h3 className={SD_CREATE_SECTION_TITLE_CLASSNAME}>Fatura Kalemleri</h3>
                </div>
                <div className="w-full overflow-hidden p-0">
                  <SalesDeskDocumentLineTable
                    lines={lines}
                    onLinesChange={setLines}
                    products={products ?? []}
                    productsPending={optionsPending}
                    title="Fatura Kalemleri"
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
                <SalesDeskDocumentSummaryCard lines={lines} title="Fatura Ozeti" />
              </section>
            </aside>
          </div>

          <div className={SD_CREATE_ACTION_BAR_CLASSNAME}>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/salesdesk/invoices')}
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
              disabled={createInvoice.isPending || optionsPending}
              className={cn('sm:min-w-[140px]', SD_DOCUMENT_BUTTON_BASE, SD_DOCUMENT_BUTTON_SAVE)}
            >
              <Save className="mr-2 h-4 w-4" />
              {createInvoice.isPending ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </form>
      </FormProvider>

      <SalesDeskQuotePreviewDialog
        open={previewOpen}
        variant="invoice"
        data={previewData}
        invoice={
          previewShareContext && previewData
            ? {
                id: 0,
                customerId: previewShareContext.customerId,
                invoiceNumber: previewData.quoteNumber,
                customerName: previewShareContext.customerName,
              }
            : null
        }
        contact={
          previewShareContext ? customerContactById.get(previewShareContext.customerId) ?? null : null
        }
        onOpenChange={(open) => {
          setPreviewOpen(open);
          if (!open) {
            setPreviewData(null);
            setPreviewShareContext(null);
          }
        }}
      />
    </div>
  );
}
