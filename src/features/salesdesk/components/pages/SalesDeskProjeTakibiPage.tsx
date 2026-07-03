import { type ReactElement, useMemo, useState } from 'react';
import { FolderKanban, LayoutGrid, List } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import { SalesDeskProjectKanbanBoard } from '../projects/SalesDeskProjectKanbanBoard';
import { SalesDeskProjectStatusPipeline } from '../projects/SalesDeskProjectStatusPipeline';
import {
  useCreateSalesDeskProject,
  useDeleteSalesDeskProject,
  useSalesDeskCustomerOptions,
  useSalesDeskProjectsList,
  useSalesDeskUserOptions,
  useUpdateSalesDeskProject,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import {
  computeProjectStatusCounts,
  getSalesDeskProjectPhaseLabel,
  getSalesDeskProjectPhaseOptions,
  parseSalesDeskProjectPhase,
} from '../../lib/salesdesk-project-tracking';
import { enumToSelectOptions, formatDate, NONE_SELECT_VALUE, withNoneOption } from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  salesDeskProjectFormSchema,
  toSalesDeskProjectFormValues,
  type SalesDeskProjectFormValues,
} from '../../types/salesdesk-schemas';
import { PriorityBadge, TaskStatusBadge } from './salesdesk-badges';

type ProjectViewMode = 'list' | 'kanban';

