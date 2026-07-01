import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
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
import {
  Building2,
  Hash,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  User,
  X,
} from 'lucide-react';
import type { SalesDeskPotentialCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_POTENTIAL_STATUS_LABELS,
  salesDeskPotentialFormSchema,
  toPotentialFormValues,
  type SalesDeskPotentialFormValues,
} from '../types/potential-types';
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
  SD_FORM_INPUT_MD,
  SD_FORM_LABEL_ICON,
  SD_FORM_LABEL_ICON_SVG,
  SD_FORM_MESSAGE,
  SD_PRIMARY_BUTTON_FORM,
  SD_SECONDARY_BUTTON_FORM,
  SD_SELECT_CONTENT,
} from '../lib/salesdesk-popup-styles';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent className={SD_DIALOG_CONTENT_FORM} showCloseButton={false}>
          <DialogHeader className={SD_DIALOG_HEADER_FORM}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className={SD_DIALOG_ICON_RING_FORM}>
                <Sparkles className={`h-5 w-5 ${SD_DIALOG_ICON}`} aria-hidden />
              </div>
              <div className="min-w-0 space-y-0.5">
                <DialogTitle className={SD_DIALOG_TITLE}>
                  {isEditMode ? 'Potansiyel Duzenle' : 'Potansiyel Ekle'}
                </DialogTitle>
                <DialogDescription className={SD_DIALOG_DESC}>
                  {isEditMode
                    ? 'Potansiyel cari bilgilerini guncelleyin.'
                    : 'Yeni potansiyel cari kaydi olusturun.'}
                </DialogDescription>
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
              <div className={SD_FORM_GRID_MD}>
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <Hash className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Kod
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <Sparkles className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Durum
                      </FormLabel>
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
                    <FormItem className="sm:col-span-2">
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <Building2 className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Firma Adi *
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <User className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Yetkili
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <Phone className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Telefon
                      </FormLabel>
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
                    <FormItem className="sm:col-span-2">
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <Mail className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        E-posta
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <MapPin className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Il
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <MapPin className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Ilce
                      </FormLabel>
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
                    <FormItem>
                      <FormLabel className={SD_FORM_LABEL_ICON}>
                        <Sparkles className={`h-3.5 w-3.5 ${SD_FORM_LABEL_ICON_SVG}`} />
                        Eslesme Skoru
                      </FormLabel>
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
              </div>
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
              type="submit"
              form={formId}
              variant="ghost"
              className={SD_PRIMARY_BUTTON_FORM}
              disabled={isLoading}
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
      ) : null}
    </Dialog>
  );
}
