import { type ReactElement, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Cpu, Globe, Loader2, Save, Search, X } from 'lucide-react';
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
import type { SalesDeskPotentialCustomerDto, SalesDeskSoftwareResearchDto } from '../../api/salesdesk-api';
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
import { enumToSelectOptions, normalizeSelectValue, sanitizeSelectOptions, withNoneOption } from '../../lib/salesdesk-shared';
import { POTENTIAL_STATUS_LABELS } from '../../lib/salesdesk-labels';
import { SD_SELECT_CONTENT } from '../../lib/salesdesk-popup-styles';
import {
  createDefaultSoftwareResearchFormValues,
  softwareResearchFormSchema,
  toSoftwareResearchFormValues,
  type SoftwareResearchFormValues,
} from '../../types/salesdesk-schemas';
import { SalesDeskVisitFormSection } from '../visit-forms/SalesDeskVisitFormSection';

interface SalesDeskSoftwareResearchEditorProps {
  potentials: SalesDeskPotentialCustomerDto[];
  potentialsLoading?: boolean;
  entity?: SalesDeskSoftwareResearchDto | null;
  isSaving?: boolean;
  onSubmit: (values: SoftwareResearchFormValues) => Promise<void>;
  onCancel: () => void;
}

export function SalesDeskSoftwareResearchEditor({
  potentials,
  potentialsLoading = false,
  entity,
  isSaving = false,
  onSubmit,
  onCancel,
}: SalesDeskSoftwareResearchEditorProps): ReactElement {
  const isEditMode = entity != null;
  const form = useForm<SoftwareResearchFormValues>({
    resolver: zodResolver(softwareResearchFormSchema),
    mode: 'onChange',
    defaultValues: entity ? toSoftwareResearchFormValues(entity) : createDefaultSoftwareResearchFormValues(),
  });

  useEffect(() => {
    form.reset(entity ? toSoftwareResearchFormValues(entity) : createDefaultSoftwareResearchFormValues());
  }, [entity, form]);

  const potentialOptions = sanitizeSelectOptions(
    withNoneOption(
      potentials.map((item) => ({ value: String(item.id), label: item.companyName })),
      'Potansiyel secilmedi'
    )
  );
  const statusOptions = enumToSelectOptions(POTENTIAL_STATUS_LABELS);

  const submit = form.handleSubmit(
    async (values) => {
      try {
        await onSubmit(values);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Kayit kaydedilemedi.');
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
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-50">
            {isEditMode ? 'Arastirmayi Duzenle' : 'Yeni Yazilim Arastirmasi'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Potansiyel carilerde kullanilan yazilimlari kaydedin ve skorlayin
          </p>
        </div>

        <div className={`mt-6 space-y-6 ${SD_CREATE_HEADER_FORM_SURFACE_CLASSNAME}`}>
          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            <SalesDeskVisitFormSection
              icon={Search}
              title="Arastirma Ozeti"
              subtitle="Saglayici, firma ve durum"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="provider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Saglayici *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Orn. Logo, Mikro, SAP" className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="potentialCustomerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Potansiyel Cari</FormLabel>
                      <Select
                        value={normalizeSelectValue(field.value)}
                        onValueChange={field.onChange}
                        disabled={potentialsLoading}
                      >
                        <FormControl>
                          <SelectTrigger className={SD_CREATE_FORM_INPUT_CLASSNAME}>
                            <SelectValue placeholder="Firma secin" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className={SD_SELECT_CONTENT}>
                          {potentialOptions.map((option) => (
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

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Durum *</FormLabel>
                        <Select value={field.value} onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className={SD_CREATE_FORM_INPUT_CLASSNAME}>
                              <SelectValue placeholder="Durum secin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className={SD_SELECT_CONTENT}>
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
                    name="score"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Skor (0-100)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="number"
                            min={0}
                            max={100}
                            className={SD_CREATE_FORM_INPUT_CLASSNAME}
                            onChange={(event) => field.onChange(Number(event.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </SalesDeskVisitFormSection>

            <SalesDeskVisitFormSection
              icon={Globe}
              title="Teknik Detaylar"
              subtitle="Host, anahtar kelimeler ve kaynak"
              badgeClassName="bg-violet-500/10 text-violet-600 ring-1 ring-violet-400/25 dark:text-violet-300"
            >
              <div className="grid grid-cols-1 gap-4">
                <FormField
                  control={form.control}
                  name="host"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Host / Domain</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="ornek.com" className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sourceUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Kaynak URL</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://..." className={SD_CREATE_FORM_INPUT_CLASSNAME} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="keywords"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={SD_CREATE_FORM_LABEL_CLASSNAME}>Anahtar Kelimeler</FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          rows={4}
                          placeholder="ERP, muhasebe, bulut (virgul ile ayirin)"
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

          <SalesDeskVisitFormSection
            icon={Cpu}
            title="Skor Rehberi"
            subtitle="Arastirma sonucunu hizli degerlendirin"
            badgeClassName="bg-sky-500/10 text-sky-600 ring-1 ring-sky-400/25 dark:text-sky-300"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/60 px-4 py-3 text-sm">
                <p className="font-semibold text-emerald-600 dark:text-emerald-300">80-100 Guclu eslesme</p>
                <p className="mt-1 text-xs text-[var(--crm-app-text-muted)]">Net kanit, yuksek donusum potansiyeli</p>
              </div>
              <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/60 px-4 py-3 text-sm">
                <p className="font-semibold text-amber-600 dark:text-amber-300">50-79 Supheli / orta</p>
                <p className="mt-1 text-xs text-[var(--crm-app-text-muted)]">Ek arastirma veya teyit gerekir</p>
              </div>
              <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/60 px-4 py-3 text-sm">
                <p className="font-semibold text-slate-600 dark:text-slate-300">0-49 Zayif sinyal</p>
                <p className="mt-1 text-xs text-[var(--crm-app-text-muted)]">Dusuk oncelik veya bulunamadi</p>
              </div>
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
      </form>
    </Form>
  );
}
