import { type ReactElement, type ReactNode } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SD_DIALOG_BODY_FORM,
  SD_DIALOG_CLOSE,
  SD_DIALOG_CONTENT_FORM,
  SD_DIALOG_DESC,
  SD_DIALOG_FOOTER_FORM,
  SD_DIALOG_HEADER_FORM,
  SD_DIALOG_HEADER_ROW,
  SD_DIALOG_ICON_GRADIENT,
  SD_DIALOG_TITLE,
  SD_PRIMARY_BUTTON_FORM,
  SD_SECONDARY_BUTTON_FORM,
} from '../lib/salesdesk-popup-styles';

interface SalesDeskFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  icon: LucideIcon;
  children: ReactNode;
  formId?: string;
  onSubmit?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  footerLeading?: ReactNode;
  maxWidthClass?: string;
  submitDisabled?: boolean;
}

export function SalesDeskFormDialog({
  open,
  onOpenChange,
  title,
  description,
  icon: Icon,
  children,
  formId,
  onSubmit,
  submitLabel = 'Kaydet',
  cancelLabel = 'Iptal',
  isSaving = false,
  footerLeading,
  maxWidthClass,
  submitDisabled = false,
}: SalesDeskFormDialogProps): ReactElement {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open ? (
        <DialogContent
          className={maxWidthClass ? `${SD_DIALOG_CONTENT_FORM} ${maxWidthClass}` : SD_DIALOG_CONTENT_FORM}
          showCloseButton={false}
        >
          <DialogHeader className={SD_DIALOG_HEADER_FORM}>
            <div className={SD_DIALOG_HEADER_ROW}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <div className={SD_DIALOG_ICON_GRADIENT}>
                  <Icon size={24} className="text-white" strokeWidth={2.2} aria-hidden />
                </div>
                <div className="min-w-0 space-y-1">
                  <DialogTitle className={SD_DIALOG_TITLE}>{title}</DialogTitle>
                  <DialogDescription className={SD_DIALOG_DESC}>{description}</DialogDescription>
                </div>
              </div>
              <button
                type="button"
                className={SD_DIALOG_CLOSE}
                onClick={() => onOpenChange(false)}
                aria-label="Kapat"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>
          </DialogHeader>

          <div className={SD_DIALOG_BODY_FORM}>{children}</div>

          <DialogFooter className={cn(SD_DIALOG_FOOTER_FORM, footerLeading && 'sm:justify-between')}>
            {footerLeading ? <div className="flex w-full items-center sm:w-auto">{footerLeading}</div> : null}
            <div
              className={cn(
                'flex w-full flex-col-reverse gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-3',
                footerLeading && 'sm:ml-auto'
              )}
            >
              <Button
                type="button"
                variant="ghost"
                className={SD_SECONDARY_BUTTON_FORM}
                onClick={() => onOpenChange(false)}
                disabled={isSaving}
              >
                {cancelLabel}
              </Button>
              <Button
                type={formId ? 'submit' : 'button'}
                variant="ghost"
                form={formId}
                className={SD_PRIMARY_BUTTON_FORM}
                disabled={isSaving || submitDisabled}
                onClick={formId ? undefined : onSubmit}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Kaydediliyor...
                  </>
                ) : (
                  submitLabel
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      ) : null}
    </Dialog>
  );
}
