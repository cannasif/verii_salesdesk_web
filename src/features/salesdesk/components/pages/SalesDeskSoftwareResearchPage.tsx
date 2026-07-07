import { type ReactElement, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, SearchCode } from 'lucide-react';
import type { SalesDeskSoftwareResearchDto } from '../../api/salesdesk-api';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import { SalesDeskKpiCards } from '../SalesDeskKpiCards';
import {
  SalesDeskSoftwareResearchBoard,
  type SoftwareResearchStatusFilter,
} from '../software-research/SalesDeskSoftwareResearchBoard';
import {
  useDeleteSalesDeskSoftwareResearch,
  useSalesDeskSoftwareResearchList,
  useSalesDeskSoftwareResearchStats,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { salesDeskPageShellClass, salesDeskPageSubtitleClass, salesDeskPageTitleClass } from '../../lib/salesdesk-shared';
import { SD_ADD_BUTTON, SD_PAGE_ICON_BOX } from '../../lib/salesdesk-popup-styles';

export function SalesDeskSoftwareResearchPage(): ReactElement {
  const navigate = useNavigate();
  const listPage = useSalesDeskListPage(12);
  const [deleting, setDeleting] = useState<SalesDeskSoftwareResearchDto | null>(null);
  const [statusFilter, setStatusFilter] = useState<SoftwareResearchStatusFilter>('all');

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'ResearchedAt', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskSoftwareResearchList(listParams);
  const { data: statsData } = useSalesDeskSoftwareResearchStats();
  const deleteResearch = useDeleteSalesDeskSoftwareResearch();

  const statsRows = statsData?.data ?? [];
  const filteredRows = useMemo(() => {
    const rows = data?.data ?? [];
    if (statusFilter === 'all') return rows;
    return rows.filter((item) => String(item.status) === statusFilter);
  }, [data?.data, statusFilter]);

  return (
    <div className={salesDeskPageShellClass}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <SearchCode size={22} />
          </div>
          <div>
            <h1 className={salesDeskPageTitleClass}>Yazilim Arastirma</h1>
            <p className={salesDeskPageSubtitleClass}>
              Potansiyel carilerde kullanilan yazilimlari kartlar halinde takip edin
            </p>
          </div>
        </div>
        <button type="button" onClick={() => navigate('/salesdesk/software-research/new')} className={SD_ADD_BUTTON}>
          <Plus size={16} />
          Yeni Arastirma
        </button>
      </div>

      <SalesDeskKpiCards
        isLoading={isLoading}
        items={[
          {
            key: 'total',
            label: 'Toplam',
            value: statsData?.totalCount ?? 0,
            hint: 'Tum arastirma kayitlari',
            tone: 'brand',
            icon: SearchCode,
          },
          {
            key: 'pending',
            label: 'Bekleyen',
            value: statsRows.filter((item) => item.status === 1).length,
            hint: 'Inceleme bekleyen kayitlar',
            tone: 'sky',
            icon: SearchCode,
          },
          {
            key: 'found',
            label: 'Bulunan',
            value: statsRows.filter((item) => item.status === 2).length,
            hint: 'Yazilim tespit edilenler',
            tone: 'emerald',
            icon: SearchCode,
          },
          {
            key: 'strong',
            label: 'Guclu',
            value: statsRows.filter((item) => item.status === 4).length,
            hint: 'Yuksek potansiyelli eslesmeler',
            tone: 'amber',
            icon: SearchCode,
          },
        ]}
      />

      <SalesDeskSoftwareResearchBoard
        items={filteredRows}
        totalCount={statusFilter === 'all' ? (data?.totalCount ?? 0) : filteredRows.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        errorMessage={(error as Error | null)?.message}
        searchTerm={listPage.searchTerm}
        onSearchChange={listPage.setSearchTerm}
        onRefresh={() => refetch()}
        pageNumber={listPage.pageNumber}
        pageSize={listPage.pageSize}
        totalPages={Math.max(1, data?.totalPages ?? 1)}
        onPageChange={listPage.setPageNumber}
        onPageSizeChange={listPage.setPageSize}
        onEdit={(item) => navigate(`/salesdesk/software-research/${item.id}/edit`)}
        onDelete={setDeleting}
        onAdd={() => navigate('/salesdesk/software-research/new')}
      />

      <SalesDeskDeleteDialog
        open={deleting != null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Arastirmayi sil"
        description={
          deleting
            ? buildSalesDeskDeleteDescription(deleting.provider)
            : 'Bu islem geri alinamaz.'
        }
        onConfirm={async () => {
          if (!deleting) return;
          await deleteResearch.mutateAsync(deleting.id);
          setDeleting(null);
        }}
        isDeleting={deleteResearch.isPending}
      />
    </div>
  );
}
