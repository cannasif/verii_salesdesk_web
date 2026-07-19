import { type ReactElement, useEffect, useMemo, useState } from 'react';
import {
  CalendarClock,
  CalendarDays,
  CalendarPlus,
  FileText,
  Loader2,
  Trash2,
  User,
  UsersRound,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import {
  SD_FORM_FOCUS_GLOW,
  SD_FORM_GRID_MD,
  SD_FORM_INPUT_MD,
  SD_FORM_MESSAGE,
  SD_SELECT_CONTENT,
} from '../../lib/salesdesk-popup-styles';
import { enumToSelectOptions } from '../../lib/salesdesk-shared';
import { TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  buildWeeklyPlanDescription,
  formatWeeklyPlanDisplayName,
  parseWeeklyPlanAttendeeIds,
  parseWeeklyPlanGroupAssignee,
  stripWeeklyPlanAttendeesMarker,
  WEEKLY_ACTIVITY_TYPES,
  WEEKLY_PLAN_GROUP,
  weeklyPlanGroupAssigneeTag,
} from '../../lib/salesdesk-weekly-plan';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import type { SalesDeskUserOption } from '../../hooks/useSalesDeskModules';
import type { SalesDeskGroupDto } from '../../types/salesdesk-group-types';
import type { TaskFormValues } from '../../types/salesdesk-schemas';
import { SalesDeskFormDialog } from '../SalesDeskFormDialog';
import { SalesDeskFormFieldLabel } from '../SalesDeskFormFieldLabel';

export interface WeeklyPlanDialogInitial {
  userId?: number;
  groupId?: number;
  dateKey?: string;
}

interface SalesDeskWeeklyPlanEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userOptions: SalesDeskUserOption[];
  groupOptions: SalesDeskGroupDto[];
  customerOptions?: Array<{ value: string; label: string }>;
  editingTask?: SalesDeskTaskDto | null;
  initial?: WeeklyPlanDialogInitial;
  onSubmit: (values: TaskFormValues, editingId: number | null) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
}

type AssigneeMode = 'users' | 'group';

interface DraftState {
  assigneeMode: AssigneeMode;
  selectedUserIds: number[];
  groupId: string;
  dueDate: string;
  activity: string;
  status: string;
  customerId: string;
  description: string;
}

const EMPTY_DRAFT: DraftState = {
  assigneeMode: 'users',
  selectedUserIds: [],
  groupId: '',
  dueDate: '',
  activity: '',
  status: '1',
  customerId: '',
  description: '',
};

function WeeklyPlanUserMultiSelect({
  users,
  value,
  onChange,
  disabled = false,
}: {
  users: SalesDeskUserOption[];
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}): ReactElement {
  const selectedIds = value ?? [];

  const handleToggle = (id: number, checked: boolean): void => {
    if (checked) {
      if (selectedIds.includes(id)) return;
      onChange([...selectedIds, id]);
      return;
    }
    onChange(selectedIds.filter((item) => item !== id));
  };

  return (
    <div className="custom-scrollbar max-h-52 space-y-1 overflow-y-auto rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] p-2">
      {users.length === 0 ? (
        <p className="px-2 py-4 text-center text-sm text-[var(--crm-app-text-muted)]">Kullanici bulunamadi.</p>
      ) : (
        users.map((user) => {
          const selected = selectedIds.includes(user.id);
          const displayName = formatWeeklyPlanDisplayName(user.name);
          return (
            <label
              key={user.id}
              className={cn(
                'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors',
                selected
                  ? 'bg-[var(--crm-brand-soft)] ring-1 ring-[var(--crm-brand-primary)]/30'
                  : 'hover:bg-[var(--crm-app-panel-muted)]',
                disabled && 'cursor-not-allowed opacity-60'
              )}
            >
              <Checkbox
                checked={selected}
                disabled={disabled}
                onCheckedChange={(checked) => handleToggle(user.id, checked === true)}
              />
              <span className="flex-1 text-sm font-medium text-slate-100">{displayName}</span>
            </label>
          );
        })
      )}
    </div>
  );
}

