import { type ReactElement, useMemo } from 'react';
import { useSalesDeskOpenItemsList } from '../../hooks/useSalesDeskModules';
import {
  OPEN_ITEM_CATEGORY_DEFS,
  groupOpenItemsByCategory,
} from '../../lib/salesdesk-open-item-categories';
import { SalesDeskOpenItemsCategoryCard } from './SalesDeskOpenItemsCategoryCard';

export function SalesDeskOpenItemsDashboardSection(): ReactElement {
  const { data, isPending, isError, error } = useSalesDeskOpenItemsList({
    pageNumber: 1,
    pageSize: 50,
    sortBy: 'DueDate',
    sortDirection: 'asc',
  });

  const groupedItems = useMemo(
    () => groupOpenItemsByCategory(data?.data ?? []),
    [data?.data]
  );

  const errorMessage = error instanceof Error ? error.message : null;

  return (
    <>
      {isError ? (
        <div className="col-span-full rounded-2xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p>Acik maddeler yuklenemedi{errorMessage ? `: ${errorMessage}` : '.'}</p>
          <p className="mt-1 text-xs text-amber-100/80">
            Gorev listesi API&apos;sine erisim saglandiginda kartlar otomatik dolacaktir.
          </p>
        </div>
      ) : null}

      {OPEN_ITEM_CATEGORY_DEFS.map((category) => (
        <SalesDeskOpenItemsCategoryCard
          key={category.id}
          category={category}
          items={groupedItems[category.id] ?? []}
          isLoading={isPending && !isError}
        />
      ))}
    </>
  );
}
