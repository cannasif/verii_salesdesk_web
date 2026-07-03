import { type ReactElement } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import type { SalesDeskGroupDto } from '../../types/salesdesk-group-types';

interface SalesDeskErpNewsGroupSelectProps {
  groups: SalesDeskGroupDto[];
  value: number[];
  onChange: (value: number[]) => void;
  disabled?: boolean;
}

export function SalesDeskErpNewsGroupSelect({
  groups,
  value,
  onChange,
  disabled = false,
}: SalesDeskErpNewsGroupSelectProps): ReactElement {
  const selected = new Set(value);

  return (
    <div className="space-y-2 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 p-3">
      <p className="text-xs text-[var(--crm-app-text-muted)]">
        Hedef secilmezse haber tum sirket akisinda gorunur.
      </p>
      {groups.length === 0 ? (
        <p className="text-sm text-[var(--crm-app-text-muted)]">Grup bulunamadi. Grup Yonetimi&apos;nden ekip olusturun.</p>
      ) : (
        <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
          {groups.map((group) => {
            const checked = selected.has(group.id);
            return (
              <label
                key={group.id}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-2 py-1.5 hover:bg-[var(--crm-app-panel-muted)]"
              >
                <Checkbox
                  checked={checked}
                  disabled={disabled}
                  onCheckedChange={(next) => {
                    const nextSet = new Set(value);
                    if (next) nextSet.add(group.id);
                    else nextSet.delete(group.id);
                    onChange([...nextSet]);
                  }}
                />
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{group.name}</span>
                  <span className="block text-xs text-[var(--crm-app-text-muted)]">
                    {group.memberCount} uye
                    {group.description ? ` · ${group.description}` : ''}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
