import { type ReactElement, useMemo, useState } from 'react';
import { Mail } from 'lucide-react';
import type { SalesDeskGmailMessageDto } from '../../api/salesdesk-api';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskGmail,
  useDeleteSalesDeskGmail,
  useSalesDeskGmailList,
  useSalesDeskGmailStats,
  useUpdateSalesDeskGmail,
} from '../../hooks/useSalesDeskModules';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import { formatDate } from '../../lib/salesdesk-shared';
import {
  gmailFormSchema,
  toGmailFormValues,
  type GmailFormValues,
} from '../../types/salesdesk-schemas';
import { UnreadBadge } from './salesdesk-badges';

export function SalesDeskGmailPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskGmailMessageDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskGmailMessageDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'ReceivedAt', sortDirection: 'desc' }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskGmailList(listParams);
  const { data: statsData } = useSalesDeskGmailStats();
  const createGmail = useCreateSalesDeskGmail();
  const updateGmail = useUpdateSalesDeskGmail();
  const deleteGmail = useDeleteSalesDeskGmail();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const meetingCount = statsRows.filter((item) => item.isMeeting).length;

  const handleSubmit = async (values: GmailFormValues): Promise<void> => {
    if (editing) {
      await updateGmail.mutateAsync({ id: editing.id, values });
      return;
    }
    await createGmail.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-gmail"
      title="Gmail"
      subtitle="Bagli Gmail hesabinizdan gelen kutusunu Sales Desk icinde goruntuleyin"
      tableTitle="Gelen Kutusu"
      actionLabel="Yeni Kayit"
      icon={<Mail size={22} />}
      metrics={[
        { label: 'Toplam', value: statsData?.totalCount ?? 0 },
        { label: 'Okunmamis', value: statsRows.filter((item) => item.isUnread).length, tone: 'yellow' },
        { label: 'Toplanti', value: meetingCount, tone: 'green' },
        { label: 'Listelenen', value: rows.length },
      ]}
      columns={[
        { key: 'sender', header: 'GONDEREN', render: (row) => row.sender },
        { key: 'subject', header: 'KONU', render: (row) => row.subject },
        { key: 'isMeeting', header: 'TOPLANTI', render: (row) => (row.isMeeting ? 'Evet' : '-') },
        { key: 'receivedAt', header: 'TARIH', render: (row) => formatDate(row.receivedAt) },
        { key: 'preview', header: 'ONIZLEME', render: (row) => row.preview?.slice(0, 40) || '-' },
        { key: 'isUnread', header: 'DURUM', render: (row) => <UnreadBadge isUnread={row.isUnread} /> },
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
        await deleteGmail.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteGmail.isPending}
      deleteLabel={(row) => row.subject}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Mesaji Duzenle' : 'Yeni Gmail Kaydi'}
          description="Gmail mesaj bilgilerini girin."
          schema={gmailFormSchema}
          defaultValues={toGmailFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toGmailFormValues(entity as SalesDeskGmailMessageDto)}
          onSubmit={handleSubmit}
          isLoading={createGmail.isPending || updateGmail.isPending}
          fields={[
            { name: 'gmailMessageId', label: 'Mesaj ID', required: true },
            { name: 'sender', label: 'Gonderen', required: true },
            { name: 'subject', label: 'Konu', required: true, colSpan: 2 },
            { name: 'receivedAt', label: 'Alim Tarihi', type: 'date', required: true },
            { name: 'threadId', label: 'Thread ID' },
            { name: 'preview', label: 'Onizleme', type: 'textarea', colSpan: 2 },
            { name: 'isUnread', label: 'Okunmadi', type: 'checkbox' },
            { name: 'isMeeting', label: 'Toplanti', type: 'checkbox' },
          ]}
        />
      }
    />
  );
}
