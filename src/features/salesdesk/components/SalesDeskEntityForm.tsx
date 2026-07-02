import { type ReactElement, type ReactNode, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
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
import { type DefaultValues, type FieldValues, type Path, useForm, type Resolver, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ZodTypeAny } from 'zod';
import { toast } from 'sonner';
import { FilePenLine, Loader2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NONE_SELECT_VALUE, normalizeSelectValue, sanitizeSelectOptions } from '../lib/salesdesk-shared';
import {
  SD_DIALOG_BODY_FORM,
  SD_DIALOG_CLOSE,
  SD_DIALOG_CONTENT_FORM,
  SD_DIALOG_DESC,
  SD_DIALOG_FOOTER_FORM,
  SD_DIALOG_HEADER_FORM,
  SD_DIALOG_ICON,
  SD_DIALOG_ICON_RING_FORM,
  SD_DIALOG_TITLE,
  SD_FORM_FOCUS_GLOW,
  SD_FORM_GRID_MD,
  SD_FORM_INPUT_MD,
  SD_FORM_LABEL,
  SD_FORM_MESSAGE,
  SD_PRIMARY_BUTTON_FORM,
  SD_SECONDARY_BUTTON_FORM,
  SD_SELECT_CONTENT,
} from '../lib/salesdesk-popup-styles';

export type SalesDeskFieldType = 'text' | 'email' | 'number' | 'date' | 'time' | 'textarea' | 'select' | 'checkbox';

export interface SalesDeskSelectOption {
  value: string;
  label: string;
}

export interface SalesDeskFormField<T extends FieldValues> {
  name: Path<T>;
  label: string;
  type?: SalesDeskFieldType;
  placeholder?: string;
  required?: boolean;
  options?: SalesDeskSelectOption[];
  colSpan?: 1 | 2 | 3;
  min?: number;
  max?: number;
  step?: number;
}

interface SalesDeskEntityFormProps<T extends FieldValues> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  schema: ZodTypeAny;
  fields: SalesDeskFormField<T>[];
  defaultValues: DefaultValues<T>;
  entity?: unknown;
  mapEntityToForm?: (entity: unknown) => T;
  onSubmit: (values: T) => void | Promise<void>;
  isLoading?: boolean;
  submitLabel?: string;
  icon?: LucideIcon;
}

function colSpanClass(colSpan?: 1 | 2 | 3): string {
  if (colSpan === 2) return 'sm:col-span-2';
  if (colSpan === 3) return 'sm:col-span-3';
  return '';
}

