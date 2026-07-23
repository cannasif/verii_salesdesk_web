import { type ReactElement, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { DataTableGrid, ManagementDataTableChrome, ManagementTableRowActions, type DataTableGridColumn } from '@/components/shared';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PricingRuleHeaderGetDto } from '../types/pricing-rule-types';
import { useDeletePricingRuleHeader } from '../hooks/useDeletePricingRuleHeader';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Alert02Icon } from 'hugeicons-react';
import { useCrudPermissions } from '@/features/access-control/hooks/useCrudPermissions';
import { MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH } from '@/lib/management-table-actions';

export interface ColumnDef<T> {
  key: keyof T | 'status';
  label: string;
  type: 'text' | 'date' | 'customer' | 'ruleType' | 'status' | 'code';
  className?: string;
}

type PricingRuleColumnKey = keyof PricingRuleHeaderGetDto | 'status';

const getColumnsConfig = (t: TFunction): ColumnDef<PricingRuleHeaderGetDto>[] => [
  { key: 'ruleCode', label: t('table.ruleCode'), type: 'code', className: 'w-[96px] md:w-[120px]' },
  { key: 'ruleName', label: t('table.ruleName'), type: 'text', className: 'min-w-[160px] md:min-w-[200px] font-medium' },
  { key: 'ruleType', label: t('table.ruleType'), type: 'ruleType', className: 'w-[110px] md:w-[140px]' },
  { key: 'validFrom', label: t('table.validFrom'), type: 'date', className: 'w-[110px] md:w-[140px]' },
  { key: 'validTo', label: t('table.validTo'), type: 'date', className: 'w-[110px] md:w-[140px]' },
  { key: 'customerName', label: t('table.customer'), type: 'customer', className: 'min-w-[150px] md:min-w-[180px]' },
  { key: 'isActive', label: t('table.status'), type: 'status', className: 'w-[96px] md:w-[120px]' },
];

export { getColumnsConfig };

interface PricingRuleTableProps {
  onEdit: (header: PricingRuleHeaderGetDto) => void;
  toolbar?: React.ReactNode;
  columns: DataTableGridColumn<PricingRuleColumnKey>[];
  visibleColumnKeys: PricingRuleColumnKey[];
  rows: PricingRuleHeaderGetDto[];
  rowKey: (row: PricingRuleHeaderGetDto) => string | number;
  renderCell: (row: PricingRuleHeaderGetDto, key: PricingRuleColumnKey) => React.ReactNode;
  sortBy: PricingRuleColumnKey;
  sortDirection: 'asc' | 'desc';
  onSort: (key: PricingRuleColumnKey) => void;
  renderSortIcon: (key: PricingRuleColumnKey) => React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  errorText?: string;
  emptyText?: string;
  minTableWidthClassName?: string;
  showActionsColumn?: boolean;
  actionsHeaderLabel?: string;
  rowClassName?: string | ((row: PricingRuleHeaderGetDto) => string | undefined);
  onRowDoubleClick?: (row: PricingRuleHeaderGetDto) => void;
  pageSize: number;
  pageSizeOptions: readonly number[];
  onPageSizeChange: (size: number) => void;
  pageNumber: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPreviousPage: () => void;
  onNextPage: () => void;
  previousLabel: string;
  nextLabel: string;
  paginationInfoText: string;
  disablePaginationButtons?: boolean;
  onColumnOrderChange?: (newOrder: string[]) => void;
}

