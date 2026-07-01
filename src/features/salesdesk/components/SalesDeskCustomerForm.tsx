import { type ReactElement, type ReactNode, useEffect } from 'react';
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
  FormDescription,
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
import {
  Building2,
  CreditCard,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Tag,
  User,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_CUSTOMER_KIND_LABELS,
  salesDeskCustomerFormSchema,
  toCustomerFormValues,
  type SalesDeskCustomerFormValues,
} from '../types/customer-types';
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
  SD_FORM_GRID_MD,
  SD_FORM_HINT,
  SD_FORM_INPUT_MD,
  SD_FORM_LABEL_ICON,
  SD_FORM_LABEL_ICON_SVG,
  SD_FORM_MESSAGE,
  SD_PRIMARY_BUTTON_FORM,
  SD_SECONDARY_BUTTON_FORM,
  SD_SELECT_CONTENT,
} from '../lib/salesdesk-popup-styles';

interface SalesDeskCustomerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SalesDeskCustomerFormValues) => void | Promise<void>;
  customer?: SalesDeskCustomerDto | null;
  isLoading?: boolean;
}

function IconLabel({
  icon: Icon,
  children,
  required,
}: {
  icon: LucideIcon;
  children: ReactNode;
  required?: boolean;
}): ReactElement {
  return (
    <FormLabel className={SD_FORM_LABEL_ICON}>
      <Icon size={14} className={SD_FORM_LABEL_ICON_SVG} strokeWidth={2.2} />
      <span>
        {children}
        {required ? <span className="ml-0.5 text-red-400">*</span> : null}
      </span>
    </FormLabel>
  );
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
      <DialogContent showCloseButton={false} className={SD_DIALOG_CONTENT_FORM}>
        <DialogHeader className={SD_DIALOG_HEADER_FORM}>
          <div className="flex min-w-0 items-center gap-3.5">
            <div className={SD_DIALOG_ICON_RING_FORM}>
              <Building2 size={20} className={SD_DIALOG_ICON} />
            </div>
            <div className="min-w-0">
              <DialogTitle className={`${SD_DIALOG_TITLE} text-lg`}>
                {isEditMode ? 'Cari Duzenle' : 'Yeni Cari Ekle'}
              </DialogTitle>
              <DialogDescription className={`${SD_DIALOG_DESC} mt-0.5`}>
                {isEditMode ? 'Cari bilgilerini guncelleyin.' : 'Yeni cari kaydi olusturun.'}
              </DialogDescription>
            </div>
          </div>
          <button type="button" onClick={() => onOpenChange(false)} className={SD_DIALOG_CLOSE}>
            <X size={18} className="relative z-10" />
          </button>
        </DialogHeader>

        <div className={SD_DIALOG_BODY_FORM}>
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
                    <IconLabel icon={Building2} required>
                      Cari Adi
                    </IconLabel>
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
                    <IconLabel icon={Hash}>Kod</IconLabel>
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
                    <IconLabel icon={Tag}>Tip</IconLabel>
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
                    <IconLabel icon={User}>Yetkili</IconLabel>
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
                    <IconLabel icon={Phone}>Telefon</IconLabel>
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
                    <IconLabel icon={Mail}>E-posta</IconLabel>
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
                    <IconLabel icon={MapPin}>Il</IconLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT_MD} placeholder="Il" />
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
                    <IconLabel icon={MapPin}>Ilce</IconLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT_MD} placeholder="Ilce" />
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
                    <IconLabel icon={CreditCard}>Bakiye (TRY)</IconLabel>
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
        </div>

        <DialogFooter className={SD_DIALOG_FOOTER_FORM}>
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className={SD_SECONDARY_BUTTON_FORM}
          >
            Iptal
          </Button>
          <Button
            type="submit"
            variant="ghost"
            form="salesdesk-customer-form"
            disabled={isLoading}
            className={SD_PRIMARY_BUTTON_FORM}
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
