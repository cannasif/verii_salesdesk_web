import { type ReactElement, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  SD_CREATE_SECTION_BODY_CLASSNAME,
  SD_CREATE_SECTION_CARD_CLASSNAME,
  SD_CREATE_SECTION_HEADER_CLASSNAME,
  SD_CREATE_SECTION_TITLE_CLASSNAME,
} from '../../lib/salesdesk-document-create-styles';

interface SalesDeskVisitFormSectionProps {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
  className?: string;
  badgeClassName?: string;
}

export function SalesDeskVisitFormSection({
  icon: Icon,
  title,
  subtitle,
  children,
  className,
  badgeClassName = 'bg-[var(--crm-brand-soft)] text-[var(--crm-brand-primary)] ring-1 ring-[color-mix(in_srgb,var(--crm-brand-primary)_22%,transparent)]',
}: SalesDeskVisitFormSectionProps): ReactElement {
  return (
    <section className={cn(SD_CREATE_SECTION_CARD_CLASSNAME, className)}>
      <div className={SD_CREATE_SECTION_HEADER_CLASSNAME}>
        <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', badgeClassName)}>
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <h2 className={SD_CREATE_SECTION_TITLE_CLASSNAME}>{title}</h2>
          <p className="mt-0.5 text-xs text-[var(--crm-app-text-muted)]">{subtitle}</p>
        </div>
      </div>
      <div className={SD_CREATE_SECTION_BODY_CLASSNAME}>{children}</div>
    </section>
  );
}
