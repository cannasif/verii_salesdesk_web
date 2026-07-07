import { type ReactElement, useMemo, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth-store';
import type { SalesDeskTaskDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskActivity,
  useDeleteSalesDeskActivity,
  useSalesDeskActivitiesList,
  useSalesDeskCustomerOptions,
  useSalesDeskUserOptions,
  useUpdateSalesDeskActivity,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { getSalesDeskActivityTypeOptions, parseSalesDeskActivityType } from '../../lib/salesdesk-activities';
import { enumToSelectOptions, formatDate, NONE_SELECT_VALUE, withNoneOption } from '../../lib/salesdesk-shared';
import { PRIORITY_LABELS, TASK_STATUS_LABELS } from '../../lib/salesdesk-labels';
import {
  salesDeskActivityFormSchema,
  toSalesDeskActivityFormValues,
  type SalesDeskActivityFormValues,
} from '../../types/salesdesk-schemas';
import { PriorityBadge, TaskStatusBadge } from './salesdesk-badges';

export function SalesDeskActivitiesPage(): ReactElement {
  const authUser = useAuthStore((state) => state.user);
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskTaskDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskTaskDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'DueDate', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isPending, isFetching, isError, error, refetch } = useSalesDeskActivitiesList(listParams);
  const { data: customers } = useSalesDeskCustomerOptions();
  const { data: users } = useSalesDeskUserOptions();
  const createActivity = useCreateSalesDeskActivity();
  const updateActivity = useUpdateSalesDeskActivity();
  const deleteActivity = useDeleteSalesDeskActivity();

  const userNameById = useMemo(() => {
    const map = new Map<number, string>();
    (users ?? []).forEach((user) => map.set(user.id, user.name));
    return map;
  }, [users]);

  const rows = data?.data ?? [];
  const activityStats = data?.activityStats;
  const todayCount = activityStats?.today ?? 0;
  const plannedCount = activityStats?.planned ?? 0;
  const completedCount = activityStats?.completed ?? 0;
  const listError = isError ? (error as Error | null) : null;

  const customerOptions = withNoneOption(
    (customers ?? []).map((item) => ({ value: String(item.id), label: item.name }))
  );
  const activityTypeOptions = useMemo(() => getSalesDeskActivityTypeOptions(), []);

  const handleSubmit = async (values: SalesDeskActivityFormValues): Promise<void> => {
    if (!values.title?.trim()) {
      toast.error('Konu zorunludur.');
      throw new Error('Konu zorunludur.');
    }
    if (!values.activityType || values.activityType === NONE_SELECT_VALUE) {
      toast.error('Tip secin.');
      throw new Error('Tip secin.');
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

    const payload: SalesDeskActivityFormValues = {
      ...values,
      assignedUserId,
    };

    if (editing) {
      await updateActivity.mutateAsync({ id: editing.id, values: payload });
    } else {
      await createActivity.mutateAsync(payload);
    }
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-activities"
      title="Aktiviteler"
      subtitle="Planlanan gorusmeler, aramalar ve takip kayitlari"
      tableTitle="Aktivite Listesi"
      actionLabel="Yeni Aktivite Ekle"
      icon={<ClipboardList size={22} />}
      metrics={[
        { label: 'Toplam', value: data?.totalCount ?? rows.length },
        { label: 'Bugun', value: todayCount, tone: 'cyan' },
        { label: 'Acik / Devam', value: plannedCount, tone: 'yellow' },
        { label: 'Tamamlandi', value: completedCount, tone: 'green' },
      ]}
      columns={[
        { key: 'title', header: 'KONU', render: (row) => row.title },
        {
          key: 'activityType',
          header: 'TIP',
          render: (row) => parseSalesDeskActivityType(row.groupName) || '-',
        },
        { key: 'status', header: 'DURUM', render: (row) => <TaskStatusBadge status={row.status} /> },
        { key: 'priority', header: 'ONCELIK', render: (row) => <PriorityBadge priority={row.priority} /> },
        {
          key: 'assignedUser',
          header: 'ATANAN',
          render: (row) =>
            row.assignedUserId ? userNameById.get(row.assignedUserId) ?? `#${row.assignedUserId}` : '-',
        },
        { key: 'customer', header: 'CARI', render: (row) => row.customerName || '-' },
        { key: 'dueDate', header: 'TARIH', render: (row) => formatDate(row.dueDate) },
      ]}
      rows={rows}
      isLoading={isPending && !isError}
      isFetching={isFetching}
      isError={isError}
      error={listError}
      searchTerm={listPage.searchTerm}
      onSearchChange={listPage.setSearchTerm}
      pageSize={listPage.pageSize}
      onPageSizeChange={listPage.setPageSize}
      pageNumber={listPage.pageNumber}
      totalPages={Math.max(1, data?.totalPages ?? 1)}
      totalCount={data?.totalCount ?? 0}
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
        await deleteActivity.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteActivity.isPending}
      deleteTitle="Aktiviteyi sil"
      deleteLabel={(row) => row.title}
      mobilePrimaryKey="title"
      mobileDetailKeys={['activityType', 'status', 'priority', 'assignedUser', 'customer', 'dueDate']}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Aktiviteyi Duzenle' : 'Yeni Aktivite'}
          description="Toplanti, arama ve saha ziyareti gibi aktiviteleri planlayin."
          schema={salesDeskActivityFormSchema}
          defaultValues={toSalesDeskActivityFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toSalesDeskActivityFormValues(entity as SalesDeskTaskDto)}
          onSubmit={handleSubmit}
          isLoading={createActivity.isPending || updateActivity.isPending}
          validateMode="onSubmit"
          fields={[
            { name: 'title', label: 'Konu', required: true, colSpan: 2 },
            {
              name: 'activityType',
              label: 'Tip',
              type: 'select',
              options: activityTypeOptions,
              placeholder: 'Aktivite tipi secin',
              required: true,
            },
            { name: 'customerId', label: 'Cari', type: 'select', options: customerOptions },
            {
              name: 'priority',
              label: 'Oncelik',
              type: 'select',
              options: enumToSelectOptions(PRIORITY_LABELS),
              required: true,
            },
            {
              name: 'status',
              label: 'Durum',
              type: 'select',
              options: enumToSelectOptions(TASK_STATUS_LABELS),
              required: true,
            },
            { name: 'dueDate', label: 'Tarih', type: 'date' },
            { name: 'description', label: 'Aciklama', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
