import { type ReactElement, useMemo, useState } from 'react';
import { FolderKanban, LayoutGrid, List, Plus, RefreshCw, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskTaskDto, SalesDeskTaskStatus } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import { SalesDeskProjectStatusPipeline } from '../projects/SalesDeskProjectStatusPipeline';
import { SalesDeskProjectTrelloHub, type ProjectTrelloMoveTarget } from '../projects/SalesDeskProjectTrelloHub';
import { SalesDeskProjectTrelloDetailSheet } from '../projects/SalesDeskProjectTrelloDetailSheet';
import {
  useCreateSalesDeskProject,
  useDeleteSalesDeskProject,
  useSalesDeskCustomerOptions,
  useSalesDeskProjectsList,
  useSalesDeskUserOptions,
  useUpdateSalesDeskProject,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { appendProjectToColumnOrder, removeProjectFromAllColumnOrders } from '../../lib/salesdesk-project-card-order';
import type { ProjectCardMeta, ProjectTrelloFilterId } from '../../lib/salesdesk-project-meta';
import { sendBackendNoteNotification } from '../../lib/send-note-backend-notification';
import {
  computeProjectStatusCounts,
  getSalesDeskProjectPhaseLabel,
  getSalesDeskProjectPhaseOptions,
  getSalesDeskProjectTeamLabel,
  getSalesDeskProjectTeamOptions,
  parseSalesDeskProjectPhase,
  parseSalesDeskProjectTeam,
  type SalesDeskProjectTeamId,
} from '../../lib/salesdesk-project-tracking';
import { SalesDeskKpiCards } from '../SalesDeskKpiCards';
import { salesDeskMetricsToKpiItems } from '../../lib/salesdesk-kpi-utils';
import {
  SD_FORM_INPUT,
  SD_PAGE_ADD_BUTTON,
  SD_PAGE_HEADER_ROW,
  SD_PAGE_ICON_BOX,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
  SD_SECONDARY_BUTTON,
} from '../../lib/salesdesk-popup-styles';
import {
  salesDeskPageShellClass,
  enumToSelectOptions,
  formatDate,
  NONE_SELECT_VALUE,
  withNoneOption,
} from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  salesDeskProjectFormSchema,
  toSalesDeskProjectFormValues,
  type SalesDeskProjectFormValues,
} from '../../types/salesdesk-schemas';
import { PriorityBadge, TaskStatusBadge } from './salesdesk-badges';

type ProjectViewMode = 'trello' | 'list';

