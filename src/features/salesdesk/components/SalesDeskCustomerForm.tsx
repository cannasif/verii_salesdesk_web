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
import type { SalesDeskCustomerDto } from '../api/salesdesk-api';
import {
  SALES_DESK_CUSTOMER_KIND_LABELS,
  salesDeskCustomerFormSchema,
  toCustomerFormValues,
  type SalesDeskCustomerFormValues,
} from '../types/customer-types';

const fieldClass =
  'h-11 rounded-lg border border-white/10 bg-[#070a13]/85 px-4 text-sm text-slate-200 outline-none transition focus:border-violet-400/70 focus:ring-4 focus:ring-violet-500/10';

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

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
    onOpenChange(false);
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border border-white/10 bg-[#0a0f1e] text-slate-100 sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Cari Duzenle' : 'Yeni Cari Ekle'}</DialogTitle>
          <DialogDescription className="text-slate-400">
            {isEditMode ? 'Cari bilgilerini guncelleyin.' : 'Yeni cari kaydi olusturun.'}
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
                    <FormLabel className="text-slate-300">Kod</FormLabel>
                    <FormControl>
                      <Input {...field} className={fieldClass} placeholder="Otomatik uretilir" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kind"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Tip</FormLabel>
                    <Select
                      value={String(field.value)}
                      onValueChange={(value) => field.onChange(Number(value) as SalesDeskCustomerFormValues['kind'])}
                    >
                      <FormControl>
                        <SelectTrigger className={fieldClass}>
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
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-slate-300">Cari Adi *</FormLabel>
                  <FormControl>
                    <Input {...field} className={fieldClass} placeholder="Firma veya kisi adi" />
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
                    <FormLabel className="text-slate-300">Yetkili</FormLabel>
                    <FormControl>
                      <Input {...field} className={fieldClass} />
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
                    <FormLabel className="text-slate-300">Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} className={fieldClass} />
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
                  <FormLabel className="text-slate-300">E-posta</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" className={fieldClass} />
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
                    <FormLabel className="text-slate-300">Il</FormLabel>
                    <FormControl>
                      <Input {...field} className={fieldClass} />
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
                    <FormLabel className="text-slate-300">Ilce</FormLabel>
                    <FormControl>
                      <Input {...field} className={fieldClass} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="balance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-slate-300">Bakiye</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        className={fieldClass}
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
                variant="outline"
                className="border-white/10 bg-transparent text-slate-200 hover:bg-white/5"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Iptal
              </Button>
              <Button type="submit" className="bg-violet-500 hover:bg-violet-400" disabled={isLoading}>
                {isLoading ? 'Kaydediliyor...' : isEditMode ? 'Guncelle' : 'Kaydet'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
