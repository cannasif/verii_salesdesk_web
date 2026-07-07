import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  AlertTriangle,
  ArrowLeft,
  Layers,
  Loader2,
  RotateCcw,
  Search,
  ShieldCheck,
  UserRound,
  Users2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useUIStore } from '@/stores/ui-store';
import { arraysEqual, cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useUserList } from '@/features/user-management/hooks/useUserList';
import type { UserDto } from '@/features/user-management/types/user-types';
import { MANAGEMENT_LIST_CARD_CLASSNAME } from '@/lib/management-list-layout';
import { useUserPermissionGroupsQuery } from '../hooks/useUserPermissionGroupsQuery';
import { useSetUserPermissionGroupsMutation } from '../hooks/useSetUserPermissionGroupsMutation';
import { usePermissionGroupQuery } from '../hooks/usePermissionGroupQuery';
import { useSetPermissionGroupPermissionsMutation } from '../hooks/useSetPermissionGroupPermissionsMutation';
import { useCreatePermissionGroupMutation } from '../hooks/useCreatePermissionGroupMutation';
import { useCrudPermissions } from '../hooks/useCrudPermissions';
import {
  buildPersonalGroupName,
  isPersonalGroupName,
  parsePersonalGroupUserId,
} from '../utils/personal-permission-group';
import { PermissionMatrixPanel } from './PermissionMatrixPanel';

function idsToKey(ids: number[]): string {
  return [...ids].sort((a, b) => a - b).join(',');
}

function getUserDisplayName(user: UserDto): string {
  return user.fullName?.trim() || user.username || user.email || `#${user.id}`;
}

