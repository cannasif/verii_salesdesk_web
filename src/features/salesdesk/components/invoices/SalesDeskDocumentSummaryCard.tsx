import { type ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';
import { Calculator, Info, Wallet } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  calculateInvoiceTotals,
  type InvoiceLineFormState,
} from '../../types/invoice-create-types';
import { formatMoney } from '../../lib/salesdesk-shared';
import { SD_DOCUMENT_TOTAL_GRADIENT } from '../../lib/salesdesk-document-button-styles';
import { cn } from '@/lib/utils';

interface SalesDeskDocumentSummaryCardProps {
  lines: InvoiceLineFormState[];
  title?: string;
  subtitle?: string;
}

/** Belge (fatura/teklif) ozet karti — form context'te `discountRate` bekler. */
export function SalesDeskDocumentSummaryCard({
  lines,
  title = 'Ozet',
  subtitle = 'Toplam Analizi',
}: SalesDeskDocumentSummaryCardProps): ReactElement {
  const form = useFormContext<{ discountRate?: number }>();
  const discountRate = form.watch('discountRate') ?? 0;
  const totals = calculateInvoiceTotals(lines, discountRate);

  return (
    <div className="relative overflow-hidden rounded-none border-0 bg-[color-mix(in_srgb,var(--crm-app-panel)_95%,transparent)] dark:bg-[color-mix(in_srgb,var(--crm-app-panel)_50%,transparent)]">
      <div className="p-5 sm:p-6">
        <div className="mb-6 flex items-center gap-2.5 border-b border-[var(--crm-app-border)] pb-4 text-zinc-900 dark:text-white">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--crm-brand-primary)_16%,transparent)] shadow-sm ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_28%,transparent)]">
            <Calculator className="h-4 w-4 text-[var(--crm-brand-accent)]" />
          </div>
          <div>
            <h3 className="mb-1 text-sm font-bold leading-none tracking-tight">{title}</h3>
            <span className="text-[10px] font-medium uppercase tracking-tighter text-zinc-400">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 items-end gap-4">
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label
              htmlFor="document-discountRate"
              className="truncate text-[11px] font-bold uppercase tracking-tight text-zinc-500 dark:text-zinc-400"
            >
              Genel Iskonto (%)
            </Label>
            <div className="relative">
              <Input
                id="document-discountRate"
                type="number"
                min={0}
                max={100}
                step={0.01}
                placeholder="0"
                className={cn(
                  'h-10 rounded-xl bg-zinc-50/50 pr-8 text-right font-mono tabular-nums dark:bg-zinc-950/50',
                  'focus-visible:border-[var(--crm-brand-accent)] focus-visible:ring-4 focus-visible:ring-[var(--crm-brand-focus-glow)]',
                  '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
                )}
                value={discountRate}
                onChange={(event) =>
                  form.setValue('discountRate', Number(event.target.value), { shouldValidate: true })
                }
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400">
                %
              </span>
            </div>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <Label className="truncate text-[11px] font-bold uppercase tracking-tight text-zinc-500 dark:text-zinc-400">
              Iskonto Tutari
            </Label>
            <Input
              readOnly
              value={formatMoney(totals.discountTotal)}
              className="h-10 rounded-xl bg-zinc-50/50 text-right font-mono tabular-nums dark:bg-zinc-950/50"
            />
          </div>
        </div>

        <div className="mb-5 rounded-xl border-l-4 border-l-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)] p-3 text-[10px] leading-relaxed text-[var(--crm-brand-on-soft)]">
          <div className="mb-1 flex items-center gap-1.5 font-bold uppercase tracking-wide">
            <Info className="h-3 w-3" />
            Bilgi
          </div>
          Genel iskonto ara toplam uzerinden hesaplanir. KDV satir bazinda uygulanir.
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>Ara Toplam</span>
            <span className="font-mono tabular-nums">{formatMoney(totals.subTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-red-500">
            <span>Iskonto</span>
            <span className="font-mono tabular-nums">-{formatMoney(totals.discountTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-600 dark:text-zinc-400">
            <span>KDV</span>
            <span className="font-mono tabular-nums">{formatMoney(totals.vatTotal)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-[var(--crm-app-border)] pt-3">
            <span className="flex items-center gap-2 font-bold text-zinc-900 dark:text-white">
              <Wallet className="h-4 w-4 text-[var(--crm-brand-primary)]" />
              Genel Toplam
            </span>
            <span className={SD_DOCUMENT_TOTAL_GRADIENT}>{formatMoney(totals.grandTotal)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
