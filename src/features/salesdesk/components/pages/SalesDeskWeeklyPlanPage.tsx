import { type ReactElement, useMemo, useState } from 'react';
import { CalendarDays, Loader2, Plus } from 'lucide-react';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import {
  useCreateSalesDeskTask,
  useSalesDeskCustomerOptions,
  useSalesDeskTaskList,
} from '../../hooks/useSalesDeskModules';
import { enumToSelectOptions, formatDate, withNoneOption } from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  taskFormSchema,
  toTaskFormValues,
  type TaskFormValues,
} from '../../types/salesdesk-schemas';
import { PriorityBadge, TaskStatusBadge } from './salesdesk-badges';

const GROUP_COLORS = [
  'border-l-rose-400',
  'border-l-violet-500',
  'border-l-emerald-400',
  'border-l-cyan-400',
  'border-l-amber-400',
];

export function SalesDeskWeeklyPlanPage(): ReactElement {
  const [formOpen, setFormOpen] = useState(false);
  const { data, isLoading, isError, error } = useSalesDeskTaskList({
    pageNumber: 1,
    pageSize: 200,
    sortBy: 'DueDate',
    sortDirection: 'asc',
  });
  const { data: customers } = useSalesDeskCustomerOptions();
  const createTask = useCreateSalesDeskTask();

  const openTasks = useMemo(
    () => (data?.data ?? []).filter((task) => task.status === 1 || task.status === 2),
    [data?.data]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, SalesDeskTaskDto[]>();
    openTasks.forEach((task) => {
      const key = task.groupName?.trim() || 'Grupsuz';
      const list = map.get(key) ?? [];
      list.push(task);
      map.set(key, list);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, 'tr'));
  }, [openTasks]);

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );

  const handleSubmit = async (values: TaskFormValues): Promise<void> => {
    await createTask.mutateAsync(values);
  };

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-violet-400/20 bg-violet-500/15 text-violet-300">
            <CalendarDays size={22} />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-slate-50">Haftalik Plan</h1>
            <p className="mt-1 text-sm text-slate-400">Acik isleri grupla ve panoda takip et</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-violet-500 px-5 text-sm font-semibold text-white hover:bg-violet-400"
        >
          <Plus size={16} />
          Yeni Madde
        </button>
      </div>

      <section className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
        <h2 className="text-lg font-semibold">Acik Isler</h2>
        <p className="text-sm text-slate-400">{openTasks.length} acik is · {grouped.length} grup</p>
      </section>

      {isError && (
        <div className="rounded-lg border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {(error as Error)?.message || 'Gorevler yuklenemedi.'}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="animate-spin text-violet-300" size={32} />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-3">
          {grouped.map(([groupName, tasks], index) => (
            <section key={groupName} className="rounded-xl border border-white/8 bg-slate-900/35 p-4">
              <h3 className="mb-3 text-lg font-semibold">{groupName}</h3>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className={`rounded-lg border border-white/8 border-l-4 ${GROUP_COLORS[index % GROUP_COLORS.length]} bg-slate-800/70 p-4`}
                  >
                    <p className="font-semibold">{task.title}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                      {task.dueDate && <span className="text-xs text-slate-400">{formatDate(task.dueDate)}</span>}
                    </div>
                    {task.customerName && <p className="mt-2 text-sm text-slate-400">{task.customerName}</p>}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <SalesDeskEntityForm
        open={formOpen}
        onOpenChange={setFormOpen}
        title="Yeni Madde"
        description="Haftalik plana yeni gorev ekleyin."
        schema={taskFormSchema}
        defaultValues={toTaskFormValues()}
        onSubmit={handleSubmit}
        isLoading={createTask.isPending}
        fields={[
          { name: 'title', label: 'Baslik', required: true, colSpan: 2 },
          { name: 'groupName', label: 'Grup Adi' },
          { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
          { name: 'priority', label: 'Oncelik', type: 'select', options: enumToSelectOptions(PRIORITY_LABELS), required: true },
          { name: 'status', label: 'Durum', type: 'select', options: enumToSelectOptions(TASK_STATUS_LABELS), required: true },
          { name: 'dueDate', label: 'Son Tarih', type: 'date' },
          { name: 'description', label: 'Aciklama', type: 'textarea', colSpan: 2 },
        ]}
      />
    </div>
  );
}