export function SalesDeskProjeTakibiPage(): ReactElement {
  const authUser = useAuthStore((state) => state.user);
  const listPage = useSalesDeskListPage();
  const [viewMode, setViewMode] = useState<ProjectViewMode>('trello');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskTaskDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskTaskDto | null>(null);
  const [defaultTeam, setDefaultTeam] = useState<SalesDeskProjectTeamId>('Proje');
  const [detailProject, setDetailProject] = useState<SalesDeskTaskDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [trelloFilter, setTrelloFilter] = useState<ProjectTrelloFilterId>('all');
  const [hideCompleted, setHideCompleted] = useState(false);

  const listParams = useMemo(
    () => ({
      ...listPage.listParams,
      sortBy: 'DueDate',
      sortDirection: 'asc' as const,
      ...(viewMode === 'trello'
        ? { pageNumber: 1, pageSize: 200, search: listPage.listParams.search }
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

  const rows = useMemo(() => data?.data ?? [], [data?.data]);
  const projectStats = data?.projectStats;
  const statusCounts = useMemo(() => computeProjectStatusCounts(rows), [rows]);
  const listError = isError ? (error as Error | null) : null;
  const todayKey = new Date().toISOString().slice(0, 10);

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );
  const userOptions = withNoneOption(
    (users ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );
  const teamOptions = useMemo(() => getSalesDeskProjectTeamOptions(), []);
  const phaseOptions = useMemo(() => withNoneOption(getSalesDeskProjectPhaseOptions()), []);

  const openCreateForm = (teamId: SalesDeskProjectTeamId = 'Proje'): void => {
    setDefaultTeam(teamId);
    setEditing(null);
    setFormOpen(true);
  };

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
      projectTeam: values.projectTeam || defaultTeam,
    };

    if (editing) {
      await updateProject.mutateAsync({ id: editing.id, values: payload });
      return;
    }
    await createProject.mutateAsync(payload);
    setFormOpen(false);
  };

  const handleMoveProject = async (
    project: SalesDeskTaskDto,
    target: ProjectTrelloMoveTarget
  ): Promise<void> => {
    const values = toSalesDeskProjectFormValues(project);
    values.status = String(target.status);
    values.projectTeam = target.teamId;
    await updateProject.mutateAsync({ id: project.id, values });
    appendProjectToColumnOrder(target.teamId, target.status, project.id);
    toast.success('Kart tasindi.');
  };

  const handleQuickAddProject = async (
    title: string,
    teamId: SalesDeskProjectTeamId,
    status: SalesDeskTaskStatus
  ): Promise<void> => {
    if (!authUser?.id) {
      toast.error('Atanan kullanici bulunamadi.');
      return;
    }
    const created = await createProject.mutateAsync({
      title,
      projectTeam: teamId,
      status: String(status),
      priority: '2',
      assignedUserId: String(authUser.id),
      projectPhase: '',
      dueDate: '',
      description: '',
    });
    appendProjectToColumnOrder(teamId, status, created.id);
    toast.success('Kart eklendi.');
  };

  const handleDetailSave = async (values: SalesDeskProjectFormValues, _meta: ProjectCardMeta): Promise<void> => {
    if (!detailProject) return;

    const assignedUserId =
      values.assignedUserId && values.assignedUserId !== NONE_SELECT_VALUE
        ? values.assignedUserId
        : authUser?.id
          ? String(authUser.id)
          : NONE_SELECT_VALUE;

    if (!assignedUserId || assignedUserId === NONE_SELECT_VALUE) {
      toast.error('Atanan kullanici bulunamadi.');
      throw new Error('Atanan kullanici bulunamadi.');
    }

    const payload: SalesDeskProjectFormValues = {
      ...values,
      assignedUserId,
    };

    const previousAssignee = detailProject.assignedUserId;
    await updateProject.mutateAsync({ id: detailProject.id, values: payload });

    const nextAssignee = Number(assignedUserId);
    if (Number.isFinite(nextAssignee) && nextAssignee !== previousAssignee) {
      void sendBackendNoteNotification({
        title: 'Size proje atandi',
        message: `${values.title} projesi size atandi.`,
        channel: 'Web',
        severity: 'info',
        recipientUserId: nextAssignee,
        relatedEntityType: 'SalesDeskProject',
        relatedEntityId: detailProject.id,
        actionUrl: '/salesdesk/proje-takibi',
      });
    }

    setDetailOpen(false);
  };

  const viewToggle = (
    <div className="inline-flex w-full rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)]/50 p-1 sm:w-auto">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-11 min-h-[44px] flex-1 rounded-lg px-3 text-xs font-semibold sm:h-9 sm:flex-none',
          viewMode === 'trello' && 'bg-indigo-500/15 text-indigo-200'
        )}
        onClick={() => setViewMode('trello')}
      >
        <LayoutGrid className="mr-1.5 h-4 w-4" />
        Trello
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={cn(
          'h-11 min-h-[44px] flex-1 rounded-lg px-3 text-xs font-semibold sm:h-9 sm:flex-none',
          viewMode === 'list' && 'bg-indigo-500/15 text-indigo-200'
        )}
        onClick={() => setViewMode('list')}
      >
        <List className="mr-1.5 h-4 w-4" />
        Liste
      </Button>
    </div>
  );

  const formDialog = (
    <SalesDeskEntityForm
      open={formOpen}
      onOpenChange={setFormOpen}
      title={editing ? 'Projeyi Duzenle' : 'Yeni Proje'}
      description="Projeyi ekip panosuna ekleyin; kartlari surukleyerek durumunu guncelleyin."
      schema={salesDeskProjectFormSchema}
      defaultValues={{
        ...toSalesDeskProjectFormValues(),
        projectTeam: defaultTeam,
      }}
      entity={editing}
      mapEntityToForm={(entity) => toSalesDeskProjectFormValues(entity as SalesDeskTaskDto)}
      onSubmit={handleSubmit}
      isLoading={createProject.isPending || updateProject.isPending}
      validateMode="onSubmit"
      fields={[
        { name: 'title', label: 'Proje Adi', required: true, colSpan: 2 },
        {
          name: 'projectTeam',
          label: 'Ekip',
          type: 'select',
          options: teamOptions,
          required: true,
        },
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
  );

  if (viewMode === 'trello') {
    return (
      <div className={salesDeskPageShellClass}>
        <div className={SD_PAGE_HEADER_ROW}>
          <div className="flex min-w-0 items-start gap-3">
            <div className={SD_PAGE_ICON_BOX}>
              <FolderKanban size={22} />
            </div>
            <div className="min-w-0 space-y-1">
              <h1 className={SD_PAGE_TITLE}>Proje Takibi</h1>
              <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
                <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
                Trello mantigi: 3 ekip panosu, surukle-birak ile durum guncelleme
              </p>
            </div>
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            {viewToggle}
            <Button
              type="button"
              variant="outline"
              className={cn(SD_SECONDARY_BUTTON, 'w-full sm:w-auto')}
              onClick={() => refetch()}
              disabled={isFetching}
            >
              <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} />
              Yenile
            </Button>
            <Button type="button" variant="ghost" className={SD_PAGE_ADD_BUTTON} onClick={() => openCreateForm()}>
              <Plus className="h-4 w-4" />
              Yeni Proje
            </Button>
          </div>
        </div>

        <SalesDeskKpiCards
          isLoading={isPending && !isError}
          items={salesDeskMetricsToKpiItems([
            { label: 'Toplam', value: data?.totalCount ?? rows.length, tone: 'blue' },
            { label: 'Aktif', value: projectStats?.active ?? 0, tone: 'cyan' },
            { label: 'Devam Eden', value: projectStats?.inProgress ?? 0, tone: 'yellow' },
            { label: 'Gecikmis', value: projectStats?.overdue ?? 0, tone: 'red' },
          ])}
        />

        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
          <Input
            value={listPage.searchTerm}
            onChange={(event) => listPage.setSearchTerm(event.target.value)}
            placeholder="Proje ara..."
            className={cn(SD_FORM_INPUT, 'h-11 w-full pl-9 sm:max-w-md')}
          />
        </div>

        <SalesDeskProjectStatusPipeline
          counts={statusCounts}
          total={data?.totalCount ?? rows.length}
        />

        {isError ? (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            {(error as Error)?.message || 'Projeler yuklenemedi.'}
          </div>
        ) : null}

        <SalesDeskProjectTrelloHub
          rows={rows}
          userNameById={userNameById}
          currentUserId={authUser?.id ?? null}
          onOpenProject={(project) => {
            setDetailProject(project);
            setDetailOpen(true);
          }}
          onMoveProject={handleMoveProject}
          onQuickAddProject={handleQuickAddProject}
          onAddProject={openCreateForm}
          isLoading={isPending && !isError}
          isMoving={updateProject.isPending || createProject.isPending}
          filterId={trelloFilter}
          onFilterChange={setTrelloFilter}
          hideCompleted={hideCompleted}
          onHideCompletedChange={setHideCompleted}
        />

        <SalesDeskProjectTrelloDetailSheet
          project={detailProject}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          userNameById={userNameById}
          customerOptions={customerOptions}
          userOptions={userOptions}
          onSave={handleDetailSave}
          onDelete={(project) => {
            setDetailOpen(false);
            setDeleting(project);
          }}
          isSaving={updateProject.isPending}
        />

        {formDialog}

        <SalesDeskDeleteDialog
          open={deleting != null}
          onOpenChange={(open) => !open && setDeleting(null)}
          title="Projeyi sil"
          description={
            deleting
              ? buildSalesDeskDeleteDescription(deleting.title)
              : 'Bu islem geri alinamaz.'
          }
          onConfirm={async () => {
            if (!deleting) return;
            await deleteProject.mutateAsync(deleting.id);
            removeProjectFromAllColumnOrders(deleting.id);
            setDeleting(null);
          }}
          isDeleting={deleteProject.isPending}
        />
      </div>
    );
  }

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-proje-takibi"
      title="Proje Takibi"
      subtitle="Proje gorevlerini ekip, durum ve termin bazinda yonetin"
      tableTitle="Proje Listesi"
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
          key: 'team',
          header: 'EKIP',
          render: (row) => getSalesDeskProjectTeamLabel(parseSalesDeskProjectTeam(row.groupName)),
        },
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
      isError={isError}
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
      onAdd={() => openCreateForm()}
      onEdit={(row) => {
        setEditing(row);
        setFormOpen(true);
      }}
      onDeleteRequest={setDeleting}
      deletingRow={deleting}
      onDeleteConfirm={async () => {
        if (!deleting) return;
        await deleteProject.mutateAsync(deleting.id);
        removeProjectFromAllColumnOrders(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteProject.isPending}
      deleteTitle="Projeyi sil"
      deleteLabel={(row) => row.title}
      mobilePrimaryKey="title"
      mobileDetailKeys={['team', 'phase', 'status', 'priority', 'assignedUser', 'customer', 'dueDate']}
      formDialog={formDialog}
    />
  );
}
