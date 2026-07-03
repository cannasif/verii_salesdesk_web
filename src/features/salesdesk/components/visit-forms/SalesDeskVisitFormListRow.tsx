import { type ReactElement, useState } from 'react';
import {
  CalendarDays,
  FileText,
  Loader2,
  Mail,
  MessageCircle,
  Pencil,
  Trash2,
  UserRound,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import { formatDate } from '../../lib/salesdesk-shared';
import type { VisitFormCustomerContact } from '../../lib/visit-form-recipient';
import { shareVisitFormViaGmail, shareVisitFormViaWhatsApp } from '../../lib/visit-form-share';
import { getVisitFormPreview, getVisitFormVisitorName } from '../../lib/visit-form-content';
import { toast } from 'sonner';

interface SalesDeskVisitFormListRowProps {
  form: SalesDeskVisitFormDto;
  customerContact?: VisitFormCustomerContact | null;
  onEdit: (form: SalesDeskVisitFormDto) => void;
  onDelete: (form: SalesDeskVisitFormDto) => void;
  onPreviewPdf: (form: SalesDeskVisitFormDto) => void | Promise<void>;
}

function ActionButton({
  label,
  icon: Icon,
  onClick,
  loading,
}: {
  label: string;
  icon: typeof FileText;
  onClick: () => void;
  loading?: boolean;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className={cn(
        'inline-flex h-9 min-w-[72px] items-center justify-center gap-1.5 rounded-lg border border-[var(--crm-app-border)] px-3 text-xs font-semibold transition-colors',
        loading
          ? 'cursor-wait opacity-70'
          : 'text-slate-600 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)] dark:text-slate-300'
      )}
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Icon size={14} />}
      {label}
    </button>
  );
}

function IconButton({
  label,
  icon: Icon,
  onClick,
  tone = 'default',
}: {
  label: string;
  icon: typeof Pencil;
  onClick: () => void;
  tone?: 'default' | 'danger';
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--crm-app-border)] transition-colors',
        tone === 'danger'
          ? 'text-slate-500 hover:border-rose-400/40 hover:bg-rose-500/10 hover:text-rose-500 dark:hover:text-rose-300'
          : 'text-slate-500 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)] hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-accent)]'
      )}
    >
      <Icon size={15} />
    </button>
  );
}

export function SalesDeskVisitFormListRow({
  form,
  customerContact,
  onEdit,
  onDelete,
  onPreviewPdf,
}: SalesDeskVisitFormListRowProps): ReactElement {
  const preview = getVisitFormPreview(form);
  const visitorName = getVisitFormVisitorName(form);
  const [activeAction, setActiveAction] = useState<'pdf' | 'gmail' | 'whatsapp' | null>(null);

  const runAction = async (action: 'pdf' | 'gmail' | 'whatsapp', task: () => Promise<void>): Promise<void> => {
    setActiveAction(action);
    try {
      await task();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Islem tamamlanamadi.');
    } finally {
      setActiveAction(null);
    }
  };

  return (
    <article className="group rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-4 shadow-sm transition-all duration-200 hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] hover:shadow-[0_12px_32px_rgb(0_0_0_/10%)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-50">
              {form.customerName || 'Cari secilmedi'}
            </h3>
            <span className="inline-flex items-center gap-1 rounded-full border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
              <CalendarDays size={11} />
              {formatDate(form.formDate)}
            </span>
          </div>

          <p className="text-sm font-semibold text-[var(--crm-brand-accent)]">{form.title}</p>

          <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{preview}</p>

          <div className="flex items-center gap-1.5 text-xs text-[var(--crm-app-text-muted)]">
            <UserRound size={13} />
            {visitorName}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 lg:justify-end">
          <ActionButton
            label="PDF"
            icon={FileText}
            loading={activeAction === 'pdf'}
            onClick={() =>
              void runAction('pdf', async () => {
                await onPreviewPdf(form);
              })
            }
          />
          <ActionButton
            label="Gmail"
            icon={Mail}
            loading={activeAction === 'gmail'}
            onClick={() =>
              void runAction('gmail', async () => {
                await shareVisitFormViaGmail(form, customerContact);
              })
            }
          />
          <ActionButton
            label="WhatsApp"
            icon={MessageCircle}
            loading={activeAction === 'whatsapp'}
            onClick={() =>
              void runAction('whatsapp', async () => {
                await shareVisitFormViaWhatsApp(form, customerContact);
              })
            }
          />
          <IconButton label="Duzenle" icon={Pencil} onClick={() => onEdit(form)} />
          <IconButton label="Sil" icon={Trash2} tone="danger" onClick={() => onDelete(form)} />
        </div>
      </div>
    </article>
  );
}
