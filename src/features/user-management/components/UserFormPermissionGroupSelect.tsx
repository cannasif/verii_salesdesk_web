import { type ReactElement } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ExternalLink } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { usePermissionGroupOptionsQuery } from '../hooks/usePermissionGroupOptionsQuery';

interface UserFormPermissionGroupSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

export function UserFormPermissionGroupSelect({
  value,
  onChange,
  disabled = false,
}: UserFormPermissionGroupSelectProps): ReactElement {
  const { t } = useTranslation('user-management');
  const { data: items = [], isLoading } = usePermissionGroupOptionsQuery();

  const handleToggle = (id: number): void => {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
    } else {
      onChange([...value, id]);
    }
  };

  const handleSelectAll = (checked: boolean): void => {
    if (checked) {
      onChange(items.map((i) => i.value));
    } else {
      onChange([]);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 px-4 py-6 text-sm text-[var(--crm-app-text-muted)]">
        {t('table.loading')}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="user-form-select-all-groups"
            checked={items.length > 0 && value.length === items.length}
            onCheckedChange={(c) => handleSelectAll(!!c)}
            disabled={disabled || items.length === 0}
          />
          <label htmlFor="user-form-select-all-groups" className="cursor-pointer text-sm font-medium text-slate-200">
            {t('form.selectAll')}
          </label>
        </div>
        <Link
          to="/access-control/permission-groups"
          className="inline-flex items-center gap-1 text-xs font-medium text-[var(--crm-brand-accent)] transition-colors hover:text-[var(--crm-brand-on-soft)]"
        >
          Izin gruplarini yonet
          <ExternalLink size={12} />
        </Link>
      </div>

      <p className="text-[11px] leading-relaxed text-[var(--crm-app-text-muted)]">
        {t('form.permissionGroupsHelp')}
      </p>

      <div className="custom-scrollbar max-h-48 space-y-1 overflow-y-auto rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] p-2">
        {items.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-[var(--crm-app-text-muted)]">
            {t('form.permissionGroupsNoData')}
          </p>
        ) : (
          items.map((item) => {
            const selected = value.includes(item.value);
            return (
              <button
                key={item.value}
                type="button"
                disabled={disabled}
                onClick={() => handleToggle(item.value)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors',
                  selected
                    ? 'bg-[var(--crm-brand-soft)] ring-1 ring-[var(--crm-brand-primary)]/25'
                    : 'hover:bg-[var(--crm-app-panel-muted)]'
                )}
              >
                <Checkbox checked={selected} disabled={disabled} tabIndex={-1} aria-hidden />
                <span className="flex-1 text-sm font-medium text-slate-100">{item.label}</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
