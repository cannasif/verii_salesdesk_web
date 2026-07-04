import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckSquare, Tag, Trash2, UserRound, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import {
  getSalesDeskProjectPhaseLabel,
  getSalesDeskProjectPhaseOptions,
  getSalesDeskProjectTeamLabel,
  getSalesDeskProjectTeamOptions,
  isProjectTaskOverdue,
  parseSalesDeskProjectPhase,
  parseSalesDeskProjectTeam,
} from '../../lib/salesdesk-project-tracking';
import {
  PROJECT_LABEL_DEFS,
  embedProjectCardMeta,
  getChecklistProgress,
  parseProjectCardMeta,
  stripProjectCardMeta,
  type ProjectCardMeta,
  type ProjectChecklistItem,
  type ProjectLabelId,
} from '../../lib/salesdesk-project-meta';
import { SD_FORM_INPUT, SD_FORM_LABEL, SD_SECONDARY_BUTTON } from '../../lib/salesdesk-popup-styles';
import { formatDate, NONE_SELECT_VALUE } from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import type { SalesDeskProjectFormValues } from '../../types/salesdesk-schemas';
import { PriorityBadge, TaskStatusBadge } from '../pages/salesdesk-badges';

interface SalesDeskProjectTrelloDetailSheetProps {
  project: SalesDeskTaskDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userNameById: Map<number, string>;
  customerOptions: Array<{ value: string; label: string }>;
  userOptions: Array<{ value: string; label: string }>;
  onSave: (values: SalesDeskProjectFormValues, meta: ProjectCardMeta) => Promise<void>;
  onDelete: (project: SalesDeskTaskDto) => void;
  isSaving?: boolean;
}

