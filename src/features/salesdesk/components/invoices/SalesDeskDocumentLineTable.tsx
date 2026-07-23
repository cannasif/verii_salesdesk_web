import { type ReactElement, useMemo, useState } from 'react';
import {
  Box,
  Edit,
  FileText,
  Hash,
  Layers,
  Package,
  PackagePlus,
  Percent,
  Plus,
  ShoppingCart,
  Trash2,
  Wallet,
} from 'lucide-react';
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
import { SD_SELECT_CONTENT, SD_TABLE_ACTION_BUTTON } from '../../lib/salesdesk-popup-styles';
import {
  SD_CREATE_FORM_INPUT_CLASSNAME,
  SD_CREATE_FORM_LABEL_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import {
  SD_DOCUMENT_BUTTON_SAVE,
  SD_DOCUMENT_LINE_ADD_BUTTON,
  SD_DOCUMENT_LINE_TOOLBAR_ICON,
  SD_DOCUMENT_TOTAL_GRADIENT,
} from '../../lib/salesdesk-document-button-styles';
import {
  calculateInvoiceLineTotal,
  createEmptyInvoiceLine,
  type InvoiceLineFormState,
} from '../../types/invoice-create-types';
import { formatMoney } from '../../lib/salesdesk-shared';
import type { SalesDeskProductDto } from '../../api/salesdesk-api';
import { cn } from '@/lib/utils';

interface SalesDeskDocumentLineTableProps {
  lines: InvoiceLineFormState[];
  onLinesChange: (lines: InvoiceLineFormState[]) => void;
  products: SalesDeskProductDto[];
  productsPending?: boolean;
  title?: string;
  subtitle?: string;
}

interface LineDialogState {
  open: boolean;
  editingId: string | null;
  draft: InvoiceLineFormState;
}

function createDialogState(
  line?: InvoiceLineFormState,
  editingId: string | null = null
): LineDialogState {
  return {
    open: true,
    editingId,
    draft: line ?? createEmptyInvoiceLine(),
  };
}

/** Belge (fatura/teklif) kalem tablosu — kalem ekle/duzenle popup'i dahil. */
export function SalesDeskDocumentLineTable({
  lines,
  onLinesChange,
  products,
  productsPending = false,
  title = 'Kalemler',
  subtitle = 'Urun, miktar ve fiyat bilgilerini girin.',
}: SalesDeskDocumentLineTableProps): ReactElement {
  const [dialog, setDialog] = useState<LineDialogState>({
    open: false,
    editingId: null,
    draft: createEmptyInvoiceLine(),
  });

  const productOptions = useMemo(
    () => products.map((product) => ({ value: String(product.id), label: `${product.code} — ${product.name}` })),
    [products]
  );

  const closeDialog = (): void => {
    setDialog({ open: false, editingId: null, draft: createEmptyInvoiceLine() });
  };

  const handleProductChange = (productId: string): void => {
    const product = products.find((item) => item.id === Number(productId));
    setDialog((current) => ({
      ...current,
      draft: {
        ...createEmptyInvoiceLine(product),
        description: current.draft.description,
      },
    }));
  };

  const handleSaveLine = (): void => {
    if (dialog.draft.productId <= 0 || dialog.draft.quantity <= 0) return;

    if (dialog.editingId) {
      onLinesChange(lines.map((line) => (line.id === dialog.editingId ? { ...dialog.draft, id: line.id } : line)));
    } else {
      onLinesChange([...lines, dialog.draft]);
    }
    closeDialog();
  };

  const handleDelete = (lineId: string): void => {
    onLinesChange(lines.filter((line) => line.id !== lineId));
  };

  const selectedProduct = products.find((item) => item.id === dialog.draft.productId);
  const lineTotal = calculateInvoiceLineTotal(dialog.draft);
  const isLineValid = dialog.draft.productId > 0 && dialog.draft.quantity > 0;

  const dialogNumberInput = cn(
    SD_CREATE_FORM_INPUT_CLASSNAME,
    'pr-9 text-right font-mono tabular-nums',
    '[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
  );

  return (
    <div className="w-full overflow-hidden rounded-none border-0 bg-[var(--crm-app-panel)] shadow-sm dark:bg-[color-mix(in_srgb,var(--crm-app-panel)_50%,transparent)]">
      <div className="flex flex-col justify-between gap-4 border-b border-[var(--crm-app-border)] p-5 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className={SD_DOCUMENT_LINE_TOOLBAR_ICON}>
            <ShoppingCart className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">{title}</h4>
            <p className="text-xs text-[var(--crm-app-text-muted)]">{subtitle}</p>
          </div>
        </div>
        <Button
          type="button"
          className={cn(SD_DOCUMENT_LINE_ADD_BUTTON, 'w-full sm:w-auto')}
          onClick={() => setDialog(createDialogState())}
        >
          <Plus className="mr-2 h-4 w-4" />
          Kalem Ekle
        </Button>
      </div>

      {lines.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-zinc-50 ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
            <Box className="h-10 w-10 text-zinc-300" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Henuz kalem eklenmedi.</p>
          <p className="mt-1 text-xs text-[var(--crm-app-text-muted)]">Kalem Ekle ile urun satiri olusturun.</p>
        </div>
      ) : (
        <>
          <div className="space-y-3 p-4 md:hidden">
            {lines.map((line) => (
              <article
                key={line.id}
                className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)] p-4"
              >
                <div className="min-w-0">
                  <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{line.productCode || '—'}</p>
                  <p className="text-xs text-zinc-500">{line.productName || 'Urun secilmedi'}</p>
                  {line.description?.trim() ? (
                    <p className="mt-1 line-clamp-2 text-[11px] text-[var(--crm-app-text-muted)]">{line.description}</p>
                  ) : null}
                  <p className="mt-1 text-[11px] font-semibold text-[var(--crm-brand-text)]">{line.unit}</p>
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <dt className="text-[var(--crm-app-text-muted)]">Miktar</dt>
                    <dd className="font-mono font-semibold tabular-nums">{line.quantity}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--crm-app-text-muted)]">Birim Fiyat</dt>
                    <dd className="font-mono font-semibold tabular-nums">{formatMoney(line.unitPrice)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--crm-app-text-muted)]">KDV</dt>
                    <dd className="font-mono font-semibold tabular-nums">%{line.vatRate}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--crm-app-text-muted)]">Tutar</dt>
                    <dd className="font-mono font-semibold tabular-nums">{formatMoney(calculateInvoiceLineTotal(line))}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex justify-end gap-2 border-t border-[var(--crm-app-border)] pt-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(SD_TABLE_ACTION_BUTTON, 'text-blue-500 hover:bg-blue-500/10')}
                    onClick={() => setDialog(createDialogState(line, line.id))}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(SD_TABLE_ACTION_BUTTON, 'text-red-500 hover:bg-red-500/10')}
                    onClick={() => handleDelete(line.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </article>
            ))}
          </div>
          <div className="custom-scrollbar hidden w-full overflow-x-auto md:block">
            <table className="w-full min-w-[980px] table-fixed border-separate border-spacing-0">
              <colgroup>
                <col className="w-[34%]" />
                <col className="w-[12%]" />
                <col className="w-[16%]" />
                <col className="w-[10%]" />
                <col className="w-[16%]" />
                <col className="w-[12%]" />
              </colgroup>
            <thead>
              <tr>
                <th className="sticky left-0 z-40 h-11 border-b border-r border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_88%,transparent)] px-4 text-left text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <div className="flex items-center gap-2">
                    <Layers className="h-3.5 w-3.5" />
                    Stok
                  </div>
                </th>
                <th className="h-11 border-b border-r border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_88%,transparent)] px-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Miktar
                </th>
                <th className="h-11 border-b border-r border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_88%,transparent)] px-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Birim Fiyat
                </th>
                <th className="h-11 border-b border-r border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_88%,transparent)] px-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  KDV %
                </th>
                <th className="h-11 border-b border-r border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_88%,transparent)] px-4 text-right text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Tutar
                </th>
                <th className="h-11 border-b border-[var(--crm-app-border)] bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_88%,transparent)] px-4 text-center text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Islem
                </th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => (
                <tr key={line.id} className="group">
                  <td
                    className={cn(
                      'sticky left-0 z-30 border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-4',
                      'shadow-[4px_0_12px_-4px_rgba(0,0,0,0.12)] group-hover:bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,transparent)]'
                    )}
                  >
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{line.productCode || '—'}</p>
                    <p className="text-xs text-zinc-500">{line.productName || 'Urun secilmedi'}</p>
                    {line.description?.trim() ? (
                      <p className="mt-1 line-clamp-2 text-[11px] text-[var(--crm-app-text-muted)]">{line.description}</p>
                    ) : null}
                    <p className="mt-1 text-[11px] font-semibold text-[var(--crm-brand-text)]">{line.unit}</p>
                  </td>
                  <td className="border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-4 text-right text-sm font-mono tabular-nums group-hover:bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,transparent)]">
                    {line.quantity}
                  </td>
                  <td className="border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-4 text-right text-sm font-mono tabular-nums group-hover:bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,transparent)]">
                    {formatMoney(line.unitPrice)}
                  </td>
                  <td className="border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-4 text-right text-sm font-mono tabular-nums group-hover:bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,transparent)]">
                    %{line.vatRate}
                  </td>
                  <td className="border-b border-r border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-4 text-right text-sm font-semibold font-mono tabular-nums group-hover:bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,transparent)]">
                    {formatMoney(calculateInvoiceLineTotal(line))}
                  </td>
                  <td className="border-b border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-4 group-hover:bg-[color-mix(in_srgb,var(--crm-app-panel-muted)_70%,transparent)]">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(SD_TABLE_ACTION_BUTTON, 'text-blue-500 hover:bg-blue-500/10 hover:scale-105')}
                        onClick={() => setDialog(createDialogState(line, line.id))}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(SD_TABLE_ACTION_BUTTON, 'text-red-500 hover:bg-red-500/10 hover:scale-105')}
                        onClick={() => handleDelete(line.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
          </div>
        </>
      )}

      <Dialog open={dialog.open} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent
          className={cn(
            'w-[calc(100%-1rem)] gap-0 overflow-hidden !p-0 sm:max-w-[540px]',
            'rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)]',
            'shadow-2xl shadow-black/50'
          )}
        >
          {/* Header */}
          <div className="sd-doc-section-header relative flex items-center gap-3.5 border-b border-[var(--crm-app-border)] px-6 py-5">
            <div className={cn(SD_DOCUMENT_LINE_TOOLBAR_ICON, 'h-11 w-11')}>
              {dialog.editingId ? <Package className="h-5 w-5" /> : <PackagePlus className="h-5 w-5" />}
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                {dialog.editingId ? 'Kalemi Duzenle' : 'Yeni Kalem Ekle'}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">
                Urun secin, miktar ve fiyat bilgilerini girin.
              </DialogDescription>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-5 px-6 py-5">
            <div>
              <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]">
                  <ShoppingCart className="h-3.5 w-3.5" />
                </span>
                Urun
              </Label>
              <Select
                value={dialog.draft.productId > 0 ? String(dialog.draft.productId) : undefined}
                onValueChange={handleProductChange}
                disabled={productsPending && productOptions.length === 0}
              >
                <SelectTrigger className={cn(SD_CREATE_FORM_INPUT_CLASSNAME, 'w-full')}>
                  <SelectValue
                    placeholder={productsPending && productOptions.length === 0 ? 'Urunler yukleniyor...' : 'Urun secin'}
                  />
                </SelectTrigger>
                <SelectContent className={SD_SELECT_CONTENT}>
                  {productOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProduct ? (
              <div className="flex items-center gap-3 rounded-xl border border-[color-mix(in_srgb,var(--crm-brand-primary)_22%,transparent)] bg-[var(--crm-brand-soft)] p-3 duration-300 animate-in fade-in slide-in-from-top-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]">
                  <Package className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900 dark:text-slate-100">
                    {selectedProduct.name}
                  </p>
                  <p className="truncate text-xs text-[var(--crm-app-text-muted)]">
                    {selectedProduct.code} · {selectedProduct.unit}
                  </p>
                </div>
                <span
                  className={cn(
                    'shrink-0 rounded-md px-2 py-1 text-[11px] font-semibold',
                    selectedProduct.isLowStock
                      ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/25'
                      : 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/25'
                  )}
                >
                  Stok: {selectedProduct.stockQuantity}
                </span>
              </div>
            ) : null}

            <div>
              <Label className={SD_CREATE_FORM_LABEL_CLASSNAME}>
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--crm-brand-primary)_18%,transparent)] text-[var(--crm-brand-accent)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_30%,transparent)]">
                  <FileText className="h-3.5 w-3.5" />
                </span>
                Aciklama
              </Label>
              <Textarea
                value={dialog.draft.description}
                onChange={(event) =>
                  setDialog((current) => ({
                    ...current,
                    draft: { ...current.draft, description: event.target.value },
                  }))
                }
                className={cn(
                  SD_CREATE_FORM_INPUT_CLASSNAME,
                  'min-h-[88px] h-auto resize-y py-3'
                )}
                placeholder="Kalem aciklamasi..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div>
                <Label className={cn(SD_CREATE_FORM_LABEL_CLASSNAME, 'mb-1.5')}>
                  <Hash className="h-3.5 w-3.5 text-[var(--crm-brand-accent)]" />
                  Miktar
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className={dialogNumberInput}
                    value={dialog.draft.quantity}
                    onChange={(event) =>
                      setDialog((current) => ({
                        ...current,
                        draft: { ...current.draft, quantity: Number(event.target.value) },
                      }))
                    }
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[var(--crm-app-text-muted)]">
                    {selectedProduct?.unit ?? 'Ad'}
                  </span>
                </div>
              </div>
              <div>
                <Label className={cn(SD_CREATE_FORM_LABEL_CLASSNAME, 'mb-1.5')}>
                  <Wallet className="h-3.5 w-3.5 text-[var(--crm-brand-accent)]" />
                  Birim Fiyat
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    className={dialogNumberInput}
                    value={dialog.draft.unitPrice}
                    onChange={(event) =>
                      setDialog((current) => ({
                        ...current,
                        draft: { ...current.draft, unitPrice: Number(event.target.value) },
                      }))
                    }
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[var(--crm-app-text-muted)]">
                    TL
                  </span>
                </div>
              </div>
              <div>
                <Label className={cn(SD_CREATE_FORM_LABEL_CLASSNAME, 'mb-1.5')}>
                  <Percent className="h-3.5 w-3.5 text-[var(--crm-brand-accent)]" />
                  KDV
                </Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    step={1}
                    className={dialogNumberInput}
                    value={dialog.draft.vatRate}
                    onChange={(event) =>
                      setDialog((current) => ({
                        ...current,
                        draft: { ...current.draft, vatRate: Number(event.target.value) },
                      }))
                    }
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-[var(--crm-app-text-muted)]">
                    %
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border-l-4 border-l-[var(--crm-brand-primary)] bg-[var(--crm-brand-soft)] px-4 py-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--crm-brand-on-soft)]">
                  Satir Tutari
                </span>
                <span className="text-[10px] text-[var(--crm-app-text-muted)]">KDV haric ara toplam</span>
              </div>
              <span className={SD_DOCUMENT_TOTAL_GRADIENT}>{formatMoney(lineTotal)}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col-reverse gap-2 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-4 py-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-6">
            <Button type="button" variant="outline" className="h-11 w-full rounded-xl px-5 sm:h-10 sm:w-auto" onClick={closeDialog}>
              Iptal
            </Button>
            <Button
              type="button"
              disabled={!isLineValid}
              className={cn('h-11 w-full rounded-xl px-6 font-bold sm:h-10 sm:w-auto', SD_DOCUMENT_BUTTON_SAVE)}
              onClick={handleSaveLine}
            >
              <Plus className="mr-2 h-4 w-4" />
              {dialog.editingId ? 'Guncelle' : 'Kalemi Ekle'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
