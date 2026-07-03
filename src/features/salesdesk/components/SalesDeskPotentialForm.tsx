import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Hash, Mail, MapPin, Phone, Sparkles, User } from 'lucide-react';
import type { SalesDeskPotentialCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_POTENTIAL_STATUS_LABELS,
  salesDeskPotentialFormSchema,
  toPotentialFormValues,
  type SalesDeskPotentialFormValues,
} from '../types/potential-types';
import {
  SD_FORM_GRID_MD,
  SD_FORM_INPUT_MD,
  SD_FORM_MESSAGE,
  SD_SELECT_CONTENT,
} from '../lib/salesdesk-popup-styles';
import { SalesDeskFormDialog } from './SalesDeskFormDialog';
import { SalesDeskFormFieldLabel } from './SalesDeskFormFieldLabel';

const STATUS_OPTIONS = [1, 2, 3, 4, 5, 6] as const;

interface SalesDeskPotentialFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SalesDeskPotentialFormValues) => void | Promise<void>;
  potential?: SalesDeskPotentialCustomerDto | null;
  isLoading?: boolean;
}

export function SalesDeskPotentialForm({
  open,
  onOpenChange,
  onSubmit,
  potential,
  isLoading = false,
}: SalesDeskPotentialFormProps): ReactElement {
  const isEditMode = potential != null;
  const formId = 'salesdesk-potential-form';
  const form = useForm<SalesDeskPotentialFormValues>({
    resolver: zodResolver(salesDeskPotentialFormSchema),
    mode: 'onChange',
    defaultValues: toPotentialFormValues(),
  });

  useEffect(() => {
    if (open) {
      form.reset(potential ? toPotentialFormValues(potential) : toPotentialFormValues());
    }
  }, [open, potential, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <SalesDeskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Potansiyel Duzenle' : 'Potansiyel Ekle'}
      description={
        isEditMode
          ? 'Potansiyel cari bilgilerini guncelleyin.'
          : 'Yeni potansiyel cari kaydi olusturun.'
      }
      icon={Sparkles}
      formId={formId}
      submitLabel={isEditMode ? 'Guncelle' : 'Kaydet'}
      isSaving={isLoading}
    >
      <Form {...form}>
        <form id={formId} onSubmit={handleSubmit} className={SD_FORM_GRID_MD}>
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={Hash}>Kod</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="Otomatik uretilir" />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={Sparkles}>Durum</SalesDeskFormFieldLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(value) =>
                    field.onChange(Number(value) as SalesDeskPotentialFormValues['status'])
                  }
                >
                  <FormControl>
                    <SelectTrigger className={SD_FORM_INPUT_MD}>
                      <SelectValue placeholder="Durum secin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={SD_SELECT_CONTENT}>
                    {STATUS_OPTIONS.map((status) => (
                      <SelectItem key={status} value={String(status)}>
                        {SALES_DESK_POTENTIAL_STATUS_LABELS[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem className="space-y-0 sm:col-span-2">
                <SalesDeskFormFieldLabel icon={Building2} required>
                  Firma Adi
                </SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="Firma veya sirket adi" />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactName"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={User}>Yetkili</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={Phone}>Telefon</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-0 sm:col-span-2">
                <SalesDeskFormFieldLabel icon={Mail}>E-posta</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} type="email" className={SD_FORM_INPUT_MD} />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={MapPin}>Il</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="district"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={MapPin}>Ilce</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="matchScore"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={Sparkles}>Eslesme Skoru</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="number"
                    min={0}
                    max={100}
                    className={SD_FORM_INPUT_MD}
                    onChange={(event) => field.onChange(Number(event.target.value))}
                  />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </SalesDeskFormDialog>
  );
}
