import { type ReactElement } from 'react';
import { FileStack, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { SalesDeskQuoteDto } from '../../api/salesdesk-api';
import { formatMoney } from '../../lib/salesdesk-shared';
import { DocumentStatusBadge } from '../pages/salesdesk-badges';
import {
  SD_CREATE_FORM_LABEL_CLASSNAME,
  SD_CREATE_GLASS_CARD_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import { cn } from '@/lib/utils';

interface SalesDeskOpenQuotesBoxProps {
  quotes: SalesDeskQuoteDto[];
  selectedQuoteId?: string;
  isLoading?: boolean;
  onQuoteSelect: (quote: SalesDeskQuoteDto) => void;
  onQuoteClear?: () => void;
}

function LabelIconBox({ children }: { children: React.ReactNode }): ReactElement {
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)] shadow-sm">
      {children}
    </span>
  );
}

export function SalesDeskOpenQuotesBox({
  quotes,
  selectedQuoteId,
  isLoading = false,
  onQuoteSelect,
  onQuoteClear,
}: SalesDeskOpenQuotesBoxProps): ReactElement {
  const selectedId = selectedQuoteId?.trim() ? Number(selectedQuoteId) : null;

  return (
    <div className={cn(SD_CREATE_GLASS_CARD_CLASSNAME, 'p-5 md:p-6')}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className={SD_CREATE_FORM_LABEL_CLASSNAME}>
            <LabelIconBox>
              <FileStack className="h-3.5 w-3.5" />
            </LabelIconBox>
            Acik Teklifler
          </p>
          <p className="mt-1 text-xs text-[var(--crm-app-text-muted)]">
            Fatura kesmek istediginiz teklifi secin; cari, kalemler ve iskonto otomatik dolar.
          </p>
        </div>
        {selectedId && onQuoteClear ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 shrink-0 rounded-lg px-2 text-xs text-zinc-500 hover:text-zinc-200"
            onClick={onQuoteClear}
          >
            <X className="mr-1 h-3.5 w-3.5" />
            Secimi kaldir
          </Button>
        ) : null}
      </div>

      {isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-[var(--crm-app-border)] px-4 py-8 text-sm text-[var(--crm-app-text-muted)]">
          <Loader2 className="h-4 w-4 animate-spin text-[var(--crm-brand-primary)]" />
          Acik teklifler yukleniyor...
        </div>
      ) : quotes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--crm-app-border)] px-4 py-8 text-center text-sm text-[var(--crm-app-text-muted)]">
          Faturaya baglanabilecek acik teklif bulunamadi.
        </div>
      ) : (
        <div className="custom-scrollbar max-h-[240px] space-y-2 overflow-y-auto pr-1">
          {quotes.map((quote) => {
            const isSelected = selectedId === quote.id;
            return (
              <button
                key={quote.id}
                type="button"
                onClick={() => onQuoteSelect(quote)}
                className={cn(
                  'flex w-full items-start justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                  isSelected
                    ? 'border-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_35%,transparent)]'
                    : 'border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] hover:border-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--crm-brand-primary)_8%,transparent)]'
                )}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{quote.quoteNumber}</span>
                    <DocumentStatusBadge status={quote.status} />
                  </div>
                  <p className="mt-1 truncate text-xs text-zinc-500">{quote.customerName || 'Cari'}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--crm-app-text-muted)]">
                    {quote.quoteDate} · {(quote.lines ?? []).length} kalem
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-bold tabular-nums text-[var(--crm-brand-text)]">
                    {formatMoney(quote.grandTotal)}
                  </p>
                  {isSelected ? (
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--crm-brand-on-soft)]">
                      Secili
                    </p>
                  ) : null}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
