import { type ReactElement, useEffect } from 'react';
import { useForm, type FieldErrors } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { BriefcaseBusiness, Loader2, X } from 'lucide-react';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_CUSTOMER_KIND_LABELS,
  salesDeskCustomerFormSchema,
  toCustomerFormValues,
  type SalesDeskCustomerFormValues,
} from '../types/customer-types';
import {
  SD_DIALOG_CLOSE,
  SD_DIALOG_ICON,
  SD_DIALOG_ICON_RING,
  SD_FORM_INPUT,
  SD_FORM_LABEL,
  SD_FORM_MESSAGE,
  SD_PRIMARY_BUTTON,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
} from '../lib/salesdesk-popup-styles';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={`flex max-h-[92vh] w-[calc(100vw-1rem)] flex-col overflow-hidden rounded-xl p-0 sm:w-[calc(50vw-2rem)] !max-w-[96vw] xl:max-w-[700px] ${SD_SURFACE_DIALOG}`}
      >
        <DialogHeader className="sticky top-0 z-10 flex shrink-0 flex-row items-center justify-between space-y-0 border-b border-[var(--crm-app-border)] bg-[var(--crm-app-dialog)] px-6 py-6 backdrop-blur-sm sm:px-8">
          <div className="flex items-center gap-4">
            <div className={SD_DIALOG_ICON_RING}>
              <BriefcaseBusiness size={22} className={SD_DIALOG_ICON} />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? 'Cari Duzenle' : 'Yeni Cari Ekle'}
              </DialogTitle>
              <DialogDescription className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {isEditMode ? 'Cari bilgilerini guncelleyin.' : 'Yeni cari kaydi olusturun.'}
              </DialogDescription>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className={SD_DIALOG_CLOSE}
          >
            <X size={20} className="relative z-10" />
          </button>
        </DialogHeader>

        <div className="custom-scrollbar flex-1 overflow-y-auto p-6 sm:p-8">
          <Form {...form}>
            <form
              id="salesdesk-customer-form"
              onSubmit={form.handleSubmit(handleSubmit, handleInvalidSubmit)}
              className="grid animate-in grid-cols-1 gap-6 fade-in slide-in-from-bottom-4 duration-500 sm:grid-cols-2"
            >
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={SD_FORM_LABEL}>Kod</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} placeholder="Otomatik uretilir" />
                    </FormControl>
                    <FormMessage className={SD_FORM_MESSAGE} />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className={SD_FORM_LABEL}>Tip</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) =>
                        field.onChange(Number(value) as SalesDeskCustomerFormValues['kind'])
                      }
                    >
                      <FormControl>
                        <SelectTrigger className={SD_FORM_INPUT}>
                          <SelectValue placeholder="Tip secin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
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
                name="name"
                render={({ field }) => (
                  <FormItem className="space-y-0 sm:col-span-2">
                    <FormLabel className={SD_FORM_LABEL}>Cari Adi *</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} placeholder="Firma veya kisi adi" />
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
                    <FormLabel className={SD_FORM_LABEL}>Yetkili</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
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
                    <FormLabel className={SD_FORM_LABEL}>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
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
                    <FormLabel className={SD_FORM_LABEL}>E-posta</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" className={SD_FORM_INPUT} />
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
                    <FormLabel className={SD_FORM_LABEL}>Il</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
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
                    <FormLabel className={SD_FORM_LABEL}>Ilce</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
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
                    <FormLabel className={SD_FORM_LABEL}>Bakiye</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        className={SD_FORM_INPUT}
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
        </div>

        <DialogFooter className="flex shrink-0 flex-row justify-end gap-4 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-dialog-footer)] px-6 py-6 backdrop-blur-sm sm:px-8">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={SD_SECONDARY_BUTTON}
          >
            Iptal
          </Button>
          <Button
            type="submit"
            variant="ghost"
            form="salesdesk-customer-form"
            disabled={isLoading}
            className={SD_PRIMARY_BUTTON}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Kaydediliyor...
              </>
            ) : isEditMode ? (
              'Guncelle'
            ) : (
              'Kaydet'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
