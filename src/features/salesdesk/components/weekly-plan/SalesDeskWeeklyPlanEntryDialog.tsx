import { type ReactElement, useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
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
  WEEKLY_ACTIVITY_TYPES,
  WEEKLY_PLAN_GROUP,
  parseWeeklyPlanGroupAssignee,
  weeklyPlanGroupAssigneeTag,
  type WeeklyPlanAssignee,
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

interface DraftState {
  assignee: string;
  dueDate: string;
  activity: string;
  status: string;
  customerId: string;
  description: string;
}

const EMPTY_DRAFT: DraftState = {
  assignee: '',
  dueDate: '',
  activity: '',
  status: '1',
  customerId: '',
  description: '',
};

function assigneeFromTask(task: SalesDeskTaskDto): string {
  const groupId = parseWeeklyPlanGroupAssignee(task.groupName);
  if (groupId != null) return `group:${groupId}`;
  if (task.assignedUserId) return `user:${task.assignedUserId}`;
  return '';
}

function assigneeFromInitial(initial?: WeeklyPlanDialogInitial): string {
  if (initial?.groupId) return `group:${initial.groupId}`;
  if (initial?.userId) return `user:${initial.userId}`;
  return '';
}

function parseAssignee(value: string): WeeklyPlanAssignee | null {
  const [kind, idPart] = value.split(':');
  const id = Number(idPart);
  if (!Number.isFinite(id) || id <= 0) return null;
  if (kind === 'group') return { kind: 'group', id };
  if (kind === 'user') return { kind: 'user', id };
  return null;
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
      setDraft({
        assignee: assigneeFromTask(editingTask),
        dueDate: editingTask.dueDate ? editingTask.dueDate.slice(0, 10) : initial?.dateKey ?? '',
        activity: editingTask.title ?? '',
        status: String(editingTask.status ?? 1),
        customerId: editingTask.customerId ? String(editingTask.customerId) : '',
        description: editingTask.description ?? '',
      });
      return;
    }
    setDraft({
      ...EMPTY_DRAFT,
      assignee: assigneeFromInitial(initial),
      dueDate: initial?.dateKey ?? '',
    });
  }, [open, editingTask, initial]);

  const isValid = Boolean(draft.assignee) && Boolean(draft.dueDate) && Boolean(draft.activity);

  const handleSave = async (): Promise<void> => {
    if (!isValid) return;
    const assignee = parseAssignee(draft.assignee);
    if (!assignee) return;

    const values: TaskFormValues =
      assignee.kind === 'group'
        ? {
            title: draft.activity,
            description: draft.description.trim() || undefined,
            groupName: weeklyPlanGroupAssigneeTag(assignee.id),
            customerId: draft.customerId || undefined,
            assignedUserId: undefined,
            priority: '2',
            status: draft.status,
            dueDate: draft.dueDate || undefined,
          }
        : {
            title: draft.activity,
            description: draft.description.trim() || undefined,
            groupName: WEEKLY_PLAN_GROUP,
            customerId: draft.customerId || undefined,
            assignedUserId: String(assignee.id),
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
      description="Kisi veya grup, gun ve aktivite secerek haftalik plana ekleyin."
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
        <div className="space-y-0">
          <SalesDeskFormFieldLabel icon={User} required>
            Atanan
          </SalesDeskFormFieldLabel>
          <Select
            value={draft.assignee || undefined}
            onValueChange={(value) => setDraft((current) => ({ ...current, assignee: value }))}
          >
            <SelectTrigger className={SD_FORM_INPUT_MD}>
              <SelectValue placeholder="Kisi veya grup secin" />
            </SelectTrigger>
            <SelectContent className={SD_SELECT_CONTENT}>
              <SelectGroup>
                <SelectLabel>Kisiler</SelectLabel>
                {userOptions.map((option) => (
                  <SelectItem key={`user-${option.id}`} value={`user:${option.id}`}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectGroup>
              {groupOptions.length > 0 ? (
                <SelectGroup>
                  <SelectLabel>Gruplar</SelectLabel>
                  {groupOptions.map((option) => (
                    <SelectItem key={`group-${option.id}`} value={`group:${option.id}`}>
                      <span className="inline-flex items-center gap-2">
                        <UsersRound className="h-3.5 w-3.5 text-[var(--crm-brand-primary)]" />
                        {option.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectGroup>
              ) : null}
            </SelectContent>
          </Select>
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
      {!isValid ? <p className={SD_FORM_MESSAGE}>Atanan, gun ve aktivite zorunludur.</p> : null}
    </SalesDeskFormDialog>
  );
}
