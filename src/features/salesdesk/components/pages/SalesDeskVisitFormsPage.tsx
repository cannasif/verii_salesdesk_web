import { type ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, Plus } from 'lucide-react';
import { toast } from 'sonner';
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
import type { SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import { SalesDeskVisitFormsList } from '../visit-forms/SalesDeskVisitFormsList';
import { SalesDeskVisitFormPdfDialog } from '../visit-forms/SalesDeskVisitFormPdfDialog';
import {
  useDeleteSalesDeskVisitForm,
  useSalesDeskCustomerOptions,
  useSalesDeskVisitFormList,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { salesDeskPageShellClass, salesDeskPageSubtitleClass, salesDeskPageTitleClass } from '../../lib/salesdesk-shared';
import { previewVisitFormPdf } from '../../lib/visit-form-share';
import { SD_ADD_BUTTON, SD_PAGE_ICON_BOX, SD_SECONDARY_BUTTON, SD_SURFACE_DIALOG } from '../../lib/salesdesk-popup-styles';

export function SalesDeskVisitFormsPage(): ReactElement {
  const navigate = useNavigate();
  const listPage = useSalesDeskListPage(10);
  const [deleting, setDeleting] = useState<SalesDeskVisitFormDto | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{
    title: string;
    fileName: string;
    url: string;
  } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'FormDate', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskVisitFormList(listParams);
  const { data: customers } = useSalesDeskCustomerOptions();
  const deleteForm = useDeleteSalesDeskVisitForm();

  const rows = data?.data ?? [];
  const totalCount = data?.totalCount ?? 0;
  const totalPages = Math.max(1, data?.totalPages ?? 1);

  const customerContacts = useMemo(() => {
    const map: Record<number, { email?: string | null; phone?: string | null }> = {};
    for (const customer of customers ?? []) {
      map[customer.id] = { email: customer.email, phone: customer.phone };
    }
    return map;
  }, [customers]);

  const handlePreviewPdf = async (form: SalesDeskVisitFormDto): Promise<void> => {
    if (pdfPreview?.url) {
      URL.revokeObjectURL(pdfPreview.url);
    }

    setPdfLoading(true);
    setPdfPreview({ title: form.title, fileName: `${form.id}.pdf`, url: '' });

    try {
      const result = await previewVisitFormPdf(form);
      setPdfPreview({
        title: form.title,
        fileName: result.fileName,
        url: result.url,
      });
    } catch (previewError) {
      setPdfPreview(null);
      toast.error(previewError instanceof Error ? previewError.message : 'PDF olusturulamadi.');
    } finally {
      setPdfLoading(false);
    }
  };

  const closePdfPreview = (): void => {
    if (pdfPreview?.url) {
      URL.revokeObjectURL(pdfPreview.url);
    }
    setPdfPreview(null);
    setPdfLoading(false);
  };

  return (
    <div className={salesDeskPageShellClass}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <BriefcaseBusiness size={22} />
          </div>
          <div>
            <h1 className={salesDeskPageTitleClass}>Ziyaret Formu</h1>
            <p className={salesDeskPageSubtitleClass}>
              Cari ziyaretlerini kayit altina al, PDF olustur, Gmail / WhatsApp ile gonder
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/salesdesk/visit-forms/new')} className={SD_ADD_BUTTON}>
          <Plus size={16} />
          Yeni Ziyaret Formu
        </button>
      </div>

      <SalesDeskVisitFormsList
        forms={rows}
        customerContacts={customerContacts}
        totalCount={totalCount}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={(error as Error | null)?.message}
        searchTerm={listPage.searchTerm}
        onSearchChange={listPage.setSearchTerm}
        onRefresh={() => refetch()}
        pageNumber={listPage.pageNumber}
        pageSize={listPage.pageSize}
        totalPages={totalPages}
        onPageChange={listPage.setPageNumber}
        onPageSizeChange={listPage.setPageSize}
        onEdit={(form) => navigate(`/salesdesk/visit-forms/${form.id}/edit`)}
        onDelete={setDeleting}
        onPreviewPdf={handlePreviewPdf}
      />

      <SalesDeskVisitFormPdfDialog
        open={pdfPreview != null}
        title={pdfPreview?.title ?? ''}
        fileName={pdfPreview?.fileName ?? 'ziyaret-formu.pdf'}
        previewUrl={pdfPreview?.url || null}
        isLoading={pdfLoading}
        onOpenChange={(open) => {
          if (!open) closePdfPreview();
        }}
      />

      <AlertDialog open={deleting != null} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent className={`w-[90%] max-w-md gap-0 overflow-hidden rounded-2xl p-0 sm:w-full ${SD_SURFACE_DIALOG}`}>
          <AlertDialogHeader className="px-6 pb-4 pt-8 text-center sm:text-left">
            <AlertDialogTitle className="text-lg font-semibold text-slate-900 dark:text-white">
              Formu sil
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-[var(--crm-app-text-muted)]">
              {deleting
                ? `"${deleting.title}" kaydini silmek istediginize emin misiniz? Bu islem geri alinamaz.`
                : 'Bu islem geri alinamaz.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row justify-end gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-4">
            <AlertDialogCancel className={SD_SECONDARY_BUTTON}>Iptal</AlertDialogCancel>
            <AlertDialogAction
              className="h-10 rounded-lg bg-rose-600 px-5 text-sm font-semibold text-white hover:bg-rose-500"
              onClick={async () => {
                if (!deleting) return;
                await deleteForm.mutateAsync(deleting.id);
                setDeleting(null);
              }}
              disabled={deleteForm.isPending}
            >
              {deleteForm.isPending ? 'Siliniyor...' : 'Sil'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
