import { type ReactElement, useState } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SD_FORM_INPUT } from '../../lib/salesdesk-popup-styles';

interface SalesDeskProjectTrelloQuickAddProps {
  onAdd: (title: string) => void | Promise<void>;
  disabled?: boolean;
}

export function SalesDeskProjectTrelloQuickAdd({
  onAdd,
  disabled = false,
}: SalesDeskProjectTrelloQuickAddProps): ReactElement {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (): Promise<void> => {
    const trimmed = title.trim();
    if (!trimmed || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await onAdd(trimmed);
      setTitle('');
      setOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-1.5 rounded-lg px-2 py-2 text-left text-xs font-semibold text-[var(--crm-app-text-muted)] transition hover:bg-[var(--crm-brand-soft)] hover:text-[var(--crm-brand-text)] disabled:opacity-50"
      >
        <Plus className="h-3.5 w-3.5" />
        Kart ekle
      </button>
    );
  }

  return (
    <div className="space-y-2 rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-list-card)] p-2">
      <textarea
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Proje basligi..."
        rows={2}
        autoFocus
        className={cn(SD_FORM_INPUT, 'min-h-[56px] w-full resize-none py-2 text-sm')}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            void handleSubmit();
          }
          if (event.key === 'Escape') {
            setOpen(false);
            setTitle('');
          }
        }}
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={!title.trim() || isSubmitting}
          onClick={() => void handleSubmit()}
          className="rounded-md bg-[var(--crm-brand-primary)] px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
        >
          Ekle
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setTitle('');
          }}
          className="text-xs text-[var(--crm-app-text-muted)] hover:text-slate-200"
        >
          Iptal
        </button>
      </div>
    </div>
  );
}