function newChecklistItem(text: string): ProjectChecklistItem {
  return { id: `chk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text, done: false };
}

export function SalesDeskProjectTrelloDetailSheet({
  project,
  open,
  onOpenChange,
  userNameById,
  customerOptions,
  userOptions,
  onSave,
  onDelete,
  isSaving = false,
}: SalesDeskProjectTrelloDetailSheetProps): ReactElement {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectTeam, setProjectTeam] = useState('Proje');
  const [projectPhase, setProjectPhase] = useState('');
  const [status, setStatus] = useState('1');
  const [priority, setPriority] = useState('2');
  const [dueDate, setDueDate] = useState('');
  const [assignedUserId, setAssignedUserId] = useState('');
  const [customerId, setCustomerId] = useState('');
  const [meta, setMeta] = useState<ProjectCardMeta>({ labels: [], checklist: [] });
  const [newChecklistText, setNewChecklistText] = useState('');

  useEffect(() => {
    if (!project) return;
    setTitle(project.title);
    setDescription(stripProjectCardMeta(project.description));
    setProjectTeam(parseSalesDeskProjectTeam(project.groupName));
    setProjectPhase(parseSalesDeskProjectPhase(project.groupName));
    setStatus(String(project.status));
    setPriority(String(project.priority));
    setDueDate(project.dueDate?.slice(0, 10) ?? '');
    setAssignedUserId(project.assignedUserId ? String(project.assignedUserId) : '');
    setCustomerId(project.customerId ? String(project.customerId) : '');
    setMeta(parseProjectCardMeta(project.description));
    setNewChecklistText('');
  }, [project]);

  const checklistProgress = useMemo(() => getChecklistProgress(meta), [meta]);
  const overdue = project ? isProjectTaskOverdue(project) : false;

  const toggleLabel = (labelId: ProjectLabelId): void => {
    setMeta((current) => {
      const exists = current.labels.includes(labelId);
      return {
        ...current,
        labels: exists ? current.labels.filter((id) => id !== labelId) : [...current.labels, labelId],
      };
    });
  };

  const handleSave = async (): Promise<void> => {
    if (!project || !title.trim()) return;
    const descriptionWithMeta = embedProjectCardMeta(description, meta);
    await onSave(
      {
        title: title.trim(),
        description: descriptionWithMeta,
        projectTeam,
        projectPhase: projectPhase || '',
        status,
        priority,
        dueDate,
        assignedUserId: assignedUserId || NONE_SELECT_VALUE,
        customerId: customerId || NONE_SELECT_VALUE,
      },
      meta
    );
  };

  const addChecklistItem = (): void => {
    const text = newChecklistText.trim();
    if (!text) return;
    setMeta((current) => ({
      ...current,
      checklist: [...current.checklist, newChecklistItem(text)],
    }));
    setNewChecklistText('');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] p-0 sm:max-w-lg"
      >
        <SheetHeader className="border-b border-[var(--crm-app-border)] px-5 py-4 text-left">
          <SheetTitle className="pr-8 text-lg font-bold text-slate-50">Proje Detayi</SheetTitle>
          <SheetDescription className="text-[var(--crm-app-text-muted)]">
            Kart detaylarini duzenleyin, etiket ve checklist ekleyin.
          </SheetDescription>
        </SheetHeader>

        {project ? (
          <div className="flex flex-1 flex-col overflow-y-auto">
            <div className="space-y-5 p-5">
              <div>
                <label className={SD_FORM_LABEL} htmlFor="trello-detail-title">
                  Baslik
                </label>
                <Input
                  id="trello-detail-title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  className={cn(SD_FORM_INPUT, 'h-10')}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <TaskStatusBadge status={Number(status) as 1 | 2 | 3 | 4} />
                <PriorityBadge priority={Number(priority) as 1 | 2 | 3 | 4} />
                {overdue && (
                  <span className="rounded-full bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-300">
                    Gecikmis
                  </span>
                )}
              </div>

              <div>
                <p className={cn(SD_FORM_LABEL, 'flex items-center gap-1.5')}>
                  <Tag className="h-3.5 w-3.5" />
                  Etiketler
                </p>
                <div className="flex flex-wrap gap-2">
                  {PROJECT_LABEL_DEFS.map((label) => {
                    const active = meta.labels.includes(label.id);
                    return (
                      <button
                        key={label.id}
                        type="button"
                        onClick={() => toggleLabel(label.id)}
                        className={cn(
                          'rounded-full px-2.5 py-1 text-xs font-semibold ring-1 transition',
                          active ? label.chipClass : 'bg-[var(--crm-app-panel-muted)] text-[var(--crm-app-text-muted)] ring-[var(--crm-app-border)]'
                        )}
                      >
                        {label.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={SD_FORM_LABEL}>Ekip</label>
                  <select
                    value={projectTeam}
                    onChange={(event) => setProjectTeam(event.target.value)}
                    className={cn(SD_FORM_INPUT, 'h-10 w-full px-3')}
                  >
                    {getSalesDeskProjectTeamOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SD_FORM_LABEL}>Asama</label>
                  <select
                    value={projectPhase}
                    onChange={(event) => setProjectPhase(event.target.value)}
                    className={cn(SD_FORM_INPUT, 'h-10 w-full px-3')}
                  >
                    <option value="">Secilmedi</option>
                    {getSalesDeskProjectPhaseOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SD_FORM_LABEL}>Durum</label>
                  <select
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                    className={cn(SD_FORM_INPUT, 'h-10 w-full px-3')}
                  >
                    {Object.entries(TASK_STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={SD_FORM_LABEL}>Oncelik</label>
                  <select
                    value={priority}
                    onChange={(event) => setPriority(event.target.value)}
                    className={cn(SD_FORM_INPUT, 'h-10 w-full px-3')}
                  >
                    {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={SD_FORM_LABEL}>Sorumlu</label>
                <select
                  value={assignedUserId}
                  onChange={(event) => setAssignedUserId(event.target.value)}
                  className={cn(SD_FORM_INPUT, 'h-10 w-full px-3')}
                >
                  <option value="">Atanmadi</option>
                  {userOptions
                    .filter((option) => option.value !== NONE_SELECT_VALUE)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
                {project.assignedUserId ? (
                  <p className="mt-1 flex items-center gap-1 text-xs text-[var(--crm-app-text-muted)]">
                    <UserRound className="h-3.5 w-3.5" />
                    {userNameById.get(project.assignedUserId) ?? `#${project.assignedUserId}`}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={SD_FORM_LABEL}>Cari</label>
                <select
                  value={customerId}
                  onChange={(event) => setCustomerId(event.target.value)}
                  className={cn(SD_FORM_INPUT, 'h-10 w-full px-3')}
                >
                  <option value="">Secilmedi</option>
                  {customerOptions
                    .filter((option) => option.value !== NONE_SELECT_VALUE)
                    .map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className={SD_FORM_LABEL} htmlFor="trello-detail-due">
                  Teslim Tarihi
                </label>
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
                  <Input
                    id="trello-detail-due"
                    type="date"
                    value={dueDate}
                    onChange={(event) => setDueDate(event.target.value)}
                    className={cn(SD_FORM_INPUT, 'h-10 pl-9')}
                  />
                </div>
                {dueDate ? (
                  <p className={cn('mt-1 text-xs', overdue ? 'text-rose-300' : 'text-[var(--crm-app-text-muted)]')}>
                    {formatDate(dueDate)}
                  </p>
                ) : null}
              </div>

              <div>
                <label className={SD_FORM_LABEL} htmlFor="trello-detail-desc">
                  Aciklama
                </label>
                <Textarea
                  id="trello-detail-desc"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={4}
                  className={cn(SD_FORM_INPUT, 'min-h-[100px] resize-none py-2')}
                />
              </div>

              <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/30 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className={cn(SD_FORM_LABEL, 'mb-0 flex items-center gap-1.5')}>
                    <CheckSquare className="h-3.5 w-3.5" />
                    Checklist
                  </p>
                  {checklistProgress.total > 0 && (
                    <span className="text-xs text-[var(--crm-app-text-muted)]">
                      {checklistProgress.done}/{checklistProgress.total}
                    </span>
                  )}
                </div>
                {checklistProgress.total > 0 && (
                  <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all"
                      style={{
                        width: `${Math.round((checklistProgress.done / checklistProgress.total) * 100)}%`,
                      }}
                    />
                  </div>
                )}
                <ul className="space-y-2">
                  {meta.checklist.map((item) => (
                    <li key={item.id} className="flex items-start gap-2">
                      <Checkbox
                        checked={item.done}
                        onCheckedChange={(checked) =>
                          setMeta((current) => ({
                            ...current,
                            checklist: current.checklist.map((entry) =>
                              entry.id === item.id ? { ...entry, done: checked === true } : entry
                            ),
                          }))
                        }
                      />
                      <span
                        className={cn(
                          'flex-1 text-sm',
                          item.done ? 'text-[var(--crm-app-text-muted)] line-through' : 'text-slate-200'
                        )}
                      >
                        {item.text}
                      </span>
                      <button
                        type="button"
                        className="text-[var(--crm-app-text-muted)] hover:text-rose-300"
                        onClick={() =>
                          setMeta((current) => ({
                            ...current,
                            checklist: current.checklist.filter((entry) => entry.id !== item.id),
                          }))
                        }
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex gap-2">
                  <Input
                    value={newChecklistText}
                    onChange={(event) => setNewChecklistText(event.target.value)}
                    placeholder="Yeni madde..."
                    className={cn(SD_FORM_INPUT, 'h-9 flex-1')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        addChecklistItem();
                      }
                    }}
                  />
                  <Button type="button" variant="outline" size="sm" className={SD_SECONDARY_BUTTON} onClick={addChecklistItem}>
                    Ekle
                  </Button>
                </div>
              </div>

              <div className="rounded-lg bg-[var(--crm-app-panel-muted)]/40 px-3 py-2 text-xs text-[var(--crm-app-text-muted)]">
                <p>
                  Ekip: <span className="text-slate-200">{getSalesDeskProjectTeamLabel(projectTeam)}</span>
                </p>
                {projectPhase ? (
                  <p className="mt-1">
                    Asama: <span className="text-slate-200">{getSalesDeskProjectPhaseLabel(projectPhase)}</span>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-5 py-4">
          <Button
            type="button"
            variant="outline"
            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
            onClick={() => project && onDelete(project)}
          >
            <Trash2 className="mr-1.5 h-4 w-4" />
            Sil
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className={SD_SECONDARY_BUTTON} onClick={() => onOpenChange(false)}>
              Kapat
            </Button>
            <Button type="button" disabled={isSaving || !title.trim()} onClick={() => void handleSave()}>
              {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
