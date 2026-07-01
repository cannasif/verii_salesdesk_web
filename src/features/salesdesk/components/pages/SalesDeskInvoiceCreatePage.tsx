import { type ReactElement, useEffect } from 'react';
import { ChevronLeft, CreditCard, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useForm, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { useCreateSalesDeskInvoice, useSalesDeskCustomerOptions } from '../../hooks/useSalesDeskModules';
import { enumToSelectOptions, fieldClass, normalizeSelectValue, NONE_SELECT_VALUE, surfaceClass } from '../../lib/salesdesk-shared';
import { DOCUMENT_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  invoiceFormSchema,
  toInvoiceFormValues,
  type InvoiceFormValues,
} from '../../types/salesdesk-schemas';

export function SalesDeskInvoiceCreatePage(): ReactElement {
  const navigate = useNavigate();
  const createInvoice = useCreateSalesDeskInvoice();
  const { data: customers, isLoading: customersLoading } = useSalesDeskCustomerOptions();

  const customerOptions = (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }));
  const statusOptions = enumToSelectOptions(DOCUMENT_STATUS_LABELS);

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema as never) as Resolver<InvoiceFormValues>,
    defaultValues: toInvoiceFormValues(),
  });

  useEffect(() => {
    form.reset(toInvoiceFormValues());
  }, [form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await createInvoice.mutateAsync(values);
    navigate('/salesdesk/invoices');
  });

  return (
    <div className="space-y-5 text-slate-100">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-pink-400/20 bg-pink-500/15 text-pink-300">
          <CreditCard size={22} />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Yeni Satis Faturasi</h1>
          <p className="mt-1 text-sm text-slate-400">Fatura baslik bilgilerini doldurun ve kaydedin.</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate('/salesdesk/invoices')}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-4 text-sm text-slate-200 hover:bg-white/5"
      >
        <ChevronLeft size={16} />
        Geri
      </button>

      <section className={`rounded-xl p-5 ${surfaceClass}`}>
        {customersLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-violet-300" size={28} />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Fatura No</FormLabel>
                      <FormControl>
                        <Input {...field} className={fieldClass} placeholder="Otomatik" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Musteri</FormLabel>
                      <Select
                        value={normalizeSelectValue(String(field.value ?? ''))}
                        onValueChange={(value) =>
                          field.onChange(value === NONE_SELECT_VALUE ? NONE_SELECT_VALUE : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className={fieldClass}>
                            <SelectValue placeholder="Cari secin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customerOptions.map((option) => (
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
                <FormField
                  control={form.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Fatura Tarihi</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className={fieldClass} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Vade Tarihi</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" className={fieldClass} />
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
                      <FormLabel className="text-slate-300">Durum</FormLabel>
                      <Select
                        value={normalizeSelectValue(String(field.value ?? ''))}
                        onValueChange={(value) =>
                          field.onChange(value === NONE_SELECT_VALUE ? NONE_SELECT_VALUE : value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className={fieldClass}>
                            <SelectValue placeholder="Durum secin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {statusOptions.map((option) => (
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
                <FormField
                  control={form.control}
                  name="discountRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-slate-300">Iskonto Orani (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          className={fieldClass}
                          value={field.value}
                          onChange={(event) => field.onChange(Number(event.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className="text-slate-300">Notlar</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          className="min-h-24 w-full rounded-lg border border-white/10 bg-[#070a13]/85 px-4 py-3 text-sm text-slate-200 outline-none"
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
                  className="border-white/10 bg-transparent text-slate-200"
                  onClick={() => navigate('/salesdesk/invoices')}
                >
                  Iptal
                </Button>
                <Button type="submit" className="bg-violet-500 hover:bg-violet-400" disabled={createInvoice.isPending}>
                  {createInvoice.isPending ? 'Kaydediliyor...' : 'Faturayi Olustur'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </section>
    </div>
  );
}
