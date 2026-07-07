import { type ReactElement, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, Loader2, Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import {
  useCreateSalesDeskTask,
  useDeleteSalesDeskTask,
  useSalesDeskCustomerOptions,
  useSalesDeskTaskList,
  useSalesDeskUserOptions,
  useUpdateSalesDeskTask,
} from '../../hooks/useSalesDeskModules';
import { withNoneOption } from '../../lib/salesdesk-shared';
import {
  addDays,
  buildWeekDays,
  buildWeeklyPlanIndex,
  formatWeekRange,
  getWeekStart,
  isWeeklyPlanTask,
  WEEKLY_ACTIVITY_TYPES,
  type WeeklyPlanAssignee,
} from '../../lib/salesdesk-weekly-plan';
import { useSalesDeskGroupList } from '../../hooks/useSalesDeskGroups';
import { SD_PAGE_ADD_BUTTON, SD_PAGE_HEADER_ROW, SD_PAGE_ICON_BOX, SD_PAGE_PULSE, SD_PAGE_TITLE } from '../../lib/salesdesk-popup-styles';
import { buildSalesDeskDeleteDescription, SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import type { TaskFormValues } from '../../types/salesdesk-schemas';
import { SalesDeskWeeklyPlanGrid } from '../weekly-plan/SalesDeskWeeklyPlanGrid';
import {
  SalesDeskWeeklyPlanEntryDialog,
  type WeeklyPlanDialogInitial,
} from '../weekly-plan/SalesDeskWeeklyPlanEntryDialog';

export function SalesDeskWeeklyPlanPage(): ReactElement {
  const authUser = useAuthStore((state) => state.user);
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<SalesDeskTaskDto | null>(null);
  const [dialogInitial, setDialogInitial] = useState<WeeklyPlanDialogInitial>({});
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const {
    data: users,
    isPending: usersPending,
    isError: usersError,
    error: usersFetchError,
  } = useSalesDeskUserOptions();
  const {
    data: groups,
    isError: groupsError,
    error: groupsFetchError,
  } = useSalesDeskGroupList();
  const { data: customers } = useSalesDeskCustomerOptions();
  const {
    data: taskData,
    isPending: tasksPending,
    isError: tasksError,
    error: tasksFetchError,
  } = useSalesDeskTaskList({ pageNumber: 1, pageSize: 500, sortBy: 'DueDate', sortDirection: 'asc' });

  const createTask = useCreateSalesDeskTask();
  const updateTask = useUpdateSalesDeskTask();
  const deleteTask = useDeleteSalesDeskTask();

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const planIndex = useMemo(() => {
    const planTasks = (taskData?.data ?? []).filter(isWeeklyPlanTask);
    return buildWeeklyPlanIndex(planTasks);
  }, [taskData?.data]);

  const userOptions = users ?? [];
  const groupOptions = groups ?? [];
  const customerOptions = useMemo(
    () => withNoneOption((customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))),
    [customers]
  );

  const planCount = useMemo(() => {
    const weekKeys = new Set(weekDays.map((day) => day.dateKey));
    let count = 0;
    planIndex.users.forEach((task) => {
      if (task.dueDate && weekKeys.has(task.dueDate.slice(0, 10))) count += 1;
    });
    planIndex.groups.forEach((task) => {
      if (task.dueDate && weekKeys.has(task.dueDate.slice(0, 10))) count += 1;
    });
    return count;
  }, [planIndex, weekDays]);

  const openDialog = (assignee: WeeklyPlanAssignee, dateKey: string, task: SalesDeskTaskDto | null): void => {
    setEditingTask(task);
    setDialogInitial(
      assignee.kind === 'group'
        ? { groupId: assignee.id, dateKey }
        : { userId: assignee.id, dateKey }
    );
    setDialogOpen(true);
  };

  const openNewDialog = (): void => {
    setEditingTask(null);
    setDialogInitial({ dateKey: weekDays[0]?.dateKey });
    setDialogOpen(true);
  };

  const handleSubmit = async (values: TaskFormValues, editingId: number | null): Promise<void> => {
    if (editingId) {
      await updateTask.mutateAsync({ id: editingId, values });
    } else {
      await createTask.mutateAsync(values);
    }
    setDialogOpen(false);
  };

  const handleDeleteRequest = async (id: number): Promise<void> => {
    setDeletingTaskId(id);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (deletingTaskId == null) return;
    await deleteTask.mutateAsync(deletingTaskId);
    setDeletingTaskId(null);
    setDialogOpen(false);
  };

  const isLoading = usersPending || tasksPending;
  const loadErrorMessage = tasksError
    ? (tasksFetchError as Error)?.message || 'Gorevler yuklenemedi.'
    : usersError
      ? (usersFetchError as Error)?.message || 'Kullanicilar yuklenemedi.'
      : null;
  const groupsWarningMessage = groupsError
    ? (groupsFetchError as Error)?.message || 'Gruplar yuklenemedi.'
    : null;

  return (
    <div className="space-y-5 text-slate-100">
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="flex min-w-0 items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0 space-y-1">
            <h1 className={SD_PAGE_TITLE}>Haftalik Plan</h1>
            <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
              <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
              Tum ekibin haftalik aktivitelerini goruntule ve guncelle
            </p>
          </div>
        </div>
        <button type="button" onClick={openNewDialog} className={SD_PAGE_ADD_BUTTON}>
          <Plus size={18} className="mr-2 stroke-[3px]" />
          Yeni Gorev
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-300 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
            aria-label="Onceki hafta"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getWeekStart())}
            className="h-11 min-h-[44px] rounded-lg border border-[var(--crm-app-border)] px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
          >
            Bu Hafta
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            className="flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-300 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
            aria-label="Sonraki hafta"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="w-full text-sm font-semibold text-[var(--crm-brand-accent)] sm:ml-2 sm:w-auto">
            {formatWeekRange(weekStart)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>
            {userOptions.length} kisi · {groupOptions.length} grup · {planCount} planli aktivite
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {WEEKLY_ACTIVITY_TYPES.map((activity) => (
          <span
            key={activity.value}
            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ring-1 ${activity.chipClass}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${activity.dotClass}`} />
            {activity.label}
          </span>
        ))}
      </div>

      {groupsWarningMessage && (
        <div className="rounded-lg border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
          <p>Gruplar yuklenemedi: {groupsWarningMessage}</p>
          <p className="mt-2 text-xs text-amber-100/80">
            Grup satirlari icin uygulamayi `npm run dev` ile baslatin; yerel sunucu otomatik acilir.
          </p>
        </div>
      )}

      {loadErrorMessage && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          <p>{loadErrorMessage}</p>
          {loadErrorMessage === 'Network Error' && (
            <p className="mt-2 text-xs text-rose-100/80">
              API sunucusuna ulasilamiyor. Yerel gelistirmede dev sunucusunu yeniden baslatin; yerel
              backend kullaniyorsaniz proje kokunde `.env` icinde `VITE_API_URL=http://localhost:5000`
              tanimlayin.
            </p>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--crm-brand-accent)]" size={32} />
        </div>
      ) : !loadErrorMessage && userOptions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-12 text-center text-sm text-slate-400">
          Gosterilecek kullanici bulunamadi.
        </div>
      ) : (
        <SalesDeskWeeklyPlanGrid
          users={userOptions}
          groups={groupOptions}
          weekDays={weekDays}
          planIndex={planIndex}
          currentUserId={authUser?.id}
          onCellClick={openDialog}
        />
      )}

      <SalesDeskWeeklyPlanEntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userOptions={userOptions}
        groupOptions={groupOptions}
        customerOptions={customerOptions}
        editingTask={editingTask}
        initial={dialogInitial}
        onSubmit={handleSubmit}
        onDelete={handleDeleteRequest}
        isSaving={createTask.isPending || updateTask.isPending}
        isDeleting={deleteTask.isPending}
      />

      <SalesDeskDeleteDialog
        open={deletingTaskId != null}
        onOpenChange={(open) => !open && setDeletingTaskId(null)}
        title="Gorevi sil"
        description={
          editingTask && deletingTaskId === editingTask.id
            ? buildSalesDeskDeleteDescription(editingTask.title)
            : 'Bu gorevi silmek istediginize emin misiniz? Bu islem geri alinamaz.'
        }
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteTask.isPending}
      />
    </div>
  );
}
