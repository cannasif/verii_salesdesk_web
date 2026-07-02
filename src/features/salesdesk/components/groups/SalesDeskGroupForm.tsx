import { type ReactElement, useEffect, useRef } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UsersRound, X, Loader2 } from 'lucide-react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import {
  salesDeskGroupFormSchema,
  type SalesDeskGroupDto,
  type SalesDeskGroupFormSchema,
} from '../../types/salesdesk-group-types';
import { SalesDeskGroupMemberSelect } from './SalesDeskGroupMemberSelect';
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
  SD_FORM_LABEL,
  SD_FORM_MESSAGE,
} from '../../lib/salesdesk-popup-styles';

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={SD_DIALOG_CONTENT_FORM} showCloseButton={false}>
        <DialogPrimitive.Close className={SD_DIALOG_CLOSE}>
          <X size={20} strokeWidth={2.5} />
        </DialogPrimitive.Close>

        <DialogHeader className={SD_DIALOG_HEADER_FORM}>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className={SD_DIALOG_ICON_RING_FORM}>
              <UsersRound className={`h-5 w-5 ${SD_DIALOG_ICON}`} aria-hidden />
            </div>
            <div className="min-w-0 space-y-0.5">
              <DialogTitle className={SD_DIALOG_TITLE}>
                {item ? 'Grubu Duzenle' : 'Yeni Grup Olustur'}
              </DialogTitle>
              <DialogDescription className={SD_DIALOG_DESC}>
                {item
                  ? 'Grup bilgilerini ve uyelerini guncelleyin.'
                  : 'Ekip icin yeni bir grup olusturup kullanicilari ekleyin.'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit}>
            <div className={SD_DIALOG_BODY_FORM}>
              <div className={SD_FORM_GRID_MD}>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel className={SD_FORM_LABEL}>Grup Adi</FormLabel>
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
                    <FormItem className="sm:col-span-2">
                      <FormLabel className={SD_FORM_LABEL}>Aciklama (opsiyonel)</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          className={`${SD_FORM_INPUT_MD} min-h-[88px] resize-y`}
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
                      <FormItem className="sm:col-span-2">
                        <FormLabel className={SD_FORM_LABEL}>Grup Uyeleri</FormLabel>
                        <FormControl>
                          <div>
                            <SalesDeskGroupMemberSelect
                              value={field.value ?? []}
                              onChange={field.onChange}
                              disabled={isLoading}
                            />
                          </div>
                        </FormControl>
                        <FormMessage className={SD_FORM_MESSAGE} />
                      </FormItem>
                    )}
                  />
                ) : null}
              </div>
            </div>

            <DialogFooter className={SD_DIALOG_FOOTER_FORM}>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Iptal
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : item ? (
                  'Guncelle'
                ) : (
                  'Olustur'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
