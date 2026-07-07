import { type ReactElement, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskOpenItem,
  useDeleteSalesDeskTask,
  useSalesDeskCustomerOptions,
  useSalesDeskOpenItemsList,
  useUpdateSalesDeskTask,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { enumToSelectOptions, formatDate, NONE_SELECT_VALUE, optionalGroupNameFromSelect, withNoneOption } from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  openItemTaskFormSchema,
  toTaskFormValues,
  type TaskFormValues,
} from '../../types/salesdesk-schemas';
import { PriorityBadge, TaskStatusBadge } from './salesdesk-badges';
import {
  getOpenItemGroupSelectOptions,
  normalizeOpenItemGroupKey,
} from '../../lib/salesdesk-open-item-categories';

export function SalesDeskOpenItemsPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const groupFilter = searchParams.get('group');
  const authUser = useAuthStore((state) => state.user);
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskTaskDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskTaskDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'DueDate', sortDirection: 'asc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskOpenItemsList(listParams);
  const { data: customers } = useSalesDeskCustomerOptions();
  const createTask = useCreateSalesDeskOpenItem();
  const updateTask = useUpdateSalesDeskTask();
  const deleteTask = useDeleteSalesDeskTask();

  const rows = useMemo(() => {
    const allRows = data?.data ?? [];
    if (!groupFilter) return allRows;
    const filterKey = normalizeOpenItemGroupKey(groupFilter);
    return allRows.filter((item) => normalizeOpenItemGroupKey(item.groupName) === filterKey);
  }, [data?.data, groupFilter]);

  const visibleCount = rows.length;
  const listTotalCount = groupFilter ? visibleCount : (data?.totalCount ?? visibleCount);
  const listTotalPages = groupFilter
    ? Math.max(1, Math.ceil(visibleCount / listPage.pageSize))
    : Math.max(1, data?.totalPages ?? 1);
  const today = new Date().toISOString().slice(0, 10);
  const criticalCount = rows.filter((item) => item.priority === 4).length;
  const overdueCount = rows.filter(
    (item) => item.dueDate && item.dueDate.slice(0, 10) < today && item.status !== 3
  ).length;
  const dueTodayCount = rows.filter((item) => item.dueDate?.slice(0, 10) === today).length;

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );
  const groupOptions = useMemo(() => getOpenItemGroupSelectOptions(), []);
  const formDefaults = useMemo(
    () => ({
      ...toTaskFormValues(),
      groupName: groupFilter ?? '',
      status: '1',
    }),
    [groupFilter]
  );

  const handleSubmit = async (values: TaskFormValues): Promise<void> => {
    if (!optionalGroupNameFromSelect(values.groupName)) {
      toast.error('Grup secimi zorunludur.');
      throw new Error('Grup secimi zorunludur.');
    }

    const assignedUserId =
      values.assignedUserId && values.assignedUserId !== NONE_SELECT_VALUE
        ? values.assignedUserId
        : authUser?.id
          ? String(authUser.id)
          : NONE_SELECT_VALUE;

    if (!assignedUserId || assignedUserId === NONE_SELECT_VALUE) {
      toast.error('Atanan kullanici bulunamadi. Lutfen tekrar giris yapin.');
      throw new Error('Atanan kullanici bulunamadi.');
    }

    const payload: TaskFormValues = {
      ...values,
      assignedUserId,
    };

    if (editing) {
      await updateTask.mutateAsync({ id: editing.id, values: payload });
    } else {
      await createTask.mutateAsync(payload);
    }
    await refetch();
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-open-items"
      title={groupFilter ? `Acik Maddeler · ${groupFilter}` : 'Acik Maddeler'}
      subtitle={
        groupFilter
          ? `${groupFilter} grubundaki acik is ve aksiyonlar`
          : 'Takip edilmesi gereken is ve aksiyonlar'
      }
      tableTitle="Madde Listesi"
      actionLabel="Yeni Madde Ekle"
      icon={<FileText size={22} />}
      metrics={[
        { label: 'Acik', value: listTotalCount },
        { label: 'Bugun Bitmeli', value: dueTodayCount, tone: 'yellow' },
        { label: 'Gecikmis', value: overdueCount, tone: 'red' },
        { label: 'Kritik', value: criticalCount, tone: 'red' },
      ]}
      columns={[
        { key: 'title', header: 'BASLIK', render: (row) => row.title },
        { key: 'priority', header: 'ONCELIK', render: (row) => <PriorityBadge priority={row.priority} /> },
        { key: 'status', header: 'DURUM', render: (row) => <TaskStatusBadge status={row.status} /> },
        { key: 'dueDate', header: 'SON TARIH', render: (row) => formatDate(row.dueDate) },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName || '-' },
      ]}
      rows={rows}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      error={error as Error | null}
      searchTerm={listPage.searchTerm}
      onSearchChange={listPage.setSearchTerm}
      pageSize={listPage.pageSize}
      onPageSizeChange={listPage.setPageSize}
      pageNumber={listPage.pageNumber}
      totalPages={listTotalPages}
      totalCount={listTotalCount}
      onPageChange={listPage.setPageNumber}
      onRefresh={() => refetch()}
      onAdd={() => {
        setEditing(null);
        setFormOpen(true);
      }}
      onEdit={(row) => {
        setEditing(row);
        setFormOpen(true);
      }}
      onDeleteRequest={setDeleting}
      deletingRow={deleting}
      onDeleteConfirm={async () => {
        if (!deleting) return;
        await deleteTask.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteTask.isPending}
      deleteTitle="Maddeyi sil"
      deleteLabel={(row) => row.title}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Maddeyi Duzenle' : 'Yeni Madde'}
          description="Grup secimi dashboard kartina yonlendirir (or. Proje, Destek, Yazilim)."
          schema={openItemTaskFormSchema}
          defaultValues={formDefaults}
          entity={editing}
          mapEntityToForm={(entity) => toTaskFormValues(entity as SalesDeskTaskDto)}
          onSubmit={handleSubmit}
          isLoading={createTask.isPending || updateTask.isPending}
          fields={[
            { name: 'title', label: 'Baslik', required: true, colSpan: 2 },
            {
              name: 'groupName',
              label: 'Grup',
              type: 'select',
              options: groupOptions,
              placeholder: 'Grup secin (dashboard karti)',
              required: true,
            },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
            { name: 'priority', label: 'Oncelik', type: 'select', options: enumToSelectOptions(PRIORITY_LABELS), required: true },
            { name: 'status', label: 'Durum', type: 'select', options: enumToSelectOptions(TASK_STATUS_LABELS), required: true },
            { name: 'dueDate', label: 'Son Tarih', type: 'date' },
            { name: 'description', label: 'Aciklama', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
