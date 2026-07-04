import { type ReactElement } from 'react';
import { useFormContext } from 'react-hook-form';
import { BookUser, Calendar, CreditCard, FileText } from 'lucide-react';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { enumToSelectOptions, normalizeSelectValue, NONE_SELECT_VALUE } from '../../lib/salesdesk-shared';
import { DOCUMENT_STATUS_LABELS } from '../../lib/salesdesk-labels';
import { SD_SELECT_CONTENT } from '../../lib/salesdesk-popup-styles';
import {
  SD_CREATE_FORM_INPUT_CLASSNAME,
  SD_CREATE_FORM_LABEL_CLASSNAME,
  SD_CREATE_GLASS_CARD_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import type { QuoteFormValues } from '../../types/salesdesk-schemas';
import { cn } from '@/lib/utils';

interface SalesDeskQuoteHeaderFormProps {
  customerOptions: Array<{ value: string; label: string }>;
  optionsPending?: boolean;
}

function LabelIconBox({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: 'brand' | 'navy' | 'emerald' | 'sky';
}): ReactElement {
  const toneClass =
    tone === 'brand'
      ? 'bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]'
      : tone === 'navy'
        ? 'bg-[color-mix(in_srgb,var(--crm-brand-secondary)_20%,transparent)] text-sky-300 ring-1 ring-[color-mix(in_srgb,var(--crm-brand-secondary)_38%,transparent)]'
        : tone === 'emerald'
          ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
          : 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30';

  return (
    <span className={cn('inline-flex h-6 w-6 items-center justify-center rounded-md shadow-sm', toneClass)}>
      {children}
    </span>
  );
}

export function SalesDeskQuoteHeaderForm({
  customerOptions,
  optionsPending = false,
}: SalesDeskQuoteHeaderFormProps): ReactElement {
  const form = useFormContext<QuoteFormValues>();
  const statusOptions = enumToSelectOptions(DOCUMENT_STATUS_LABELS);
  const hasCustomer = Boolean(form.watch('customerId'));

  return (
    <div className="relative space-y-6 pb-8 pt-2 animate-in fade-in slide-in-from-bottom-3 duration-700">
      <div className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-[var(--crm-brand-primary)]/10 blur-[100px]" />
      <div className="pointer-events-none absolute -right-16 top-10 h-80 w-80 rounded-full bg-[var(--crm-brand-secondary)]/8 blur-[80px]" />

      <div className={cn(SD_CREATE_GLASS_CARD_CLASSNAME, 'p-5 md:p-6')}>
        <div className="grid gap-6 xl:grid-cols-3">
          <FormField
            control={form.control}
            name="customerId"
            render={({ field }) => (
              <FormItem className="xl:col-span-2">
                <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                  <LabelIconBox tone="brand">
                    <BookUser className="h-3.5 w-3.5" />
                  </LabelIconBox>
                  Musteri / Cari
                </FormLabel>
                <Select
                  value={normalizeSelectValue(String(field.value ?? ''))}
                  onValueChange={(value) =>
                    field.onChange(value === NONE_SELECT_VALUE ? NONE_SELECT_VALUE : value)
                  }
                  disabled={optionsPending && customerOptions.length === 0}
                >
                  <FormControl>
                    <SelectTrigger className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'pl-3')}>
                      <SelectValue
                        placeholder={optionsPending && customerOptions.length === 0 ? 'Cariler yukleniyor...' : 'Cari secin'}
                      />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={SD_SELECT_CONTENT}>
                    {customerOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                  <LabelIconBox tone="navy">
                    <CreditCard className="h-3.5 w-3.5" />
                  </LabelIconBox>
                  Durum
                </FormLabel>
                <Select
                  value={normalizeSelectValue(String(field.value ?? ''))}
                  onValueChange={(value) =>
                    field.onChange(value === NONE_SELECT_VALUE ? NONE_SELECT_VALUE : value)
                  }
                >
                  <FormControl>
                    <SelectTrigger className={SD_CREATE_FORM_INPUT_CLASSNAME}>
                      <SelectValue placeholder="Durum secin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={SD_SELECT_CONTENT}>
                    {statusOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      {hasCustomer ? (
        <div className={cn(SD_CREATE_GLASS_CARD_CLASSNAME, 'p-5 md:p-6 animate-in fade-in duration-500')}>
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="quoteDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                    <LabelIconBox tone="sky">
                      <Calendar className="h-3.5 w-3.5" />
                    </LabelIconBox>
                    Teklif Tarihi
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quoteNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                    <LabelIconBox tone="navy">
                      <FileText className="h-3.5 w-3.5" />
                    </LabelIconBox>
                    Teklif No
                  </FormLabel>
                  <FormControl>
                    <Input {...field} className={SD_CREATE_FORM_INPUT_CLASSNAME} placeholder="Otomatik" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        <div className={cn(SD_CREATE_GLASS_CARD_CLASSNAME, 'p-5 md:p-6')}>
          <div className="mb-4 flex items-center gap-2">
            <LabelIconBox tone="emerald">
              <CreditCard className="h-3.5 w-3.5" />
            </LabelIconBox>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Finansal
            </h4>
          </div>
          <FormField
            control={form.control}
            name="discountRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Genel Iskonto (%)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={0.01}
                    className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'font-mono tabular-nums text-right')}
                    value={Number(field.value ?? 0)}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      field.onChange(Number.isFinite(next) ? next : 0);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className={cn(SD_CREATE_GLASS_CARD_CLASSNAME, 'p-5 md:p-6')}>
          <div className="mb-4 flex items-center gap-2">
            <LabelIconBox tone="sky">
              <Calendar className="h-3.5 w-3.5" />
            </LabelIconBox>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Durum ve Tarih
            </h4>
          </div>
          <p className="text-xs text-[var(--crm-app-text-muted)]">
            Teklif durumu ve tarihini yukaridaki alanlardan yonetebilirsiniz. Onaylanan teklifler faturaya donusturulebilir.
          </p>
        </div>

        <div className={cn(SD_CREATE_GLASS_CARD_CLASSNAME, 'p-5 md:p-6 md:col-span-2 xl:col-span-1')}>
          <div className="mb-4 flex items-center gap-2">
            <LabelIconBox tone="navy">
              <FileText className="h-3.5 w-3.5" />
            </LabelIconBox>
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
              Belge Detayi
            </h4>
          </div>
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Notlar</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'min-h-[100px] h-auto resize-y py-3')}
                    placeholder="Teklif notu..."
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}
