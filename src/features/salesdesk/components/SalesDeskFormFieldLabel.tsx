import { type ReactElement, type ReactNode } from 'react';
import { Label } from '@/components/ui/label';
import type { LucideIcon } from 'lucide-react';
import { SD_FORM_LABEL_ICON, SD_FORM_LABEL_ICON_SVG } from '../lib/salesdesk-popup-styles';

interface SalesDeskFormFieldLabelProps {
  icon: LucideIcon;
  children: ReactNode;
  required?: boolean;
  htmlFor?: string;
}

export function SalesDeskFormFieldLabel({
  icon: Icon,
  children,
  required,
  htmlFor,
}: SalesDeskFormFieldLabelProps): ReactElement {
  return (
    <Label className={SD_FORM_LABEL_ICON} htmlFor={htmlFor}>
      <Icon size={16} className={SD_FORM_LABEL_ICON_SVG} strokeWidth={2.2} aria-hidden />
      <span>
        {children}
        {required ? <span className="ml-0.5 text-red-400">*</span> : null}
      </span>
    </Label>
  );
}
