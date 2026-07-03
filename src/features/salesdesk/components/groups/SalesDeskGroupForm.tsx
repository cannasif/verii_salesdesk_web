import { type ReactElement, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { AlignLeft, Tag, UsersRound } from 'lucide-react';
import {
  salesDeskGroupFormSchema,
  type SalesDeskGroupDto,
  type SalesDeskGroupFormSchema,
} from '../../types/salesdesk-group-types';
import { SalesDeskGroupMemberSelect } from './SalesDeskGroupMemberSelect';
import {
  SD_FORM_FOCUS_GLOW,
  SD_FORM_GRID_MD,
  SD_FORM_INPUT_MD,
  SD_FORM_LABEL,
  SD_FORM_MESSAGE,
} from '../../lib/salesdesk-popup-styles';
import { SalesDeskFormDialog } from '../SalesDeskFormDialog';
import { SalesDeskFormFieldLabel } from '../SalesDeskFormFieldLabel';

interface SalesDeskGroupFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: SalesDeskGroupFormSchema) => void | Promise<void>;
  item?: SalesDeskGroupDto | null;
  isLoading?: boolean;
  showMembers?: boolean;
}

export function SalesDeskGroupForm({
  open,
  onOpenChange,
  onSubmit,
  item,
  isLoading = false,
  showMembers = true,
}: SalesDeskGroupFormProps): ReactElement {
  const formId = 'salesdesk-group-form';
  const form = useForm<SalesDeskGroupFormSchema>({
    resolver: zodResolver(salesDeskGroupFormSchema),
    defaultValues: {
      name: '',
      description: '',
      memberUserIds: [],
    },
  });

  const wasOpenRef = useRef(false);

  useEffect(() => {
    if (!open) {
      wasOpenRef.current = false;
      return;
    }

    if (wasOpenRef.current) {
      return;
    }

    wasOpenRef.current = true;
    form.reset({
      name: item?.name ?? '',
      description: item?.description ?? '',
      memberUserIds: item?.memberUserIds ?? [],
    });
  }, [open, item?.id, item?.name, item?.description, item?.memberUserIds, form]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await onSubmit(values);
  });

  return (
    <SalesDeskFormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={item ? 'Grubu Duzenle' : 'Yeni Grup Olustur'}
      description={
        item
          ? 'Grup bilgilerini ve uyelerini guncelleyin.'
          : 'Ekip icin yeni bir grup olusturup kullanicilari ekleyin.'
      }
      icon={UsersRound}
      formId={formId}
      submitLabel={item ? 'Guncelle' : 'Olustur'}
      isSaving={isLoading}
    >
      <Form {...form}>
        <form id={formId} onSubmit={handleSubmit} className={SD_FORM_GRID_MD}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="space-y-0 sm:col-span-2">
                <SalesDeskFormFieldLabel icon={Tag} required>
                  Grup Adi
                </SalesDeskFormFieldLabel>
                <FormControl>
                  <Input
                    {...field}
                    className={SD_FORM_INPUT_MD}
                    placeholder="Ornek: Istanbul Saha Ekibi"
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="space-y-0 sm:col-span-2">
                <SalesDeskFormFieldLabel icon={AlignLeft}>Aciklama (opsiyonel)</SalesDeskFormFieldLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    className={`min-h-[100px] w-full resize-y rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] px-4 py-3 text-sm text-slate-900 outline-none dark:text-slate-100 ${SD_FORM_FOCUS_GLOW} transition-[color,box-shadow,border-color] duration-200`}
                    placeholder="Grubun kisa aciklamasi"
                    rows={3}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage className={SD_FORM_MESSAGE} />
              </FormItem>
            )}
          />

          {showMembers ? (
            <FormField
              control={form.control}
              name="memberUserIds"
              render={({ field }) => (
                <FormItem className="space-y-0 sm:col-span-2">
                  <FormLabel className={SD_FORM_LABEL}>Grup Uyeleri</FormLabel>
                  <FormControl>
                    <SalesDeskGroupMemberSelect
                      value={field.value ?? []}
                      onChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage className={SD_FORM_MESSAGE} />
                </FormItem>
              )}
            />
          ) : null}
        </form>
      </Form>
    </SalesDeskFormDialog>
  );
}
