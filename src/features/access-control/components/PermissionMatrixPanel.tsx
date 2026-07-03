import { type ReactElement, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { AlertTriangle, ChevronDown, Eye, Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import { normalizeSearchValue } from '@/lib/search';
import { useAllPermissionDefinitionsQuery } from '../hooks/useAllPermissionDefinitionsQuery';
import { useMyPermissionsQuery } from '../hooks/useMyPermissionsQuery';
import { canSyncPermissionDefinitions, syncSalesDeskMatrixDefinitions } from '../utils/permission-definition-sync';
import {
  getPermissionDisplayLabel,
  getPermissionModuleDisplayMeta,
  getPermissionSubjectDisplayLabel,
  isLeafPermissionCode,
  isSalesDeskAppPermissionCode,
  PERMISSION_OTHER_OPERATION_CODES,
  translatePermissionLabel,
} from '../utils/permission-config';

export type MatrixActionKey = 'view' | 'create' | 'update' | 'delete';

interface ActionColumn {
  key: MatrixActionKey;
  label: string;
  icon: typeof Eye;
  aliases: readonly string[];
  accent: string;
}

const ACTION_COLUMNS: readonly ActionColumn[] = [
  { key: 'view', label: 'Goruntule', icon: Eye, aliases: ['view', 'read', 'list', 'overview'], accent: 'text-sky-300' },
  { key: 'create', label: 'Ekle', icon: Plus, aliases: ['create', 'add', 'new', 'insert'], accent: 'text-emerald-300' },
  { key: 'update', label: 'Duzenle', icon: Pencil, aliases: ['update', 'edit', 'write'], accent: 'text-amber-300' },
  { key: 'delete', label: 'Sil', icon: Trash2, aliases: ['delete', 'remove'], accent: 'text-rose-300' },
] as const;

interface OtherOp {
  id: number;
  code: string;
  label: string;
}

interface MatrixRow {
  key: string;
  label: string;
  cells: Partial<Record<MatrixActionKey, { id: number; code: string }>>;
  others: OtherOp[];
  allIds: number[];
}

interface MatrixModule {
  key: string;
  label: string;
  rows: MatrixRow[];
  allIds: number[];
}

interface PermissionMatrixPanelProps {
  value: number[];
  onChange: (ids: number[]) => void;
  readOnly?: boolean;
  isLoading?: boolean;
  maxHeightClassName?: string;
}

export function PermissionMatrixPanel({
  value,
  onChange,
  readOnly = false,
  isLoading = false,
  maxHeightClassName = 'max-h-[62vh]',
}: PermissionMatrixPanelProps): ReactElement {
  const { t } = useTranslation(['access-control', 'common']);
  const queryClient = useQueryClient();
  const { data: myPermissions } = useMyPermissionsQuery();

  const [pageSearch, setPageSearch] = useState('');
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  const canSync = canSyncPermissionDefinitions(myPermissions);

  // Fetch every page: the API clamps server-side page size, and definitions are
  // sorted by code so salesdesk.* entries would otherwise be paginated out.
  const definitionsQuery = useAllPermissionDefinitionsQuery();

  const runSync = useCallback(
    async (notify: boolean): Promise<void> => {
      if (!canSync) {
        if (notify) toast.error('Sayfa listesini guncellemek icin yetkiniz yok.');
        return;
      }
      setIsSyncing(true);
      setSyncError(null);
      try {
        await syncSalesDeskMatrixDefinitions(myPermissions);
        await queryClient.invalidateQueries({ queryKey: ['permissions', 'definitions'] });
        if (notify) toast.success('Sayfa listesi guncellendi');
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Sayfalar senkronize edilemedi. Lutfen tekrar deneyin.';
        setSyncError(message);
        if (notify) toast.error(message);
      } finally {
        setIsSyncing(false);
      }
    },
    [canSync, myPermissions, queryClient]
  );

  const definitions = useMemo(() => definitionsQuery.data ?? [], [definitionsQuery.data]);
  const salesdeskDefinitionCount = useMemo(
    () =>
      definitions.filter(
        (d) => d.isActive && isLeafPermissionCode(d.code) && isSalesDeskAppPermissionCode(d.code)
      ).length,
    [definitions]
  );
  const hasAttemptedEmptySync = useRef(false);

  // Sync once when SalesDesk page definitions are missing (first-time setup).
  useEffect(() => {
    if (!canSync || isSyncing || definitionsQuery.isPending || definitionsQuery.isFetching) return;
    if (salesdeskDefinitionCount > 0) return;
    if (hasAttemptedEmptySync.current) return;
    hasAttemptedEmptySync.current = true;
    void runSync(false);
  }, [
    canSync,
    salesdeskDefinitionCount,
    definitionsQuery.isFetching,
    definitionsQuery.isPending,
    isSyncing,
    runSync,
  ]);

  const modules = useMemo<MatrixModule[]>(() => {
    const translate = (key: string, fallback: string): string => translatePermissionLabel(t, key, fallback);
    const items = definitions.filter(
      (d) => d.isActive && isLeafPermissionCode(d.code) && isSalesDeskAppPermissionCode(d.code)
    );
    const moduleMap = new Map<string, { key: string; label: string; rows: Map<string, MatrixRow> }>();

    const getActionKey = (code: string): MatrixActionKey | 'other' => {
      if (PERMISSION_OTHER_OPERATION_CODES.has(code)) return 'other';
      const parts = code.split('.').filter(Boolean);
      const action = (parts[parts.length - 1] ?? '').toLowerCase();
      const matched = ACTION_COLUMNS.find((col) => (col.aliases as readonly string[]).includes(action));
      return matched ? matched.key : 'other';
    };

    for (const def of items) {
      const prefix = def.code.split('.').filter(Boolean)[0] ?? 'other';
      const meta = getPermissionModuleDisplayMeta(prefix);
      const moduleLabel = meta ? translate(meta.key, meta.fallback) : prefix;
      const moduleEntry = moduleMap.get(prefix) ?? { key: prefix, label: moduleLabel, rows: new Map() };

      const subjectLabel = getPermissionSubjectDisplayLabel(def.code, translate);
      const rowKey = `${prefix}:${subjectLabel.toLowerCase()}`;
      const row = moduleEntry.rows.get(rowKey) ?? { key: rowKey, label: subjectLabel, cells: {}, others: [], allIds: [] };

      const actionKey = getActionKey(def.code);
      if (actionKey === 'other') {
        row.others.push({ id: def.id, code: def.code, label: getPermissionDisplayLabel(def.code, translate) });
      } else if (!row.cells[actionKey]) {
        row.cells[actionKey] = { id: def.id, code: def.code };
      }
      if (!row.allIds.includes(def.id)) row.allIds.push(def.id);

      moduleEntry.rows.set(rowKey, row);
      moduleMap.set(prefix, moduleEntry);
    }

    const priority = ['dashboard', 'salesdesk'];
    return Array.from(moduleMap.values())
      .map((m) => ({
        key: m.key,
        label: m.label,
        rows: Array.from(m.rows.values()).sort((a, b) => a.label.localeCompare(b.label, 'tr')),
        allIds: Array.from(m.rows.values()).flatMap((r) => r.allIds),
      }))
      .sort((a, b) => {
        const pa = priority.indexOf(a.key);
        const pb = priority.indexOf(b.key);
        if (pa !== -1 || pb !== -1) return (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb);
        return a.label.localeCompare(b.label, 'tr');
      });
  }, [definitions, t]);

  const filteredModules = useMemo<MatrixModule[]>(() => {
    const q = normalizeSearchValue(pageSearch);
    if (!q) return modules;
    return modules
      .map((m) => {
        const moduleMatches = normalizeSearchValue(m.label).includes(q);
        const rows = moduleMatches ? m.rows : m.rows.filter((r) => normalizeSearchValue(r.label).includes(q));
        return { ...m, rows };
      })
      .filter((m) => m.rows.length > 0);
  }, [modules, pageSearch]);

  const selectedSet = useMemo(() => new Set(value), [value]);

  const setMany = useCallback(
    (ids: number[], checked: boolean): void => {
      if (ids.length === 0) return;
      const next = new Set(value);
      if (checked) ids.forEach((id) => next.add(id));
      else ids.forEach((id) => next.delete(id));
      onChange(Array.from(next));
    },
    [onChange, value]
  );

  const toggleId = useCallback(
    (id: number): void => {
      onChange(value.includes(id) ? value.filter((x) => x !== id) : [...value, id]);
    },
    [onChange, value]
  );

  const toggleModuleCollapse = useCallback((key: string): void => {
    setCollapsedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const showLoader = isLoading || definitionsQuery.isPending;

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--crm-app-border)] p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            value={pageSearch}
            onChange={(e) => setPageSearch(e.target.value)}
            placeholder="Sayfa ara..."
            className="h-10 rounded-xl border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-9 text-sm"
          />
        </div>
        {!readOnly && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMany(modules.flatMap((m) => m.allIds), true)}
              className="h-10 rounded-xl border-[var(--crm-app-border)] text-xs font-bold"
            >
              Tumunu Sec
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onChange([])}
              className="h-10 rounded-xl border-[var(--crm-app-border)] text-xs font-bold"
            >
              Temizle
            </Button>
          </>
        )}
        {canSync && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => void runSync(true)}
            disabled={isSyncing}
            className="h-10 rounded-xl border-[var(--crm-app-border)] text-xs font-bold"
            title="Sayfa listesini yeniden senkronize et"
          >
            <RefreshCw className={cn('mr-1.5 size-3.5', isSyncing && 'animate-spin')} />
            Senkronize Et
          </Button>
        )}
      </div>

      {syncError && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>{syncError}</span>
        </div>
      )}
      {!canSync && (
        <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" />
          <span>
            Sayfa listesini guncellemek icin sistem yoneticisi yetkisi gerekir. Eksik sayfalar goruyorsaniz bir yonetici
            ile senkronizasyon yapmalisiniz.
          </span>
        </div>
      )}

      <div className={cn('space-y-3 overflow-y-auto p-4 custom-scrollbar', maxHeightClassName)}>
        {showLoader ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <Loader2 className="size-4 animate-spin" /> Yetkiler yukleniyor...
          </div>
        ) : definitionsQuery.isError ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-sm text-rose-300">
            <AlertTriangle className="size-6" />
            <span>
              {definitionsQuery.error instanceof Error
                ? definitionsQuery.error.message
                : 'Sayfa listesi yuklenemedi.'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void definitionsQuery.refetch()}
              className="rounded-xl border-[var(--crm-app-border)] text-xs font-bold"
            >
              <RefreshCw className="mr-1.5 size-3.5" /> Tekrar Dene
            </Button>
          </div>
        ) : filteredModules.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-sm text-slate-500">
            {isSyncing ? (
              <>
                <Loader2 className="size-5 animate-spin" />
                <span>Sayfalar hazirlaniyor...</span>
              </>
            ) : (
              <>
                <span>Henuz sayfa listesi olusturulmamis.</span>
                {canSync && (
                  <Button
                    size="sm"
                    onClick={() => void runSync(true)}
                    className="rounded-xl bg-[image:var(--crm-brand-gradient)] px-5 text-xs font-black text-white shadow-lg hover:brightness-110"
                  >
                    <RefreshCw className="mr-1.5 size-3.5" /> Sayfalari Yukle
                  </Button>
                )}
              </>
            )}
          </div>
        ) : (
          filteredModules.map((module) => {
            const collapsed = collapsedModules.has(module.key);
            const moduleSelected = module.allIds.length > 0 && module.allIds.every((id) => selectedSet.has(id));
            const moduleSome = !moduleSelected && module.allIds.some((id) => selectedSet.has(id));
            return (
              <div key={module.key} className="overflow-hidden rounded-2xl border border-[var(--crm-app-border)] bg-white/[0.02]">
                <div className="flex items-center justify-between gap-3 bg-white/[0.03] px-4 py-3">
                  <button
                    type="button"
                    onClick={() => toggleModuleCollapse(module.key)}
                    className="flex min-w-0 items-center gap-2.5 text-left"
                  >
                    <ChevronDown className={cn('size-4 shrink-0 text-slate-400 transition-transform', collapsed && '-rotate-90')} />
                    <span className="truncate text-sm font-black text-white">{module.label}</span>
                    <Badge variant="outline" className="shrink-0 rounded-full border-[var(--crm-app-border)] px-2 text-[10px] font-bold text-slate-400">
                      {module.rows.length}
                    </Badge>
                  </button>
                  <label
                    className={cn(
                      'flex shrink-0 items-center gap-2 text-[11px] font-bold text-slate-400',
                      readOnly ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
                    )}
                  >
                    <Checkbox
                      checked={moduleSelected ? true : moduleSome ? 'indeterminate' : false}
                      onCheckedChange={(c) => setMany(module.allIds, !!c)}
                      disabled={readOnly}
                    />
                    Tum modul
                  </label>
                </div>

                {!collapsed && (
                  <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-[640px]">
                      <div className="grid grid-cols-[minmax(180px,2.4fr)_repeat(4,minmax(84px,1fr))] items-center border-y border-[var(--crm-app-border)] bg-black/10 px-4 py-2.5">
                        <div className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Sayfa</div>
                        {ACTION_COLUMNS.map((col) => {
                          const colIds = module.rows
                            .map((r) => r.cells[col.key]?.id)
                            .filter((v): v is number => typeof v === 'number');
                          const allOn = colIds.length > 0 && colIds.every((id) => selectedSet.has(id));
                          const Icon = col.icon;
                          return (
                            <button
                              key={col.key}
                              type="button"
                              disabled={readOnly || colIds.length === 0}
                              onClick={() => setMany(colIds, !allOn)}
                              className={cn(
                                'flex flex-col items-center gap-1 rounded-lg py-1 transition-colors',
                                readOnly || colIds.length === 0 ? 'cursor-default' : 'cursor-pointer hover:bg-white/5',
                                allOn ? col.accent : 'text-slate-500'
                              )}
                              title={`Tum ${col.label.toLowerCase()} yetkilerini ac/kapat`}
                            >
                              <Icon className="size-3.5" />
                              <span className="text-[10px] font-black uppercase tracking-wide">{col.label}</span>
                            </button>
                          );
                        })}
                      </div>

                      <div className="divide-y divide-[var(--crm-app-border)]">
                        {module.rows.map((row) => (
                          <div
                            key={row.key}
                            className="grid grid-cols-[minmax(180px,2.4fr)_repeat(4,minmax(84px,1fr))] items-center px-4 py-2.5 transition-colors hover:bg-white/[0.03]"
                          >
                            <div className="min-w-0 pr-3">
                              <p className="truncate text-sm font-semibold text-slate-200">{row.label}</p>
                              {row.others.length > 0 && (
                                <div className="mt-1.5 flex flex-wrap gap-1.5">
                                  {row.others.map((op) => {
                                    const on = selectedSet.has(op.id);
                                    return (
                                      <button
                                        key={op.id}
                                        type="button"
                                        disabled={readOnly}
                                        onClick={() => toggleId(op.id)}
                                        className={cn(
                                          'rounded-full border px-2 py-0.5 text-[10px] font-bold transition-colors',
                                          on
                                            ? 'border-[var(--crm-brand-primary)]/50 bg-[var(--crm-brand-primary)]/15 text-[var(--crm-brand-primary)]'
                                            : 'border-[var(--crm-app-border)] text-slate-500 hover:text-slate-300',
                                          readOnly && 'cursor-not-allowed opacity-60'
                                        )}
                                      >
                                        {op.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            {ACTION_COLUMNS.map((col) => {
                              const cell = row.cells[col.key];
                              return (
                                <div key={col.key} className="flex items-center justify-center">
                                  {cell ? (
                                    <Checkbox
                                      checked={selectedSet.has(cell.id)}
                                      onCheckedChange={() => toggleId(cell.id)}
                                      disabled={readOnly}
                                      className={cn(
                                        'size-5 rounded-md border-[var(--crm-app-border)]',
                                        'data-[state=checked]:border-[var(--crm-brand-primary)] data-[state=checked]:bg-[var(--crm-brand-primary)]'
                                      )}
                                    />
                                  ) : (
                                    <span className="text-xs text-slate-600">-</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
