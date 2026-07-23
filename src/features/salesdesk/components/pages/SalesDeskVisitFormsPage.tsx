import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BriefcaseBusiness, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import { SalesDeskVisitFormsList } from '../visit-forms/SalesDeskVisitFormsList';
import { SalesDeskVisitFormPdfDialog } from '../visit-forms/SalesDeskVisitFormPdfDialog';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import {
  useDeleteSalesDeskVisitForm,
  useSalesDeskCustomerOptions,
  useSalesDeskVisitFormList,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { salesDeskPageShellClass } from '../../lib/salesdesk-shared';
import { previewVisitFormPdf } from '../../lib/visit-form-share';
import {
  SD_PAGE_ADD_BUTTON,
  SD_PAGE_HEADER_ROW,
  SD_PAGE_ICON_BOX,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
} from '../../lib/salesdesk-popup-styles';
import {
  filterVisitFormsByDates,
  paginateVisitForms,
} from '../../lib/visit-form-list-filters';

const VISIT_FORM_DATE_FILTER_FETCH_SIZE = 500;

export function SalesDeskVisitFormsPage(): ReactElement {
  const navigate = useNavigate();
  const {
    searchTerm,
    setSearchTerm,
    pageNumber,
    setPageNumber,
    pageSize,
    setPageSize,
    listParams: baseListParams,
  } = useSalesDeskListPage(10);
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<SalesDeskVisitFormDto | null>(null);
  const [pdfPreview, setPdfPreview] = useState<{
    title: string;
    fileName: string;
    url: string;
  } | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const hasDateFilter = selectedDates.length > 0;

  useEffect(() => {
    setPageNumber(1);
  }, [selectedDates, setPageNumber]);

  const listParams = useMemo(
    () =>
      hasDateFilter
        ? {
            pageNumber: 1,
            pageSize: VISIT_FORM_DATE_FILTER_FETCH_SIZE,
            search: baseListParams.search,
            sortBy: 'FormDate',
            sortDirection: 'desc' as const,
          }
        : { ...baseListParams, sortBy: 'FormDate', sortDirection: 'desc' as const },
    [hasDateFilter, baseListParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskVisitFormList(listParams);
  const { data: customers } = useSalesDeskCustomerOptions();
  const deleteForm = useDeleteSalesDeskVisitForm();

  const filteredRows = useMemo(() => {
    const fetchedRows = data?.data ?? [];
    return hasDateFilter ? filterVisitFormsByDates(fetchedRows, selectedDates) : fetchedRows;
  }, [data?.data, hasDateFilter, selectedDates]);
  const rows = useMemo(
    () =>
      hasDateFilter ? paginateVisitForms(filteredRows, pageNumber, pageSize) : filteredRows,
    [filteredRows, hasDateFilter, pageNumber, pageSize]
  );
  const totalCount = hasDateFilter ? filteredRows.length : (data?.totalCount ?? 0);
  const totalPages = hasDateFilter
    ? Math.max(1, Math.ceil(filteredRows.length / pageSize))
    : Math.max(1, data?.totalPages ?? 1);

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
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="flex min-w-0 items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <BriefcaseBusiness size={22} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className={SD_PAGE_TITLE}>Ziyaret Formu</h1>
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
              <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
              Cari ziyaretlerini kayit altina al, PDF olustur, Gmail / WhatsApp ile gonder
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={SD_PAGE_ADD_BUTTON}
          onClick={() => navigate('/salesdesk/visit-forms/new')}
        >
          <Plus size={16} className="mr-2" />
          Yeni Ziyaret Formu
        </Button>
      </div>

      <SalesDeskVisitFormsList
        forms={rows}
        customerContacts={customerContacts}
        totalCount={totalCount}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={(error as Error | null)?.message}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedDates={selectedDates}
        onSelectedDatesChange={setSelectedDates}
        onRefresh={() => refetch()}
        pageNumber={pageNumber}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPageNumber}
        onPageSizeChange={setPageSize}
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

      <SalesDeskDeleteDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Formu sil"
        description={
          deleting
            ? buildSalesDeskDeleteDescription(deleting.title)
            : 'Bu islem geri alinamaz.'
        }
        onConfirm={async () => {
          if (!deleting) return;
          await deleteForm.mutateAsync(deleting.id);
          setDeleting(null);
        }}
        isDeleting={deleteForm.isPending}
      />
    </div>
  );
}