export function UserAuthorizationPage(): ReactElement {
  const { setPageTitle } = useUIStore();
  const queryClient = useQueryClient();

  const { canUpdate } = useCrudPermissions('access-control.permission-groups.view');

  const [userSearch, setUserSearch] = useState('');
  const debouncedUserSearch = useDebouncedValue(userSearch, 350);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [mobilePanel, setMobilePanel] = useState<'list' | 'detail'>('list');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const userListQuery = useUserList({
    pageNumber: 1,
    pageSize: 200,
    search: debouncedUserSearch.trim() || undefined,
    sortBy: 'Id',
    sortDirection: 'asc',
  });
  const users = useMemo(() => userListQuery.data?.data ?? [], [userListQuery.data?.data]);

  const userGroupsQuery = useUserPermissionGroupsQuery(selectedUserId);
  const setUserGroups = useSetUserPermissionGroupsMutation(selectedUserId ?? 0);
  const setPermissions = useSetPermissionGroupPermissionsMutation();
  const createGroup = useCreatePermissionGroupMutation();

  useEffect(() => {
    setPageTitle('Kullanici Yetkileri');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  const personalGroupId = useMemo<number | null>(() => {
    if (selectedUserId == null) return null;
    const ids = userGroupsQuery.data?.permissionGroupIds ?? [];
    const names = userGroupsQuery.data?.permissionGroupNames ?? [];
    for (let i = 0; i < ids.length; i += 1) {
      if (parsePersonalGroupUserId(names[i]) === selectedUserId) return ids[i];
    }
    for (let i = 0; i < ids.length; i += 1) {
      if (isPersonalGroupName(names[i])) return ids[i];
    }
    return null;
  }, [userGroupsQuery.data, selectedUserId]);

  const otherAssignedGroups = useMemo(() => {
    const ids = userGroupsQuery.data?.permissionGroupIds ?? [];
    const names = userGroupsQuery.data?.permissionGroupNames ?? [];
    return ids
      .map((id, index) => ({ id, name: names[index] ?? `#${id}` }))
      .filter((g) => !isPersonalGroupName(g.name));
  }, [userGroupsQuery.data]);

  const personalGroupQuery = usePermissionGroupQuery(personalGroupId);
  const savedIds = useMemo(
    () => personalGroupQuery.data?.permissionDefinitionIds ?? [],
    [personalGroupQuery.data]
  );
  const savedKey = useMemo(() => idsToKey(savedIds), [savedIds]);

  useEffect(() => {
    setSelectedIds(savedKey ? savedKey.split(',').map(Number) : []);
  }, [selectedUserId, personalGroupId, savedKey]);

  const selectedUserLabel = useMemo(() => {
    const user = users.find((u) => u.id === selectedUserId);
    return user ? getUserDisplayName(user) : selectedUserId != null ? `#${selectedUserId}` : '';
  }, [users, selectedUserId]);

  const isDirty = useMemo(
    () => !arraysEqual([...selectedIds].sort(), [...savedIds].sort()),
    [selectedIds, savedIds]
  );
  const dirtyCount = useMemo(() => {
    const saved = new Set(savedIds);
    const sel = new Set(selectedIds);
    let diff = 0;
    for (const id of selectedIds) if (!saved.has(id)) diff += 1;
    for (const id of savedIds) if (!sel.has(id)) diff += 1;
    return diff;
  }, [selectedIds, savedIds]);

  const isUserDataLoading =
    selectedUserId != null &&
    (userGroupsQuery.isPending || (personalGroupId != null && personalGroupQuery.isPending));

  const readOnly = !canUpdate || selectedUserId == null;

  const handleSave = async (): Promise<void> => {
    if (selectedUserId == null || readOnly) return;
    setIsSaving(true);
    try {
      let groupId = personalGroupId;
      if (groupId != null) {
        await setPermissions.mutateAsync({ id: groupId, dto: { permissionDefinitionIds: selectedIds } });
      } else {
        const created = await createGroup.mutateAsync({
          name: buildPersonalGroupName(selectedUserId),
          description: `Kisisel yetki - kullanici #${selectedUserId}`,
          isSystemAdmin: false,
          isActive: true,
          permissionDefinitionIds: selectedIds,
        });
        groupId = created.id;
      }
      // Only the personal group applies — remove legacy group assignments (e.g. System Admin).
      await setUserGroups.mutateAsync({ permissionGroupIds: [groupId] });
      await queryClient.invalidateQueries({ queryKey: ['users', selectedUserId, 'permission-groups'] });
      await queryClient.invalidateQueries({ queryKey: ['permissions', 'groups'] });
      toast.success('Kullanici yetkileri kaydedildi');
    } catch {
      toast.error('Yetkiler kaydedilemedi');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      <div className="relative overflow-hidden rounded-3xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] p-6 md:p-8 shadow-xl">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[var(--crm-brand-primary)]/10 blur-[90px]" />
        <div className="pointer-events-none absolute -left-16 -bottom-16 h-64 w-64 rounded-full bg-amber-500/10 blur-[90px]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--crm-brand-gradient)] shadow-lg shadow-black/20 sm:h-14 sm:w-14">
              <ShieldCheck className="size-6 text-white sm:size-7" strokeWidth={2.4} />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl">Kullanici Yetkileri</h1>
              <p className="mt-1.5 max-w-2xl text-sm font-medium text-slate-400">
                Soldan bir kullanici secin, sagdan hangi sayfalara girebilecegini ve o sayfalarda
                ekleme / duzenleme / silme yapabilecegini isaretleyin.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <StatChip icon={<UserRound className="size-4" />} label="Secili kullanici" value={selectedUserId != null ? 1 : 0} />
            <StatChip icon={<Layers className="size-4" />} label="Secili yetki" value={selectedIds.length} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
        {/* User selector */}
        <Card
          className={cn(
            MANAGEMENT_LIST_CARD_CLASSNAME,
            'flex flex-col overflow-hidden',
            mobilePanel === 'detail' ? 'hidden xl:flex' : 'flex'
          )}
        >
          <div className="flex items-center gap-2 border-b border-[var(--crm-app-border)] px-4 py-4">
            <Users2 className="size-4 text-[var(--crm-brand-primary)]" />
            <span className="text-sm font-black uppercase tracking-wider text-slate-300">Kullanicilar</span>
          </div>
          <div className="px-4 pt-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
              <Input
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Kullanici ara..."
                className="h-11 min-h-[44px] rounded-xl border-[var(--crm-app-border)] bg-[var(--crm-app-input)] pl-9 text-sm"
              />
            </div>
          </div>
          <div className="flex-1 space-y-1.5 overflow-y-auto p-3 custom-scrollbar max-h-[70vh]">
            {userListQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" /> Yukleniyor...
              </div>
            ) : userListQuery.isError ? (
              <div className="flex flex-col items-center gap-2 px-2 py-10 text-center text-sm text-rose-300">
                <AlertTriangle className="size-5 shrink-0" />
                <span>Kullanicilar yuklenemedi. Sayfayi yenileyip tekrar deneyin.</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => void userListQuery.refetch()}
                  className="mt-1 rounded-xl border-[var(--crm-app-border)] text-xs font-bold"
                >
                  Tekrar Dene
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-500">Kullanici bulunamadi</div>
            ) : (
              <>
                {users.map((user) => {
                  const active = user.id === selectedUserId;
                  const label = getUserDisplayName(user);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setMobilePanel('detail');
                      }}
                      className={cn(
                        'flex w-full min-h-[44px] items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
                        active
                          ? 'border-[var(--crm-brand-primary)]/60 bg-[var(--crm-brand-primary)]/10 shadow-sm'
                          : 'border-transparent bg-white/[0.02] hover:border-[var(--crm-app-border)] hover:bg-white/[0.05]'
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black',
                          active
                            ? 'bg-[var(--crm-brand-primary)]/20 text-[var(--crm-brand-primary)]'
                            : 'bg-white/[0.06] text-slate-400'
                        )}
                      >
                        {label.trim().charAt(0).toUpperCase() || '?'}
                      </span>
                      <span className={cn('truncate text-sm font-semibold', active ? 'text-white' : 'text-slate-200')}>
                        {label}
                      </span>
                    </button>
                  );
                })}
              </>
            )}
          </div>
        </Card>

        {/* Matrix */}
        <Card
          className={cn(
            MANAGEMENT_LIST_CARD_CLASSNAME,
            'flex flex-col overflow-hidden',
            mobilePanel === 'list' ? 'hidden xl:flex' : 'flex'
          )}
        >
          {selectedUserId == null ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 py-24 text-center">
              <UserRound className="size-12 text-slate-600" />
              <p className="text-sm font-semibold text-slate-400">Yetkileri duzenlemek icin soldan bir kullanici secin.</p>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--crm-app-border)] p-4 md:p-5">
                <div className="flex min-w-0 flex-1 items-start gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-11 w-11 shrink-0 rounded-xl xl:hidden"
                    onClick={() => setMobilePanel('list')}
                    aria-label="Kullanici listesine don"
                  >
                    <ArrowLeft className="size-5" />
                  </Button>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-black text-white">{selectedUserLabel}</h2>
                    <p className="mt-0.5 text-xs font-medium text-slate-400">
                      Bu kullaniciya ozel sayfa ve islem yetkileri.
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="rounded-full border-[var(--crm-brand-primary)]/40 bg-[var(--crm-brand-primary)]/10 px-3 py-1 text-xs font-bold text-[var(--crm-brand-primary)]">
                  {selectedIds.length} yetki secili
                </Badge>
              </div>

              {!canUpdate && (
                <div className="mx-4 mt-4 flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300">
                  <ShieldCheck className="size-4 shrink-0" />
                  Bu alanda degisiklik yetkin yok.
                </div>
              )}

              {otherAssignedGroups.length > 0 && (
                <div className="mx-4 mt-4 flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-200">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    Bu kullanicinin matriste gorunmeyen eski izin gruplari var:{' '}
                    <strong>{otherAssignedGroups.map((g) => g.name).join(', ')}</strong>. Bu gruplar
                    yuzunden tiksiz olsa bile tum sayfalara erisebilir. Kaydet dediginizde yalnizca bu
                    matristeki yetkiler gecerli olur, eski gruplar kaldirilir.
                  </span>
                </div>
              )}

              <PermissionMatrixPanel
                value={selectedIds}
                onChange={setSelectedIds}
                readOnly={readOnly}
                isLoading={isUserDataLoading}
                maxHeightClassName="max-h-[60vh]"
              />

              {canUpdate && (
                <div className="flex flex-col gap-3 border-t border-[var(--crm-app-border)] bg-[var(--crm-app-panel)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between md:px-5">
                  <div className="text-xs font-semibold">
                    {isDirty ? (
                      <span className="text-amber-300">{dirtyCount} degisiklik kaydedilmedi</span>
                    ) : (
                      <span className="text-emerald-400">Tum degisiklikler kayitli</span>
                    )}
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedIds(savedIds)}
                      disabled={!isDirty || isSaving}
                      className="h-11 min-h-[44px] w-full rounded-xl border-[var(--crm-app-border)] text-xs font-bold sm:w-auto"
                    >
                      <RotateCcw className="mr-1.5 size-3.5" /> Geri Al
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={!isDirty || isSaving}
                      className="h-11 min-h-[44px] w-full rounded-xl bg-[image:var(--crm-brand-gradient)] px-6 text-xs font-black text-white shadow-lg hover:brightness-110 disabled:opacity-50 sm:w-auto"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-1.5 size-4 animate-spin" /> Kaydediliyor
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="mr-1.5 size-4" /> Kaydet
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

function StatChip({ icon, label, value }: { icon: ReactElement; label: string; value: number }): ReactElement {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border border-[var(--crm-app-border)] bg-white/[0.03] px-3.5 py-2.5">
      <span className="flex size-8 items-center justify-center rounded-xl bg-[var(--crm-brand-primary)]/15 text-[var(--crm-brand-primary)]">
        {icon}
      </span>
      <div className="leading-none">
        <p className="text-lg font-black text-white">{value}</p>
        <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      </div>
    </div>
  );
}
