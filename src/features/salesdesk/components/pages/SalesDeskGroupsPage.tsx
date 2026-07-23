import { type ReactElement, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUIStore } from '@/stores/ui-store';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SalesDeskDeleteDialog } from '../SalesDeskDeleteDialog';
import { SalesDeskMobileCardList } from '../SalesDeskMobileCardList';
import {
  DataTableActionBar,
  DataTableGrid,
  ManagementDataTableChrome,
  ManagementTableRowActions,
  type DataTableGridColumn,
} from '@/components/shared';
import { cn } from '@/lib/utils';
import {
  MANAGEMENT_LIST_CARD_CLASSNAME,
  MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME,
  MANAGEMENT_LIST_CARD_HEADER_CLASSNAME,
  MANAGEMENT_LIST_CARD_TITLE_CLASSNAME,
  MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME,
  MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME,
} from '@/lib/management-list-layout';
import { MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH } from '@/lib/management-table-actions';
import { useCrudPermissions } from '@/features/access-control/hooks/useCrudPermissions';
import { useSalesDeskUserOptions } from '../../hooks/useSalesDeskModules';
import {
  useCreateSalesDeskGroup,
  useDeleteSalesDeskGroup,
  useSalesDeskGroupList,
  useSetSalesDeskGroupMembers,
  useUpdateSalesDeskGroup,
} from '../../hooks/useSalesDeskGroups';
import { SalesDeskGroupForm } from '../groups/SalesDeskGroupForm';
import { SalesDeskGroupMemberSelect } from '../groups/SalesDeskGroupMemberSelect';
import { SalesDeskRecordDetailDialog } from '../SalesDeskRecordDetailDialog';
import type { SalesDeskColumn } from '../SalesDeskListLayout';
import type { SalesDeskGroupDto, SalesDeskGroupFormSchema } from '../../types/salesdesk-group-types';
import {
  SD_DIALOG_CONTENT_FORM,
  SD_PAGE_ADD_BUTTON,
  SD_PAGE_HEADER_ROW,
  SD_PAGE_PULSE,
  SD_PAGE_TITLE,
  SD_TABLE_ACTION_BUTTON,
} from '../../lib/salesdesk-popup-styles';
import { Loader2, Plus, RefreshCw, UserPlus, UsersRound } from 'lucide-react';

const PAGE_KEY = 'salesdesk-groups';
const PAGE_SIZE_OPTIONS = [10, 20, 50] as const;

type GroupColumnKey = 'name' | 'description' | 'memberCount' | 'updatedAt';

function formatDate(value: string | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('tr-TR');
}

