import { type ReactElement, type ReactNode, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { fieldClass, NONE_SELECT_VALUE, normalizeSelectValue, sanitizeSelectOptions } from '../lib/salesdesk-shared';
import {
  SD_FORM_LABEL,
  SD_PRIMARY_BUTTON,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
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
          <FormItem className={field.colSpan === 2 ? 'sm:col-span-2' : field.colSpan === 3 ? 'sm:col-span-3' : ''}>
            <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
            <Select
              value={normalizeSelectValue(String(controlField.value ?? ''))}
              onValueChange={(value) =>
                controlField.onChange(value === NONE_SELECT_VALUE ? NONE_SELECT_VALUE : value)
              }
            >
              <FormControl>
                <SelectTrigger className={fieldClass}>
                  <SelectValue placeholder={field.placeholder ?? 'Secin'} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {selectOptions.map((option) => (
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
                className="h-4 w-4 rounded border-white/20 bg-transparent"
              />
            </FormControl>
            <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
            <FormMessage />
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
          <FormItem className={field.colSpan === 2 ? 'sm:col-span-2' : field.colSpan === 3 ? 'sm:col-span-3' : ''}>
            <FormLabel className={SD_FORM_LABEL}>{field.label}</FormLabel>
            <FormControl>
              <textarea
                {...controlField}
                className={`min-h-24 w-full rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-200 outline-none transition focus:border-[var(--crm-brand-primary)] focus:ring-4 focus:ring-[var(--crm-brand-ring)]`}
                placeholder={field.placeholder}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  }

  const inputType = field.type === 'number' ? 'number' : field.type === 'email' ? 'email' : field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text';

  return (
    <FormField
      key={String(field.name)}
      control={form.control}
      name={field.name}
      render={({ field: controlField }) => (
        <FormItem className={field.colSpan === 2 ? 'sm:col-span-2' : field.colSpan === 3 ? 'sm:col-span-3' : ''}>
          <FormLabel className="text-slate-300">{field.label}</FormLabel>
          <FormControl>
            <Input
              {...controlField}
              type={inputType}
              min={field.min}
              max={field.max}
              step={field.step}
              className={fieldClass}
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
          <FormMessage />
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
}: SalesDeskEntityFormProps<T>): ReactElement {
  const isEditMode = entity != null;
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

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
      <DialogContent className={`max-h-[90vh] overflow-y-auto sm:max-w-2xl ${SD_SURFACE_DIALOG}`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="text-[var(--crm-app-text-muted)]">{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">{fields.map((field) => renderField(form, field))}</div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                className={SD_SECONDARY_BUTTON}
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Iptal
              </Button>
              <Button type="submit" variant="ghost" className={SD_PRIMARY_BUTTON} disabled={isLoading}>
                {isLoading ? 'Kaydediliyor...' : submitLabel ?? (isEditMode ? 'Guncelle' : 'Kaydet')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
      ) : null}
    </Dialog>
  );
}