export function PricingRuleTable({
  onEdit,
  toolbar,
  columns,
  visibleColumnKeys,
  rows,
  rowKey,
  renderCell,
  sortBy,
  sortDirection,
  onSort,
  renderSortIcon,
  isLoading = false,
  loadingText = 'Loading...',
  errorText = 'An error occurred.',
  emptyText = 'No data.',
  minTableWidthClassName = 'min-w-[900px] lg:min-w-[1100px]',
  showActionsColumn = true,
  actionsHeaderLabel = '',
  rowClassName,
  onRowDoubleClick,
  pageSize,
  pageSizeOptions,
  onPageSizeChange,
  pageNumber,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPreviousPage,
  onNextPage,
  previousLabel,
  nextLabel,
  paginationInfoText,
  disablePaginationButtons = false,
  onColumnOrderChange,
}: PricingRuleTableProps): ReactElement {
  const { t } = useTranslation('pricing-rule');
  const { canUpdate, canDelete } = useCrudPermissions('pricing.pricing-rules.view');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedHeader, setSelectedHeader] = useState<PricingRuleHeaderGetDto | null>(null);
  const deleteHeader = useDeletePricingRuleHeader();

  const handleDeleteClick = (header: PricingRuleHeaderGetDto): void => {
    if (!canDelete) return;
    setSelectedHeader(header);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (selectedHeader) {
      try {
        await deleteHeader.mutateAsync(selectedHeader.id);
        toast.success(t('delete.success'));
        setDeleteDialogOpen(false);
        setSelectedHeader(null);
      } catch {
        toast.error(t('delete.error'));
      }
    }
  };

    const renderActionsCell = (header: PricingRuleHeaderGetDto): ReactElement => (
    <ManagementTableRowActions
      onEdit={canUpdate ? () => onEdit(header) : undefined}
      onDelete={canDelete ? () => handleDeleteClick(header) : undefined}
      showEdit={canUpdate}
      showDelete={canDelete}
    />
  );;

  return (
    <>
      <ManagementDataTableChrome>
      <DataTableGrid<PricingRuleHeaderGetDto, PricingRuleColumnKey>
        toolbar={toolbar}
        columns={columns}
        visibleColumnKeys={visibleColumnKeys}
        rows={rows}
        rowKey={rowKey}
        renderCell={renderCell}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={onSort}
        renderSortIcon={renderSortIcon}
        isLoading={isLoading}
        isError={false}
        loadingText={loadingText}
        errorText={errorText}
        emptyText={emptyText}
        minTableWidthClassName={minTableWidthClassName}
        showActionsColumn={showActionsColumn}
        actionsHeaderLabel={actionsHeaderLabel}
        renderActionsCell={renderActionsCell}          initialActionsColumnWidth={MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH}        rowClassName={rowClassName}
        onRowDoubleClick={onRowDoubleClick}
        pageSize={pageSize}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
        pageNumber={pageNumber}
        totalPages={totalPages}
        hasPreviousPage={hasPreviousPage}
        hasNextPage={hasNextPage}
        onPreviousPage={onPreviousPage}
        onNextPage={onNextPage}
        previousLabel={previousLabel}
        nextLabel={nextLabel}
        paginationInfoText={paginationInfoText}
        disablePaginationButtons={disablePaginationButtons}
        centerColumnHeaders
        onColumnOrderChange={onColumnOrderChange}
      />
      </ManagementDataTableChrome>

      <Dialog open={canDelete && deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white dark:bg-[#130822] border border-slate-100 dark:border-white/10 text-slate-900 dark:text-white w-[90%] sm:w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-0 gap-0">
          <DialogHeader className="flex flex-col items-center gap-4 text-center pb-6 pt-10 px-6">
            <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center mb-2 animate-in zoom-in duration-300">
              <Alert02Icon size={36} className="text-red-600 dark:text-red-500" />
            </div>
            <div className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                {t('delete.confirmTitle')}
              </DialogTitle>
              <DialogDescription className="text-slate-500 dark:text-slate-400 max-w-[280px] mx-auto text-sm leading-relaxed">
                {t('delete.confirmMessage', { name: selectedHeader?.ruleName || '' })}
              </DialogDescription>
            </div>
          </DialogHeader>
          <DialogFooter className="flex flex-row gap-3 justify-center p-6 bg-slate-50/50 dark:bg-[#1a1025]/50 border-t border-slate-100 dark:border-white/5">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              className="flex-1 h-12 rounded-xl border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/5 font-semibold"
            >
              {t('form.cancel')}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleteHeader.isPending}
              className="flex-1 h-12 rounded-xl bg-linear-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0 shadow-lg shadow-red-500/20 transition-all hover:scale-[1.02] font-bold"
            >
              {deleteHeader.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {t('delete.action')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