export function SalesDeskGroupsPage(): ReactElement {
  const { t } = useTranslation(['common']);
  const { user } = useAuthStore();
  const { setPageTitle } = useUIStore();

  const { canCreate, canUpdate, canDelete } = useCrudPermissions('users.user-management.view');
  const { data: groups = [], isPending, isFetching, isError, error, refetch } = useSalesDeskGroupList();
  const { data: userOptions = [] } = useSalesDeskUserOptions();

  const createGroup = useCreateSalesDeskGroup();
  const updateGroup = useUpdateSalesDeskGroup();
  const setMembers = useSetSalesDeskGroupMembers();
  const deleteGroup = useDeleteSalesDeskGroup();

  const [formOpen, setFormOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<SalesDeskGroupDto | null>(null);
  const [membersOpen, setMembersOpen] = useState(false);
  const [membersGroup, setMembersGroup] = useState<SalesDeskGroupDto | null>(null);
  const [memberDraftIds, setMemberDraftIds] = useState<number[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<SalesDeskGroupDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailGroup, setDetailGroup] = useState<SalesDeskGroupDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const isLoading = isPending && !isError;
  const queryErrorMessage = error instanceof Error ? error.message : 'Gruplar yuklenemedi.';

  useEffect(() => {
    setPageTitle('Grup Yonetimi');
    return () => setPageTitle(null);
  }, [setPageTitle]);

  useEffect(() => {
    setPageNumber(1);
  }, [searchTerm, pageSize]);

  const filteredGroups = useMemo(() => {
    const term = searchTerm.trim().toLocaleLowerCase('tr-TR');
    if (!term) return groups;
    return groups.filter((group) => {
      const haystack = `${group.name} ${group.description}`.toLocaleLowerCase('tr-TR');
      return haystack.includes(term);
    });
  }, [groups, searchTerm]);

  const totalCount = filteredGroups.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const pagedGroups = useMemo(() => {
    const start = (pageNumber - 1) * pageSize;
    return filteredGroups.slice(start, start + pageSize);
  }, [filteredGroups, pageNumber, pageSize]);

  const totalMembers = useMemo(
    () => groups.reduce((sum, group) => sum + group.memberCount, 0),
    [groups]
  );
  const avgMembers = groups.length > 0 ? Math.round((totalMembers / groups.length) * 10) / 10 : 0;

  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    for (const option of userOptions) map.set(option.id, option.name);
    return map;
  }, [userOptions]);

  const handleAddClick = (): void => {
    setEditingGroup(null);
    setFormOpen(true);
  };

  const handleEditClick = (group: SalesDeskGroupDto): void => {
    setEditingGroup(group);
    setFormOpen(true);
  };

  const handleMembersClick = (group: SalesDeskGroupDto): void => {
    setMembersGroup(group);
    setMemberDraftIds(group.memberUserIds);
    setMembersOpen(true);
  };

  const handleDeleteClick = (group: SalesDeskGroupDto): void => {
    setGroupToDelete(group);
    setDeleteOpen(true);
  };

  const handleDetailClick = (group: SalesDeskGroupDto): void => {
    setDetailGroup(group);
    setDetailOpen(true);
  };

  const groupDetailColumns: SalesDeskColumn<SalesDeskGroupDto>[] = [
    { key: 'name', header: 'Grup Adi', render: (row) => row.name },
    {
      key: 'description',
      header: 'Aciklama',
      render: (row) => row.description?.trim() || '-',
    },
    {
      key: 'memberCount',
      header: 'Uye Sayisi',
      render: (row) => String(row.memberCount),
    },
    {
      key: 'updatedAt',
      header: 'Guncellendi',
      render: (row) => formatDate(row.updatedAt),
    },
  ];

  const renderGroupActions = (row: SalesDeskGroupDto): ReactElement => (
    <ManagementTableRowActions
      onDetail={() => handleDetailClick(row)}
      onEdit={canUpdate ? () => handleEditClick(row) : undefined}
      onDelete={canDelete ? () => handleDeleteClick(row) : undefined}
      showEdit={canUpdate}
      showDelete={canDelete}
      beforeActions={
        canUpdate ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn(SD_TABLE_ACTION_BUTTON, 'h-8 w-8 min-h-8 min-w-8 text-cyan-400 hover:bg-cyan-500/10')}
            onClick={() => handleMembersClick(row)}
            title="Uyeler"
          >
            <UserPlus size={16} />
          </Button>
        ) : undefined
      }
    />
  );

  const handleFormSubmit = async (values: SalesDeskGroupFormSchema): Promise<void> => {
    if (editingGroup) {
      await updateGroup.mutateAsync({
        id: editingGroup.id,
        dto: { name: values.name, description: values.description ?? '' },
      });
      if (canUpdate) {
        await setMembers.mutateAsync({ id: editingGroup.id, memberUserIds: values.memberUserIds });
      }
    } else {
      await createGroup.mutateAsync(values);
    }
    setFormOpen(false);
    setEditingGroup(null);
  };

  const handleMembersSave = async (): Promise<void> => {
    if (!membersGroup) return;
    await setMembers.mutateAsync({ id: membersGroup.id, memberUserIds: memberDraftIds });
    setMembersOpen(false);
    setMembersGroup(null);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!groupToDelete) return;
    await deleteGroup.mutateAsync(groupToDelete.id);
    setDeleteOpen(false);
    setGroupToDelete(null);
  };

  const columns: DataTableGridColumn<GroupColumnKey>[] = [
    { key: 'name', label: 'Grup Adi', cellClassName: 'font-semibold' },
    { key: 'description', label: 'Aciklama' },
    { key: 'memberCount', label: 'Uye Sayisi', cellClassName: 'text-center' },
    { key: 'updatedAt', label: 'Guncellendi', cellClassName: 'text-center text-slate-500 text-sm' },
  ];

  const formBusy = createGroup.isPending || updateGroup.isPending || setMembers.isPending;

  return (
    <div className="w-full space-y-6">
      <div className={SD_PAGE_HEADER_ROW}>
        <div className="min-w-0 space-y-1">
          <h1 className={SD_PAGE_TITLE}>Grup Yonetimi</h1>
          <p className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-muted-foreground">
            <span className={`h-2 w-2 animate-pulse rounded-full ${SD_PAGE_PULSE}`} />
            Ekiplerinizi gruplara ayirin, kullanicilari ekleyin ve yonetin.
          </p>
        </div>
        {canCreate ? (
          <Button onClick={handleAddClick} variant="ghost" className={SD_PAGE_ADD_BUTTON}>
            <Plus size={20} className="mr-2 stroke-[3px]" />
            Yeni Grup
          </Button>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]/70 p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-violet-500/10 p-3 text-violet-400">
              <UsersRound className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Toplam Grup</p>
              <p className="text-2xl font-black text-slate-100">{groups.length}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]/70 p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
              <UserPlus className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Toplam Atama</p>
              <p className="text-2xl font-black text-slate-100">{totalMembers}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-[var(--crm-app-border)] bg-[var(--crm-app-panel)]/70 p-5">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
              <UsersRound className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Ort. Uye / Grup</p>
              <p className="text-2xl font-black text-slate-100">{avgMembers}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className={MANAGEMENT_LIST_CARD_CLASSNAME}>
        <CardHeader className={MANAGEMENT_LIST_CARD_HEADER_CLASSNAME}>
          <CardTitle className={MANAGEMENT_LIST_CARD_TITLE_CLASSNAME}>Gruplar</CardTitle>
          <DataTableActionBar
            pageKey={PAGE_KEY}
            userId={user?.id}
            columns={columns.map((column) => ({ key: column.key, label: column.label }))}
            visibleColumns={columns.map((column) => column.key)}
            columnOrder={columns.map((column) => column.key)}
            onVisibleColumnsChange={() => undefined}
            onColumnOrderChange={() => undefined}
            exportFileName="salesdesk-groups"
            exportColumns={columns.map((column) => ({ key: column.key, label: column.label }))}
            exportRows={filteredGroups.map((group) => ({
              name: group.name,
              description: group.description,
              memberCount: group.memberCount,
              updatedAt: formatDate(group.updatedAt),
            }))}
            filterColumns={[]}
            defaultFilterColumn="name"
            draftFilterRows={[]}
            onDraftFilterRowsChange={() => undefined}
            onApplyFilters={() => undefined}
            onClearFilters={() => undefined}
            appliedFilterCount={0}
            searchValue={searchTerm}
            searchPlaceholder={t('common.search', { defaultValue: 'Ara...' })}
            onSearchChange={setSearchTerm}
            compactSearchOnMobile
            leftSlot={
              <Button
                variant="outline"
                size="sm"
                className={MANAGEMENT_TOOLBAR_OUTLINE_BUTTON_CLASSNAME}
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                {isFetching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Yenile
              </Button>
            }
          />
        </CardHeader>
        <CardContent className={MANAGEMENT_LIST_CARD_CONTENT_CLASSNAME}>
          <div className={MANAGEMENT_LIST_TABLE_SHELL_CLASSNAME}>
            <ManagementDataTableChrome>
              <DataTableGrid<SalesDeskGroupDto, GroupColumnKey>
                columns={columns}
                visibleColumnKeys={columns.map((column) => column.key)}
                rows={pagedGroups}
                rowKey={(row) => row.id}
                renderCell={(row, key) => {
                  if (key === 'name') return <span className="font-semibold text-slate-100">{row.name}</span>;
                  if (key === 'description') {
                    return (
                      <span className="line-clamp-2 text-sm text-slate-400">
                        {row.description?.trim() || '-'}
                      </span>
                    );
                  }
                  if (key === 'memberCount') {
                    return (
                      <div className="flex justify-center">
                        <Badge
                          variant="outline"
                          className="min-w-[2rem] justify-center rounded-full border-violet-500/30 bg-violet-500/10 px-2.5 font-bold text-violet-300"
                        >
                          {row.memberCount}
                        </Badge>
                      </div>
                    );
                  }
                  if (key === 'updatedAt') return formatDate(row.updatedAt);
                  return '-';
                }}
                isLoading={isLoading}
                isError={isError}
                loadingText={t('common.loading', { defaultValue: 'Yukleniyor...' })}
                errorText={queryErrorMessage}
                emptyText="Henuz grup yok. Yeni Grup ile baslayin."
                minTableWidthClassName="min-w-[760px]"
                showActionsColumn
                actionsHeaderLabel={t('common.actions', { defaultValue: 'Islemler' })}
                renderActionsCell={renderGroupActions}
                initialActionsColumnWidth={Math.max(MANAGEMENT_TABLE_ACTIONS_COLUMN_WIDTH, 180)}
                onRowDoubleClick={handleDetailClick}
                mobileView={
                  <SalesDeskMobileCardList
                    columns={columns.map((column) => ({ key: column.key, label: column.label }))}
                    visibleColumnKeys={columns.map((column) => column.key)}
                    rows={pagedGroups}
                    rowKey={(row) => row.id}
                    renderCell={(row, key) => {
                      if (key === 'name') return <span className="font-semibold text-slate-100">{row.name}</span>;
                      if (key === 'description') return row.description?.trim() || '-';
                      if (key === 'memberCount') return row.memberCount;
                      if (key === 'updatedAt') return formatDate(row.updatedAt);
                      return '-';
                    }}
                    primaryKey="name"
                    detailKeys={['description', 'memberCount', 'updatedAt']}
                    renderActions={renderGroupActions}
                    onRowActivate={handleDetailClick}
                    isLoading={isLoading}
                    isError={isError}
                    errorText={queryErrorMessage}
                    emptyText="Henuz grup yok. Yeni Grup ile baslayin."
                    pageSize={pageSize}
                  />
                }
                pageSize={pageSize}
                pageSizeOptions={PAGE_SIZE_OPTIONS}
                onPageSizeChange={(size) => {
                  setPageSize(size);
                  setPageNumber(1);
                }}
                pageNumber={pageNumber}
                totalPages={totalPages}
                hasPreviousPage={pageNumber > 1}
                hasNextPage={pageNumber < totalPages}
                onPreviousPage={() => setPageNumber((page) => Math.max(1, page - 1))}
                onNextPage={() => setPageNumber((page) => Math.min(totalPages, page + 1))}
                previousLabel={t('common.previous', { defaultValue: 'Onceki' })}
                nextLabel={t('common.next', { defaultValue: 'Sonraki' })}
                paginationInfoText={`${totalCount === 0 ? 0 : (pageNumber - 1) * pageSize + 1}-${Math.min(pageNumber * pageSize, totalCount)} / ${totalCount}`}
                centerColumnHeaders
              />
            </ManagementDataTableChrome>
          </div>
        </CardContent>
      </Card>

      <SalesDeskGroupForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSubmit={handleFormSubmit}
        item={editingGroup}
        isLoading={formBusy}
        showMembers={canUpdate || canCreate}
      />

      <Dialog open={membersOpen} onOpenChange={setMembersOpen}>
        <DialogContent className={SD_DIALOG_CONTENT_FORM}>
          <DialogHeader className="border-b border-[var(--crm-app-border)] px-6 py-5">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              {membersGroup ? `${membersGroup.name} — Uye Yonetimi` : 'Uye Yonetimi'}
            </DialogTitle>
            <DialogDescription className="text-sm text-slate-400">
              Bu gruba dahil olacak kullanicilari secin.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto px-6 py-5">
            <SalesDeskGroupMemberSelect value={memberDraftIds} onChange={setMemberDraftIds} disabled={setMembers.isPending} />
            {memberDraftIds.length > 0 ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {memberDraftIds.map((id) => (
                  <Badge key={id} variant="outline" className="border-violet-500/30 bg-violet-500/10 text-violet-200">
                    {userNameById.get(id) ?? `Kullanici #${id}`}
                  </Badge>
                ))}
              </div>
            ) : null}
          </div>
          <DialogFooter className="flex flex-col-reverse gap-2 border-t border-[var(--crm-app-border)] px-4 py-4 sm:flex-row sm:px-6">
            <Button variant="outline" className="h-11 w-full sm:w-auto" onClick={() => setMembersOpen(false)} disabled={setMembers.isPending}>
              Iptal
            </Button>
            <Button className="h-11 w-full sm:w-auto" onClick={() => void handleMembersSave()} disabled={setMembers.isPending}>
              {setMembers.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                'Kaydet'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SalesDeskRecordDetailDialog
        open={detailOpen}
        onOpenChange={setDetailOpen}
        title="Grup Detay"
        description={detailGroup ? `${detailGroup.name} — grup bilgilerini goruntuluyorsunuz.` : undefined}
        columns={groupDetailColumns}
        row={detailGroup}
      />

      <SalesDeskDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Grubu sil"
        description={
          groupToDelete
            ? `"${groupToDelete.name}" grubunu silmek istediginize emin misiniz? Bu islem geri alinamaz.`
            : 'Bu islem geri alinamaz.'
        }
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteGroup.isPending}
      />
    </div>
  );
}
