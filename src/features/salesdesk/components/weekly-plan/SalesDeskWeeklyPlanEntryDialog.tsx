import { type ReactElement, useEffect, useState } from 'react';
import { CalendarClock, CalendarPlus, Loader2, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SD_SELECT_CONTENT } from '../../lib/salesdesk-popup-styles';
import {
  SD_CREATE_FORM_INPUT_CLASSNAME,
  SD_CREATE_FORM_LABEL_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import {
  SD_DOCUMENT_BUTTON_SAVE,
  SD_DOCUMENT_LINE_TOOLBAR_ICON,
} from '../../lib/salesdesk-document-button-styles';
import { enumToSelectOptions } from '../../lib/salesdesk-shared';
import { TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import { WEEKLY_ACTIVITY_TYPES, WEEKLY_PLAN_GROUP } from '../../lib/salesdesk-weekly-plan';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import type { SalesDeskUserOption } from '../../hooks/useSalesDeskModules';
import type { TaskFormValues } from '../../types/salesdesk-schemas';
import { cn } from '@/lib/utils';

export interface WeeklyPlanDialogInitial {
  userId?: number;
  dateKey?: string;
}

interface SalesDeskWeeklyPlanEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userOptions: SalesDeskUserOption[];
  customerOptions?: Array<{ value: string; label: string }>;
  editingTask?: SalesDeskTaskDto | null;
  initial?: WeeklyPlanDialogInitial;
  onSubmit: (values: TaskFormValues, editingId: number | null) => Promise<void>;
  onDelete?: (id: number) => Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
}

interface DraftState {
  assignedUserId: string;
  dueDate: string;
  activity: string;
  status: string;
  customerId: string;
  description: string;
}

const EMPTY_DRAFT: DraftState = {
  assignedUserId: '',
  dueDate: '',
  activity: '',
  status: '1',
  customerId: '',
  description: '',
};

export function SalesDeskWeeklyPlanEntryDialog({
  open,
  onOpenChange,
  userOptions,
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
        assignedUserId: editingTask.assignedUserId ? String(editingTask.assignedUserId) : '',
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
      assignedUserId: initial?.userId ? String(initial.userId) : '',
      dueDate: initial?.dateKey ?? '',
    });
  }, [open, editingTask, initial?.userId, initial?.dateKey]);

  const isValid = Boolean(draft.assignedUserId) && Boolean(draft.dueDate) && Boolean(draft.activity);

  const handleSave = async (): Promise<void> => {
    if (!isValid) return;
    const values: TaskFormValues = {
      title: draft.activity,
      description: draft.description.trim() || undefined,
      groupName: WEEKLY_PLAN_GROUP,
      customerId: draft.customerId || undefined,
      assignedUserId: draft.assignedUserId || undefined,
      priority: '2',
      status: draft.status,
      dueDate: draft.dueDate || undefined,
    };
    await onSubmit(values, editingTask?.id ?? null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden !p-0 sm:max-w-[520px]',
          'rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)]',
          'shadow-2xl shadow-black/50'
        )}
      >
        <div className="sd-doc-section-header relative flex items-center gap-3.5 border-b border-[var(--crm-app-border)] px-6 py-5">
          <div className={cn(SD_DOCUMENT_LINE_TOOLBAR_ICON, 'h-11 w-11')}>
            {editingTask ? <CalendarClock className="h-5 w-5" /> : <CalendarPlus className="h-5 w-5" />}
          </div>
          <div className="min-w-0">
            <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
              {editingTask ? 'Plan Gorevini Duzenle' : 'Haftalik Plana Gorev Ekle'}
            </DialogTitle>
            <DialogDescription className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">
              Kullanici, gun ve aktivite secerek haftalik plana ekleyin.
            </DialogDescription>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]">
                  <User className="h-3.5 w-3.5" />
                </span>
                Kullanici
              </Label>
              <Select
                value={draft.assignedUserId || undefined}
                onValueChange={(value) => setDraft((current) => ({ ...current, assignedUserId: value }))}
              >
                <SelectTrigger className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'w-full')}>
                  <SelectValue placeholder="Kullanici secin" />
                </SelectTrigger>
                <SelectContent className={SD_SELECT_CONTENT}>
                  {userOptions.map((option) => (
                    <SelectItem key={option.id} value={String(option.id)}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Gun</Label>
              <Input
                type="date"
                className={SD_CREATE_FORM_INPUT_CLASSNAME}
                value={draft.dueDate}
                onChange={(event) => setDraft((current) => ({ ...current, dueDate: event.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Aktivite</Label>
            <Select
              value={draft.activity || undefined}
              onValueChange={(value) => setDraft((current) => ({ ...current, activity: value }))}
            >
              <SelectTrigger className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'w-full')}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Durum</Label>
              <Select
                value={draft.status}
                onValueChange={(value) => setDraft((current) => ({ ...current, status: value }))}
              >
                <SelectTrigger className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'w-full')}>
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
              <div>
                <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Cari (opsiyonel)</Label>
                <Select
                  value={draft.customerId || undefined}
                  onValueChange={(value) => setDraft((current) => ({ ...current, customerId: value }))}
                >
                  <SelectTrigger className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'w-full')}>
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
          </div>

          <div>
            <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>Not (opsiyonel)</Label>
            <Textarea
              className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'min-h-[80px] h-auto resize-y py-3')}
              value={draft.description}
              placeholder="Kisa aciklama..."
              onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-4">
          <div>
            {editingTask && onDelete ? (
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
            ) : null}
          </div>
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" className="h-10 rounded-xl px-5" onClick={() => onOpenChange(false)}>
              Iptal
            </Button>
            <Button
              type="button"
              disabled={!isValid || isSaving}
              className={cn('h-10 rounded-xl px-6 font-bold', SD_DOCUMENT_BUTTON_SAVE)}
              onClick={handleSave}
            >
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {editingTask ? 'Guncelle' : 'Ekle'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
