import { type ReactElement, useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Loader2, Search } from 'lucide-react';
import { useSalesDeskUserOptions } from '../../hooks/useSalesDeskModules';

interface SalesDeskGroupMemberSelectProps {
  value: number[];
  onChange: (ids: number[]) => void;
  disabled?: boolean;
}

const EMPTY_USERS: { id: number; name: string }[] = [];

export function SalesDeskGroupMemberSelect({
  value,
  onChange,
  disabled = false,
}: SalesDeskGroupMemberSelectProps): ReactElement {
  const { data: users = EMPTY_USERS, isLoading } = useSalesDeskUserOptions();
  const [search, setSearch] = useState('');
  const selectedIds = value ?? [];

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('tr-TR');
    if (!term) return users;
    return users.filter((user) => user.name.toLocaleLowerCase('tr-TR').includes(term));
  }, [search, users]);

  const handleToggle = (id: number, nextChecked: boolean): void => {
    if (nextChecked) {
      if (selectedIds.includes(id)) return;
      onChange([...selectedIds, id]);
      return;
    }
    if (!selectedIds.includes(id)) return;
    onChange(selectedIds.filter((item) => item !== id));
  };

  const handleSelectAll = (checked: boolean): void => {
    const filteredIds = filteredUsers.map((user) => user.id);
    if (checked) {
      onChange([...new Set([...selectedIds, ...filteredIds])]);
      return;
    }
    const removeIds = new Set(filteredIds);
    onChange(selectedIds.filter((id) => !removeIds.has(id)));
  };

  const allFilteredSelected =
    filteredUsers.length > 0 && filteredUsers.every((user) => selectedIds.includes(user.id));

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 px-4 py-6 text-sm text-[var(--crm-app-text-muted)]">
        <Loader2 className="h-4 w-4 animate-spin" />
        Kullanicilar yukleniyor...
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel-muted)]/40 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Checkbox
            id="salesdesk-group-select-all"
            checked={allFilteredSelected}
            onCheckedChange={(checked) => handleSelectAll(checked === true)}
            disabled={disabled || filteredUsers.length === 0}
          />
          <label htmlFor="salesdesk-group-select-all" className="cursor-pointer text-sm font-medium text-slate-200">
            Filtrelenenleri sec ({selectedIds.length} secili)
          </label>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--crm-app-text-muted)]" />
        <Input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Kullanici ara..."
          className="h-9 rounded-lg border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-9 text-sm text-slate-100"
          disabled={disabled}
        />
      </div>

      <div className="custom-scrollbar max-h-56 space-y-1 overflow-y-auto rounded-lg border border-[var(--crm-app-border)] bg-[var(--crm-app-input)] p-2">
        {filteredUsers.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-[var(--crm-app-text-muted)]">
            {users.length === 0 ? 'Kullanici bulunamadi.' : 'Aramaya uygun kullanici yok.'}
          </p>
        ) : (
          filteredUsers.map((user) => {
            const selected = selectedIds.includes(user.id);
            return (
              <label
                key={user.id}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 rounded-lg px-2.5 py-2 transition-colors',
                  selected
                    ? 'bg-[var(--crm-brand-soft)] ring-1 ring-[var(--crm-brand-primary)]/25'
                    : 'hover:bg-[var(--crm-app-panel-muted)]',
                  disabled && 'cursor-not-allowed opacity-60'
                )}
              >
                <Checkbox
                  checked={selected}
                  disabled={disabled}
                  onCheckedChange={(checked) => handleToggle(user.id, checked === true)}
                />
                <span className="flex-1 text-sm font-medium text-slate-100">{user.name}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}
