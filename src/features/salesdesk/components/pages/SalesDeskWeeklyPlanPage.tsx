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
  WEEKLY_ACTIVITY_TYPES,
  WEEKLY_PLAN_GROUP,
} from '../../lib/salesdesk-weekly-plan';
import { SD_ADD_BUTTON, SD_PAGE_ICON_BOX } from '../../lib/salesdesk-popup-styles';
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

  const { data: users, isLoading: usersLoading } = useSalesDeskUserOptions();
  const { data: customers } = useSalesDeskCustomerOptions();
  const {
    data: taskData,
    isLoading: tasksLoading,
    isError,
    error,
  } = useSalesDeskTaskList({ pageNumber: 1, pageSize: 500, sortBy: 'DueDate', sortDirection: 'asc' });

  const createTask = useCreateSalesDeskTask();
  const updateTask = useUpdateSalesDeskTask();
  const deleteTask = useDeleteSalesDeskTask();

  const weekDays = useMemo(() => buildWeekDays(weekStart), [weekStart]);

  const planIndex = useMemo(() => {
    const planTasks = (taskData?.data ?? []).filter((task) => task.groupName === WEEKLY_PLAN_GROUP);
    return buildWeeklyPlanIndex(planTasks);
  }, [taskData?.data]);

  const userOptions = users ?? [];
  const customerOptions = useMemo(
    () => withNoneOption((customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))),
    [customers]
  );

  const planCount = useMemo(() => {
    const weekKeys = new Set(weekDays.map((day) => day.dateKey));
    let count = 0;
    planIndex.forEach((task) => {
      if (task.dueDate && weekKeys.has(task.dueDate.slice(0, 10))) count += 1;
    });
    return count;
  }, [planIndex, weekDays]);

  const openDialog = (userId: number, dateKey: string, task: SalesDeskTaskDto | null): void => {
    setEditingTask(task);
    setDialogInitial({ userId, dateKey });
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

  const handleDelete = async (id: number): Promise<void> => {
    await deleteTask.mutateAsync(id);
    setDialogOpen(false);
  };

  const isLoading = usersLoading || tasksLoading;

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className={SD_PAGE_ICON_BOX}>
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-50">Haftalik Plan</h1>
            <p className="mt-1 text-sm text-slate-400">
              Tum ekibin haftalik aktivitelerini goruntule ve guncelle
            </p>
          </div>
        </div>
        <button type="button" onClick={openNewDialog} className={SD_ADD_BUTTON}>
          <Plus size={16} />
          Yeni Gorev
        </button>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, -7))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-300 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
            aria-label="Onceki hafta"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(getWeekStart())}
            className="h-9 rounded-lg border border-[var(--crm-app-border)] px-3 text-sm font-medium text-slate-200 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
          >
            Bu Hafta
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((current) => addDays(current, 7))}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] text-slate-300 transition-colors hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]"
            aria-label="Sonraki hafta"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <span className="ml-2 text-sm font-semibold text-[var(--crm-brand-accent)]">
            {formatWeekRange(weekStart)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <span>{userOptions.length} kisi · {planCount} planli aktivite</span>
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

      {isError && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(error as Error)?.message || 'Plan yuklenemedi.'}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-[var(--crm-brand-accent)]" size={32} />
        </div>
      ) : userOptions.length === 0 ? (
        <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] px-4 py-12 text-center text-sm text-slate-400">
          Gosterilecek kullanici bulunamadi.
        </div>
      ) : (
        <SalesDeskWeeklyPlanGrid
          users={userOptions}
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
        customerOptions={customerOptions}
        editingTask={editingTask}
        initial={dialogInitial}
        onSubmit={handleSubmit}
        onDelete={handleDelete}
        isSaving={createTask.isPending || updateTask.isPending}
        isDeleting={deleteTask.isPending}
      />
    </div>
  );
}