function renderField<T extends FieldValues>(
  form: UseFormReturn<T>,
  field: SalesDeskFormField<T>
): ReactNode {
  if (field.type === 'select') {
    const selectOptions = sanitizeSelectOptions(field.options ?? []);
    return (
      <FormField
        key={String(field.name)}
        control={form.control}
        name={field.name}
        render={({ field: controlField }) => (
          <FormItem className={colSpanClass(field.colSpan)}>
            <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
            <Select
              value={normalizeSelectValue(String(controlField.value ?? ''))}
              onValueChange={(value) =>
                controlField.onChange(value === NONE_SELECT_VALUE ? NONE_SELECT_VALUE : value)
              }
            >
              <FormControl>
                <SelectTrigger className={SD_FORM_INPUT_MD}>
                  <SelectValue placeholder={field.placeholder ?? 'Secin'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent className={SD_SELECT_CONTENT}>
                {selectOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage className={SD_FORM_MESSAGE} />
          </FormItem>
        )}
      />
    );
  }

  if (field.type === 'checkbox') {
    return (
      <FormField
        key={String(field.name)}
        control={form.control}
        name={field.name}
        render={({ field: controlField }) => (
          <FormItem className="flex items-center gap-2 space-y-0 pt-6">
            <FormControl>
              <input
                type="checkbox"
                checked={Boolean(controlField.value)}
                onChange={(event) => controlField.onChange(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--crm-app-border)] bg-transparent"
              />
            </FormControl>
            <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
            <FormMessage className={SD_FORM_MESSAGE} />
          </FormItem>
        )}
      />
    );
  }

  if (field.type === 'textarea') {
    return (
      <FormField
        key={String(field.name)}
        control={form.control}
        name={field.name}
        render={({ field: controlField }) => (
          <FormItem className={colSpanClass(field.colSpan)}>
            <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
            <FormControl>
              <textarea
                {...controlField}
                className={`min-h-24 w-full rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-200 outline-none ${SD_FORM_FOCUS_GLOW} transition-[color,box-shadow,border-color] duration-150`}
                placeholder={field.placeholder}
              />
            </FormControl>
            <FormMessage className={SD_FORM_MESSAGE} />
          </FormItem>
        )}
      />
    );
  }

  const inputType =
    field.type === 'number'
      ? 'number'
      : field.type === 'email'
        ? 'email'
        : field.type === 'date'
          ? 'date'
          : field.type === 'time'
            ? 'time'
            : 'text';

  return (
    <FormField
      key={String(field.name)}
      control={form.control}
      name={field.name}
      render={({ field: controlField }) => (
        <FormItem className={colSpanClass(field.colSpan)}>
          <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
          <FormControl>
            <Input
              {...controlField}
              type={inputType}
              min={field.min}
              max={field.max}
              step={field.step}
              className={SD_FORM_INPUT_MD}
              placeholder={field.placeholder}
              onChange={(event) => {
                if (field.type === 'number') {
                  controlField.onChange(Number(event.target.value));
                  return;
                }
                controlField.onChange(event.target.value);
              }}
            />
          </FormControl>
          <FormMessage className={SD_FORM_MESSAGE} />
        </FormItem>
      )}
    />
  );
}

export function SalesDeskEntityForm<T extends FieldValues>({
  open,
  onOpenChange,
  title,
  description,
  schema,
  fields,
  defaultValues,
  entity,
  mapEntityToForm,
  onSubmit,
  isLoading = false,
  submitLabel,
  icon: Icon = FilePenLine,
}: SalesDeskEntityFormProps<T>): ReactElement {
  const isEditMode = entity != null;
  const formId = 'salesdesk-entity-form';
  const form = useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    mode: 'onChange',
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      form.reset(entity && mapEntityToForm ? mapEntityToForm(entity) : defaultValues);
    }
  }, [open, entity, form, defaultValues, mapEntityToForm]);

  const handleSubmit = form.handleSubmit(
    async (values) => {
      await onSubmit(values);
      onOpenChange(false);
    },
    (errors) => {
      const firstError = Object.values(errors).find(
        (fieldError) => fieldError && typeof (fieldError as { message?: unknown }).message === 'string'
      ) as { message?: string } | undefined;
      toast.error(firstError?.message || 'Lutfen zorunlu alanlari kontrol edin.');
    }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent className={SD_DIALOG_CONTENT_FORM} showCloseButton={false}>
          <DialogHeader className={SD_DIALOG_HEADER_FORM}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={SD_DIALOG_ICON_RING_FORM}>
                <Icon className={`h-5 w-5 ${SD_DIALOG_ICON}`} aria-hidden />
              </div>
              <div className="min-w-0 space-y-0.5">
                <DialogTitle className={SD_DIALOG_TITLE}>{title}</DialogTitle>
                <DialogDescription className={SD_DIALOG_DESC}>{description}</DialogDescription>
              </div>
            </div>
            <button
              type="button"
              className={SD_DIALOG_CLOSE}
              onClick={() => onOpenChange(false)}
              aria-label="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          </DialogHeader>

          <Form {...form}>
            <form id={formId} onSubmit={handleSubmit} className={SD_DIALOG_BODY_FORM}>
              <div className={SD_FORM_GRID_MD}>{fields.map((field) => renderField(form, field))}</div>
            </form>
          </Form>

          <DialogFooter className={SD_DIALOG_FOOTER_FORM}>
            <Button
              type="button"
              variant="ghost"
              className={SD_SECONDARY_BUTTON_FORM}
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Iptal
            </Button>
            <Button
              type="button"
              variant="ghost"
              className={SD_PRIMARY_BUTTON_FORM}
              disabled={isLoading}
              onClick={() => {
                void handleSubmit();
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                submitLabel ?? (isEditMode ? 'Guncelle' : 'Kaydet')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