export function SalesDeskProjeTakibiPage(): ReactElement {
  const authUser = useAuthStore((state) => state.user);
  const listPage = useSalesDeskListPage();
  const [viewMode, setViewMode] = useState<ProjectViewMode>('list');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskTaskDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskTaskDto | null>(null);

  const listParams = useMemo(
    () => ({
      ...listPage.listParams,
      sortBy: 'DueDate',
      sortDirection: 'asc',
      ...(viewMode === 'kanban'
        ? { pageNumber: 1, pageSize: 50, search: listPage.listParams.search }
        : {}),
    }),
    [listPage.listParams, viewMode]
  );

  const { data, isPending, isFetching, isError, error, refetch } = useSalesDeskProjectsList(listParams);
  const { data: customers } = useSalesDeskCustomerOptions();
  const { data: users } = useSalesDeskUserOptions();
  const createProject = useCreateSalesDeskProject();
  const updateProject = useUpdateSalesDeskProject();
  const deleteProject = useDeleteSalesDeskProject();

  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    (users ?? []).forEach((user) => map.set(user.id, user.name));
    return map;
  }, [users]);

  const rows = data?.data ?? [];
  const projectStats = data?.projectStats;
  const statusCounts = useMemo(() => computeProjectStatusCounts(rows), [rows]);
  const showListError = isError && rows.length === 0;
  const listError = showListError ? (error as Error | null) : null;
  const todayKey = new Date().toISOString().slice(0, 10);

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );
  const userOptions = withNoneOption(
    (users ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );
  const phaseOptions = useMemo(
    () => withNoneOption(getSalesDeskProjectPhaseOptions()),
    []
  );

  const handleSubmit = async (values: SalesDeskProjectFormValues): Promise<void> => {
    if (!values.title?.trim()) {
      toast.error('Proje adi zorunludur.');
      throw new Error('Proje adi zorunludur.');
    }

    const assignedUserId =
      values.assignedUserId && values.assignedUserId !== NONE_SELECT_VALUE
        ? values.assignedUserId
        : authUser?.id
          ? String(authUser.id)
          : NONE_SELECT_VALUE;

    if (!assignedUserId || assignedUserId === NONE_SELECT_VALUE) {
      toast.error('Atanan kullanici bulunamadi. Lutfen tekrar giris yapin.');
      throw new Error('Atanan kullanici bulunamadi.');
    }

    const payload: SalesDeskProjectFormValues = {
      ...values,
      assignedUserId,
    };

    if (editing) {
      await updateProject.mutateAsync({ id: editing.id, values: payload });
    } else {
      await createProject.mutateAsync(payload);
    }
  };

  const viewToggle = (
    <div className="inline-flex rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)]/50 p-1">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 rounded-lg px-3 text-xs font-semibold',
          viewMode === 'list' && 'bg-indigo-500/15 text-indigo-200'
        )}
        onClick={() => setViewMode('list')}
      >
        <List className="mr-1.5 h-4 w-4" />
        Liste
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-8 rounded-lg px-3 text-xs font-semibold',
          viewMode === 'kanban' && 'bg-indigo-500/15 text-indigo-200'
        )}
        onClick={() => setViewMode('kanban')}
      >
        <LayoutGrid className="mr-1.5 h-4 w-4" />
        Kanban
      </Button>
    </div>
  );

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-proje-takibi"
      title="Proje Takibi"
      subtitle="Proje gorevlerini durum, asama ve termin bazinda yonetin"
      tableTitle={viewMode === 'list' ? 'Proje Listesi' : 'Proje Kanban'}
      actionLabel="Yeni Proje Ekle"
      icon={<FolderKanban size={22} />}
      headerActions={viewToggle}
      metrics={[
        { label: 'Toplam', value: data?.totalCount ?? rows.length },
        { label: 'Aktif', value: projectStats?.active ?? 0, tone: 'cyan' },
        { label: 'Devam Eden', value: projectStats?.inProgress ?? 0, tone: 'yellow' },
        { label: 'Gecikmis', value: projectStats?.overdue ?? 0, tone: 'red' },
      ]}
      contentAboveTable={
        <SalesDeskProjectStatusPipeline
          counts={statusCounts}
          total={data?.totalCount ?? rows.length}
          className="mb-4"
        />
      }
      columns={[
        { key: 'title', header: 'PROJE', render: (row) => row.title },
        {
          key: 'phase',
          header: 'ASAMA',
          render: (row) => getSalesDeskProjectPhaseLabel(parseSalesDeskProjectPhase(row.groupName)),
        },
        { key: 'status', header: 'DURUM', render: (row) => <TaskStatusBadge status={row.status} /> },
        { key: 'priority', header: 'ONCELIK', render: (row) => <PriorityBadge priority={row.priority} /> },
        {
          key: 'assignedUser',
          header: 'SORUMLU',
          render: (row) =>
            row.assignedUserId ? userNameById.get(row.assignedUserId) ?? `#${row.assignedUserId}` : '-',
        },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName || '-' },
        {
          key: 'dueDate',
          header: 'TESLIM',
          render: (row) => {
            const overdue =
              row.dueDate && row.dueDate.slice(0, 10) < todayKey && row.status !== 3 && row.status !== 4;
            return (
              <span className={cn(overdue && 'font-semibold text-rose-300')}>{formatDate(row.dueDate)}</span>
            );
          },
        },
      ]}
      rows={rows}
      isLoading={isPending && !isError}
      isFetching={isFetching}
      isError={showListError}
      error={listError}
      searchTerm={listPage.searchTerm}
      onSearchChange={listPage.setSearchTerm}
      pageSize={listPage.pageSize}
      onPageSizeChange={listPage.setPageSize}
      pageNumber={listPage.pageNumber}
      totalPages={Math.max(1, data?.totalPages ?? 1)}
      totalCount={data?.totalCount ?? 0}
      onPageChange={listPage.setPageNumber}
      onRefresh={() => refetch()}
      onAdd={() => {
        setEditing(null);
        setFormOpen(true);
      }}
      onEdit={(row) => {
        setEditing(row);
        setFormOpen(true);
      }}
      onDeleteRequest={setDeleting}
      deletingRow={deleting}
      onDeleteConfirm={async () => {
        if (!deleting) return;
        await deleteProject.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteProject.isPending}
      deleteLabel={(row) => row.title}
      hideToolbar={viewMode === 'kanban'}
      customTable={
        viewMode === 'kanban' ? (
          <SalesDeskProjectKanbanBoard
            rows={rows}
            userNameById={userNameById}
            onEdit={(row) => {
              setEditing(row);
              setFormOpen(true);
            }}
            isLoading={isPending && !isError}
          />
        ) : undefined
      }
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Projeyi Duzenle' : 'Yeni Proje'}
          description="Proje adi, asama, sorumlu ve teslim tarihini planlayin."
          schema={salesDeskProjectFormSchema}
          defaultValues={toSalesDeskProjectFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toSalesDeskProjectFormValues(entity as SalesDeskTaskDto)}
          onSubmit={handleSubmit}
          isLoading={createProject.isPending || updateProject.isPending}
          validateMode="onSubmit"
          fields={[
            { name: 'title', label: 'Proje Adi', required: true, colSpan: 2 },
            {
              name: 'projectPhase',
              label: 'Asama',
              type: 'select',
              options: phaseOptions,
              placeholder: 'Asama secin (opsiyonel)',
            },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
            { name: 'assignedUserId', label: 'Sorumlu', type: 'select', options: userOptions },
            {
              name: 'priority',
              label: 'Oncelik',
              type: 'select',
              options: enumToSelectOptions(PRIORITY_LABELS),
              required: true,
            },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(TASK_STATUS_LABELS),
              required: true,
            },
            { name: 'dueDate', label: 'Teslim Tarihi', type: 'date' },
            { name: 'description', label: 'Aciklama', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
