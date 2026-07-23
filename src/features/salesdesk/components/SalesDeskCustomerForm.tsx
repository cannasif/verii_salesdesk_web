import { type ReactElement, useEffect } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
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
import { Building2, CreditCard, Hash, Mail, MapPin, Phone, Tag, User } from 'lucide-react';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_CUSTOMER_KIND_LABELS,
  salesDeskCustomerFormSchema,
  toCustomerFormValues,
  type SalesDeskCustomerFormValues,
} from '../types/customer-types';
import {
  SD_FORM_GRID_MD,
  SD_FORM_HINT,
  SD_FORM_INPUT_MD,
  SD_FORM_MESSAGE,
  SD_SELECT_CONTENT,
} from '../lib/salesdesk-popup-styles';
import { SalesDeskFormDialog } from './SalesDeskFormDialog';
import { SalesDeskFormFieldLabel } from './SalesDeskFormFieldLabel';

interface SalesDeskCustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SalesDeskCustomerFormValues) => void | Promise<void>;
  customer?: SalesDeskCustomerDto | null;
  isLoading?: boolean;
}

export function SalesDeskCustomerForm({
  open,
  onOpenChange,
  onSubmit,
  customer,
  isLoading = false,
}: SalesDeskCustomerFormProps): ReactElement {
  const isEditMode = customer != null;

  const form = useForm<SalesDeskCustomerFormValues>({
    resolver: zodResolver(salesDeskCustomerFormSchema),
    mode: 'onChange',
    defaultValues: toCustomerFormValues(customer),
  });

  useEffect(() => {
    if (open) {
      form.reset(toCustomerFormValues(customer));
    }
  }, [open, customer, form]);

  const handleSubmit = async (values: SalesDeskCustomerFormValues): Promise<void> => {
    await onSubmit(values);
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  const handleInvalidSubmit = (errors: FieldErrors<SalesDeskCustomerFormValues>): void => {
    const firstField = Object.keys(errors)[0] as keyof SalesDeskCustomerFormValues | undefined;
    if (firstField) {
      form.setFocus(firstField);
    }
  };

  return (
    <SalesDeskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? 'Cari Duzenle' : 'Yeni Cari Ekle'}
      description={isEditMode ? 'Cari bilgilerini guncelleyin.' : 'Yeni cari kaydi olusturun.'}
      icon={Building2}
      formId="salesdesk-customer-form"
      submitLabel={isEditMode ? 'Guncelle' : 'Kaydet'}
      isSaving={isLoading}
    >
      <Form {...form}>
        <form
          id="salesdesk-customer-form"
          onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
          className={SD_FORM_GRID_MD}
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-0 sm:col-span-2">
                <SalesDeskFormFieldLabel icon={Building2} required>
                  Cari Adi
                </SalesDeskFormFieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={SD_FORM_INPUT_MD}
                    placeholder="Firma veya kisi adini girin"
                  />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={Hash}>Kod</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="Bos birakilirsa otomatik" />
                </FormControl>
                <FormDescription className={SD_FORM_HINT}>
                  Kod bos birakilirsa sistem tarafindan uretilir.
                </FormDescription>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="kind"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={Tag}>Tip</SalesDeskFormFieldLabel>
                <Select
                  value={String(field.value)}
                  onValueChange={(value) =>
                    field.onChange(Number(value) as SalesDeskCustomerFormValues['kind'])
                  }
                >
                  <FormControl>
                    <SelectTrigger className={SD_FORM_INPUT_MD}>
                      <SelectValue placeholder="Tip secin" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className={SD_SELECT_CONTENT}>
                    {([1, 2, 3] as const).map((kind) => (
                      <SelectItem key={kind} value={String(kind)}>
                        {SALES_DESK_CUSTOMER_KIND_LABELS[kind]}
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
            name="contactName"
            render={({ field }) => (
              <FormItem className="space-y-0">
                <SalesDeskFormFieldLabel icon={User}>Yetkili</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="Yetkili kisi" />
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
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="+90 5xx xxx xx xx" />
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
                  <Input
                    {...field}
                    type="email"
                    className={SD_FORM_INPUT_MD}
                    placeholder="ornek@sirket.com"
                  />
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
                <SalesDeskFormFieldLabel icon={MapPin}>İl</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="İl" />
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
                <SalesDeskFormFieldLabel icon={MapPin}>İlçe</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input {...field} className={SD_FORM_INPUT_MD} placeholder="İlçe" />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem className="space-y-0 sm:col-span-2">
                <SalesDeskFormFieldLabel icon={CreditCard}>Bakiye (TRY)</SalesDeskFormFieldLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    className={`${SD_FORM_INPUT_MD} sm:max-w-[280px]`}
                    value={field.value}
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
