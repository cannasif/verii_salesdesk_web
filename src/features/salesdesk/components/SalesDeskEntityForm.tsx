import { type ReactElement, type ReactNode, useEffect } from 'react';
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
import { type DefaultValues, type FieldValues, type Path, useForm, type Resolver, type UseFormReturn, type Mode } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { type ZodTypeAny } from 'zod';
import { toast } from 'sonner';
import { FilePenLine } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { NONE_SELECT_VALUE, normalizeSelectValue, sanitizeSelectOptions } from '../lib/salesdesk-shared';
import {
  SD_FORM_FOCUS_GLOW,
  SD_FORM_GRID_MD,
  SD_FORM_INPUT_MD,
  SD_FORM_LABEL,
  SD_FORM_MESSAGE,
  SD_SELECT_CONTENT,
} from '../lib/salesdesk-popup-styles';
import { SalesDeskFormDialog } from './SalesDeskFormDialog';
import { SalesDeskFormFieldLabel } from './SalesDeskFormFieldLabel';

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
  icon?: LucideIcon;
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
  validateMode?: Mode;
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
  const LabelComponent = field.icon ? (
    <SalesDeskFormFieldLabel icon={field.icon} required={field.required}>
      {field.label}
    </SalesDeskFormFieldLabel>
  ) : (
    <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
  );

  if (field.type === 'select') {
    const selectOptions = sanitizeSelectOptions(field.options ?? []);
    return (
      <FormField
        key={String(field.name)}
        control={form.control}
        name={field.name}
        render={({ field: controlField }) => (
          <FormItem className={colSpanClass(field.colSpan)}>
            {LabelComponent}
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
          <FormItem className="flex items-center gap-2 space-y-0 pt-8">
            <FormControl>
              <input
                type="checkbox"
                checked={Boolean(controlField.value)}
                onChange={(event) => controlField.onChange(event.target.checked)}
                className="h-4 w-4 rounded border-[var(--crm-app-border)] bg-transparent"
              />
            </FormControl>
            {LabelComponent}
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
            {LabelComponent}
            <FormControl>
              <textarea
                {...controlField}
                className={`min-h-28 w-full rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-900 outline-none dark:text-slate-100 ${SD_FORM_FOCUS_GLOW} transition-[color,box-shadow,border-color] duration-200`}
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
          {LabelComponent}
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
  validateMode = 'onChange',
}: SalesDeskEntityFormProps<T>): ReactElement {
  const isEditMode = entity != null;
  const formId = 'salesdesk-entity-form';
  const form = useForm<T>({
    resolver: zodResolver(schema as never) as Resolver<T>,
    mode: validateMode,
    defaultValues,
  });

  const isSubmitting = form.formState.isSubmitting;
  const isSaving = isLoading || isSubmitting;

  useEffect(() => {
    if (open) {
      form.reset(entity && mapEntityToForm ? mapEntityToForm(entity) : defaultValues);
    }
  }, [open, entity, form, defaultValues, mapEntityToForm]);

  const handleSubmit = form.handleSubmit(
    async (values) => {
      try {
        await onSubmit(values);
        onOpenChange(false);
      } catch {
        // Hata durumunda form acik kalsin; toast mutation veya sayfa tarafinda gosterilir.
      }
    },
    (errors) => {
      const firstError = Object.values(errors).find(
        (fieldError) => fieldError && typeof (fieldError as { message?: unknown }).message === 'string'
      ) as { message?: string } | undefined;
      toast.error(firstError?.message || 'Lutfen zorunlu alanlari kontrol edin.');
    }
  );

  return (
    <SalesDeskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={Icon}
      formId={formId}
      submitLabel={submitLabel ?? (isEditMode ? 'Guncelle' : 'Kaydet')}
      isSaving={isSaving}
    >
      <Form {...form}>
        <form id={formId} onSubmit={handleSubmit} className={SD_FORM_GRID_MD}>
          {fields.map((field) => renderField(form, field))}
        </form>
      </Form>
    </SalesDeskFormDialog>
  );
}
