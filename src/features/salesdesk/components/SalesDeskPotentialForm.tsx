import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import type { SalesDeskPotentialCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_POTENTIAL_STATUS_LABELS,
  salesDeskPotentialFormSchema,
  toPotentialFormValues,
  type SalesDeskPotentialFormValues,
} from '../types/potential-types';
import {
  SD_FORM_INPUT,
  SD_FORM_LABEL,
  SD_PRIMARY_BUTTON,
  SD_SECONDARY_BUTTON,
  SD_SURFACE_DIALOG,
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

  const form = useForm<SalesDeskPotentialFormValues>({
    resolver: zodResolver(salesDeskPotentialFormSchema),
    mode: 'onChange',
    defaultValues: toPotentialFormValues(potential),
  });

  useEffect(() => {
    if (open) {
      form.reset(toPotentialFormValues(potential));
    }
  }, [open, potential, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`max-h-[90vh] overflow-y-auto sm:max-w-xl ${SD_SURFACE_DIALOG}`}>
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Potansiyel Duzenle' : 'Potansiyel Ekle'}</DialogTitle>
          <DialogDescription className="text-[var(--crm-app-text-muted)]">
            {isEditMode ? 'Potansiyel cari bilgilerini guncelleyin.' : 'Yeni potansiyel cari kaydi olusturun.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Kod</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} placeholder="Otomatik uretilir" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Durum</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) =>
                        field.onChange(Number(value) as SalesDeskPotentialFormValues['status'])
                      }
                    >
                      <FormControl>
                        <SelectTrigger className={SD_FORM_INPUT}>
                          <SelectValue placeholder="Durum secin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUS_OPTIONS.map((status) => (
                          <SelectItem key={status} value={String(status)}>
                            {SALES_DESK_POTENTIAL_STATUS_LABELS[status]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="companyName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={SD_FORM_LABEL}>Firma Adi *</FormLabel>
                  <FormControl>
                    <Input {...field} className={SD_FORM_INPUT} placeholder="Firma veya sirket adi" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Yetkili</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={SD_FORM_LABEL}>E-posta</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className={SD_FORM_INPUT} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-3">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Il</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Ilce</FormLabel>
                    <FormControl>
                      <Input {...field} className={SD_FORM_INPUT} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="matchScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_FORM_LABEL}>Eslesme Skoru</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        min={0}
                        max={100}
                        className={SD_FORM_INPUT}
                        onChange={(event) => field.onChange(Number(event.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                {isLoading ? 'Kaydediliyor...' : isEditMode ? 'Guncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