export function SalesDeskWeeklyPlanEntryDialog({
  open,
  onOpenChange,
  userOptions,
  groupOptions,
  customerOptions = [],
  editingTask,
  initial,
  onSubmit,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: SalesDeskWeeklyPlanEntryDialogProps): ReactElement {
  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const statusOptions = enumToSelectOptions(TASK_STATUS_LABELS);

  useEffect(() => {
    if (!open) return;
    if (editingTask) {
      const groupId = parseWeeklyPlanGroupAssignee(editingTask.groupName);
      if (groupId != null) {
        setDraft({
          assigneeMode: 'group',
          selectedUserIds: [],
          groupId: String(groupId),
          dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : initial?.dateKey ?? '',
          activity: editingTask.title ?? '',
          status: String(editingTask.status ?? 1),
          customerId: editingTask.customerId ? String(editingTask.customerId) : '',
          description: stripWeeklyPlanAttendeesMarker(editingTask.description),
        });
        return;
      }
      setDraft({
        assigneeMode: 'users',
        selectedUserIds: parseWeeklyPlanAttendeeIds(editingTask),
        groupId: '',
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : initial?.dateKey ?? '',
        activity: editingTask.title ?? '',
        status: String(editingTask.status ?? 1),
        customerId: editingTask.customerId ? String(editingTask.customerId) : '',
        description: stripWeeklyPlanAttendeesMarker(editingTask.description),
      });
      return;
    }
    const selectedUserIds = initial?.userId ? [initial.userId] : [];
    setDraft({
      ...EMPTY_DRAFT,
      assigneeMode: initial?.groupId ? 'group' : 'users',
      selectedUserIds,
      groupId: initial?.groupId ? String(initial.groupId) : '',
      dueDate: initial?.dateKey ?? '',
    });
  }, [open, editingTask, initial]);

  const isValid = useMemo(() => {
    if (!draft.dueDate || !draft.activity) return false;
    if (draft.assigneeMode === 'group') return Boolean(draft.groupId);
    return draft.selectedUserIds.length > 0;
  }, [draft]);

  const handleSave = async (): Promise<void> => {
    if (!isValid) return;

    if (draft.assigneeMode === 'group') {
      const groupId = Number(draft.groupId);
      if (!Number.isFinite(groupId) || groupId <= 0) return;
      const values: TaskFormValues = {
        title: draft.activity,
        description: draft.description.trim() || undefined,
        groupName: weeklyPlanGroupAssigneeTag(groupId),
        customerId: draft.customerId || undefined,
        assignedUserId: undefined,
        priority: '2',
        status: draft.status,
        dueDate: draft.dueDate || undefined,
      };
      await onSubmit(values, editingTask?.id ?? null);
      return;
    }

    const attendeeIds = [...new Set(draft.selectedUserIds)];
    const primaryUserId = attendeeIds[0];
    if (!primaryUserId) return;

    const values: TaskFormValues = {
      title: draft.activity,
      description: buildWeeklyPlanDescription(attendeeIds, draft.description),
      groupName: WEEKLY_PLAN_GROUP,
      customerId: draft.customerId || undefined,
      assignedUserId: String(primaryUserId),
      priority: '2',
      status: draft.status,
      dueDate: draft.dueDate || undefined,
    };

    await onSubmit(values, editingTask?.id ?? null);
  };

  return (
    <SalesDeskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editingTask ? 'Plan Gorevini Duzenle' : 'Haftalik Plana Gorev Ekle'}
      description="Birden fazla kisi veya bir grup secebilir, gun ve aktivite atayabilirsiniz."
      icon={editingTask ? CalendarClock : CalendarPlus}
      submitLabel={editingTask ? 'Guncelle' : 'Ekle'}
      isSaving={isSaving}
      submitDisabled={!isValid}
      onSubmit={() => {
        void handleSave();
      }}
      maxWidthClass="!max-w-[640px]"
      footerLeading={
        editingTask && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="h-10 rounded-xl px-3 text-red-400 hover:bg-red-500/10 hover:text-red-300"
            disabled={isDeleting}
            onClick={() => onDelete(editingTask.id)}
          >
            {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="ml-2">Sil</span>
          </Button>
        ) : undefined
      }
    >
      <div className={SD_FORM_GRID_MD}>
        <div className="space-y-2 sm:col-span-2">
          <SalesDeskFormFieldLabel icon={User} required>
            Atanan
          </SalesDeskFormFieldLabel>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant={draft.assigneeMode === 'users' ? 'default' : 'outline'}
              size="sm"
              className="h-9 rounded-lg"
              onClick={() => setDraft((current) => ({ ...current, assigneeMode: 'users' }))}
            >
              Kisiler
            </Button>
            {groupOptions.length > 0 ? (
              <Button
                type="button"
                variant={draft.assigneeMode === 'group' ? 'default' : 'outline'}
                size="sm"
                className="h-9 rounded-lg"
                onClick={() => setDraft((current) => ({ ...current, assigneeMode: 'group' }))}
              >
                Grup
              </Button>
            ) : null}
          </div>

          {draft.assigneeMode === 'users' ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--crm-app-text-muted)]">
                Birden fazla kisi secebilirsiniz ({draft.selectedUserIds.length} secili)
              </p>
              <WeeklyPlanUserMultiSelect
                users={userOptions}
                value={draft.selectedUserIds}
                onChange={(selectedUserIds) => setDraft((current) => ({ ...current, selectedUserIds }))}
                disabled={isSaving}
              />
            </div>
          ) : (
            <Select
              value={draft.groupId || undefined}
              onValueChange={(value) => setDraft((current) => ({ ...current, groupId: value }))}
            >
              <SelectTrigger className={SD_FORM_INPUT_MD}>
                <SelectValue placeholder="Grup secin" />
              </SelectTrigger>
              <SelectContent className={SD_SELECT_CONTENT}>
                {groupOptions.map((option) => (
                  <SelectItem key={option.id} value={String(option.id)}>
                    <span className="inline-flex items-center gap-2">
                      <UsersRound className="h-3.5 w-3.5 text-[var(--crm-brand-primary)]" />
                      {formatWeeklyPlanDisplayName(option.name)}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="space-y-0">
          <SalesDeskFormFieldLabel icon={CalendarDays} required>
            Gun
          </SalesDeskFormFieldLabel>
          <Input
            type="date"
            className={SD_FORM_INPUT_MD}
            value={draft.dueDate}
            onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
          />
        </div>

        <div className="space-y-0 sm:col-span-2">
          <SalesDeskFormFieldLabel icon={CalendarPlus} required>
            Aktivite
          </SalesDeskFormFieldLabel>
          <Select
            value={draft.activity || undefined}
            onValueChange={(value) => setDraft((current) => ({ ...current, activity: value }))}
          >
            <SelectTrigger className={SD_FORM_INPUT_MD}>
              <SelectValue placeholder="Aktivite secin" />
            </SelectTrigger>
            <SelectContent className={SD_SELECT_CONTENT}>
              {WEEKLY_ACTIVITY_TYPES.map((activity) => (
                <SelectItem key={activity.value} value={activity.value}>
                  <span className="flex items-center gap-2">
                    <activity.icon className="h-3.5 w-3.5" />
                    {activity.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-0">
          <SalesDeskFormFieldLabel icon={FileText}>Durum</SalesDeskFormFieldLabel>
          <Select
            value={draft.status}
            onValueChange={(value) => setDraft((current) => ({ ...current, status: value }))}
          >
            <SelectTrigger className={SD_FORM_INPUT_MD}>
              <SelectValue placeholder="Durum secin" />
            </SelectTrigger>
            <SelectContent className={SD_SELECT_CONTENT}>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {customerOptions.length > 0 ? (
          <div className="space-y-0">
            <SalesDeskFormFieldLabel icon={UsersRound}>Cari (opsiyonel)</SalesDeskFormFieldLabel>
            <Select
              value={draft.customerId || undefined}
              onValueChange={(value) => setDraft((current) => ({ ...current, customerId: value }))}
            >
              <SelectTrigger className={SD_FORM_INPUT_MD}>
                <SelectValue placeholder="Cari secin" />
              </SelectTrigger>
              <SelectContent className={SD_SELECT_CONTENT}>
                {customerOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <div className="space-y-0 sm:col-span-2">
          <SalesDeskFormFieldLabel icon={FileText}>Not (opsiyonel)</SalesDeskFormFieldLabel>
          <Textarea
            className={`min-h-[100px] w-full resize-y rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-900 outline-none dark:text-slate-100 ${SD_FORM_FOCUS_GLOW} transition-[color,box-shadow,border-color] duration-200`}
            value={draft.description}
            placeholder="Kisa aciklama..."
            onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
          />
        </div>
      </div>
      {!isValid ? (
        <p className={SD_FORM_MESSAGE}>
          {draft.assigneeMode === 'users'
            ? 'En az bir kisi, gun ve aktivite zorunludur.'
            : 'Grup, gun ve aktivite zorunludur.'}
        </p>
      ) : null}
    </SalesDeskFormDialog>
  );
}
