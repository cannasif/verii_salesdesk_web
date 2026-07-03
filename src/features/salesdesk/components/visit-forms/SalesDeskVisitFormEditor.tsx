import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FilePenLine, Loader2, Save, Smartphone, UsersRound, X } from 'lucide-react';
import { toast } from 'sonner';
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
import type { SalesDeskCustomerDto, SalesDeskVisitFormDto } from '../../api/salesdesk-api';
import {
  SD_CREATE_ACTION_BAR_CLASSNAME,
  SD_CREATE_FORM_INPUT_CLASSNAME,
  SD_CREATE_FORM_LABEL_CLASSNAME,
  SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME,
  SD_CREATE_PAGE_CONTAINER_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';
import {
  SD_DOCUMENT_BUTTON_BASE,
  SD_DOCUMENT_BUTTON_SAVE,
} from '../../lib/salesdesk-document-button-styles';
import { buildDefaultVisitFormTitle } from '../../lib/visit-form-content';
import { normalizeSelectValue, sanitizeSelectOptions } from '../../lib/salesdesk-shared';
import { SD_SELECT_CONTENT } from '../../lib/salesdesk-popup-styles';
import {
  createDefaultVisitFormRecordValues,
  toVisitFormRecordValues,
  visitFormRecordFormSchema,
  type VisitFormRecordValues,
} from '../../types/salesdesk-schemas';
import { SalesDeskVisitFormSection } from './SalesDeskVisitFormSection';

interface SalesDeskVisitFormEditorProps {
  customers: SalesDeskCustomerDto[];
  customersLoading?: boolean;
  entity?: SalesDeskVisitFormDto | null;
  visitorName?: string;
  isSaving?: boolean;
  onSubmit: (values: VisitFormRecordValues) => Promise<void>;
  onCancel: () => void;
}

export function SalesDeskVisitFormEditor({
  customers,
  customersLoading = false,
  entity,
  visitorName,
  isSaving = false,
  onSubmit,
  onCancel,
}: SalesDeskVisitFormEditorProps): ReactElement {
  const isEditMode = entity != null;
  const form = useForm<VisitFormRecordValues>({
    resolver: zodResolver(visitFormRecordFormSchema),
    mode: 'onChange',
    defaultValues: entity ? toVisitFormRecordValues(entity) : createDefaultVisitFormRecordValues(visitorName),
  });

  useEffect(() => {
    if (entity) {
      form.reset(toVisitFormRecordValues(entity));
      return;
    }

    const currentVisitor = form.getValues('visitorName')?.trim();
    if (!currentVisitor && visitorName?.trim()) {
      form.setValue('visitorName', visitorName.trim(), { shouldDirty: false });
    }
  }, [entity, visitorName, form]);

  const customerOptions = sanitizeSelectOptions(
    customers.map((customer) => ({ value: String(customer.id), label: customer.name }))
  );

  const handleCustomerChange = (customerId: string): void => {
    form.setValue('customerId', customerId, { shouldValidate: true });
    const customer = customers.find((item) => String(item.id) === customerId);
    if (!customer) return;

    const currentEmail = form.getValues('recipientEmail')?.trim();
    const currentPhone = form.getValues('recipientPhone')?.trim();
    if (!currentEmail && customer.email) {
      form.setValue('recipientEmail', customer.email, { shouldDirty: true });
    }
    if (!currentPhone && customer.phone) {
      form.setValue('recipientPhone', customer.phone, { shouldDirty: true });
    }
    if (!form.getValues('contactedPerson')?.trim() && customer.contactName) {
      form.setValue('contactedPerson', customer.contactName, { shouldDirty: true });
    }
  };

  const handleFormDateChange = (formDate: string): void => {
    form.setValue('formDate', formDate, { shouldValidate: true });
    const currentTitle = form.getValues('title')?.trim();
    if (!currentTitle || currentTitle.startsWith('Ziyaret Formu -')) {
      form.setValue('title', buildDefaultVisitFormTitle(formDate), { shouldDirty: true });
    }
  };

  const submit = form.handleSubmit(
    async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Kayit kaydedilemedi.';
        toast.error(message);
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
    <Form {...form}>
      <form onSubmit={submit} className={SD_CREATE_PAGE_CONTAINER_CLASSNAME}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
              {isEditMode ? 'Ziyaret Formunu Duzenle' : 'Yeni Ziyaret Formu'}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Cari ziyaret bilgilerini kaydedin, PDF olusturun ve paylasin
            </p>
          </div>
        </div>

        <div className={`mt-6 space-y-6 ${SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME}`}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SalesDeskVisitFormSection
              icon={UsersRound}
              title="Ziyaret Bilgileri"
              subtitle="Cari, tarih ve kisi"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Cari (Firma) *</FormLabel>
                      <Select
                        value={normalizeSelectValue(field.value)}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCustomerChange(value);
                        }}
                        disabled={customersLoading}
                      >
                        <FormControl>
                          <SelectTrigger className={SD_CREATE_FORM_INPUT_CLASSNAME}>
                            <SelectValue placeholder="Cari secin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={SD_SELECT_CONTENT}>
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Baslik *</FormLabel>
                      <FormControl>
                        <Input {...field} className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="formDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Ziyaret Tarihi *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="date"
                            className={SD_CREATE_FORM_INPUT_CLASSNAME}
                            onChange={(event) => handleFormDateChange(event.target.value)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="visitorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Ziyareti Yapan</FormLabel>
                        <FormControl>
                          <Input {...field} className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactedPerson"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Gorusulen Kisi</FormLabel>
                      <FormControl>
                        <Input {...field} className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SalesDeskVisitFormSection>

            <SalesDeskVisitFormSection
              icon={Smartphone}
              title="Gonderim"
              subtitle="Alici iletisim (cari seciminden otomatik dolar)"
              badgeClassName="bg-sky-500/10 text-sky-600 ring-1 ring-sky-400/25 dark:text-sky-300"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="recipientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Alici E-posta</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="text"
                          inputMode="email"
                          autoComplete="email"
                          className={SD_CREATE_FORM_INPUT_CLASSNAME}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Alici Telefon</FormLabel>
                      <FormControl>
                        <Input {...field} className={SD_CREATE_FORM_INPUT_CLASSNAME} placeholder="+90..." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </SalesDeskVisitFormSection>
          </div>

          <SalesDeskVisitFormSection
            icon={FilePenLine}
            title="Ziyaret Icerigi"
            subtitle="Yapilanlar ve sonraki adimlar"
            badgeClassName="bg-violet-500/10 text-violet-600 ring-1 ring-violet-400/25 dark:text-violet-300"
          >
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Yapilanlar / Notlar</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={7}
                        className="w-full rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:border-[var(--crm-brand-accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--crm-brand-focus-glow)] dark:text-slate-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nextSteps"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Sonraki Adimlar</FormLabel>
                    <FormControl>
                      <textarea
                        {...field}
                        rows={4}
                        className="w-full rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-900 shadow-sm outline-none focus-visible:border-[var(--crm-brand-accent)] focus-visible:ring-[3px] focus-visible:ring-[var(--crm-brand-focus-glow)] dark:text-slate-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </SalesDeskVisitFormSection>
        </div>

        <div className={SD_CREATE_ACTION_BAR_CLASSNAME}>
          <Button type="button" variant="outline" onClick={onCancel} className={SD_DOCUMENT_BUTTON_BASE}>
            <X size={16} />
            Iptal
          </Button>
          <Button type="submit" disabled={isSaving || form.formState.isSubmitting} className={SD_DOCUMENT_BUTTON_SAVE}>
            {isSaving || form.formState.isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={16} />
                {isEditMode ? 'Guncelle' : 'Kaydet'}
              </>
            )}
          </Button>
        </div>

        <input type="hidden" {...form.register('visitId')} />
      </form>
    </Form>
  );
}
