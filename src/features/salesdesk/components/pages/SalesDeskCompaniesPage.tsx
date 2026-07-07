import { type ReactElement, useMemo, useState } from 'react';
import { Building2, Globe, KeyRound, Network, Server } from 'lucide-react';
import type { SalesDeskCompanyDto } from '../../types/company-management-types';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout } from '../SalesDeskListLayout';
import {
  useCreateSalesDeskCompany,
  useDeleteSalesDeskCompany,
  useSalesDeskCompanyList,
  useSalesDeskCompanyStats,
  useUpdateSalesDeskCompany,
} from '../../hooks/useSalesDeskCompanies';
import { useSalesDeskListPage } from '../../hooks/useSalesDeskListPage';
import {
  maskSecret,
  salesDeskCompanyFormSchema,
  toCompanyFormValues,
  type SalesDeskCompanyFormValues,
} from '../../types/company-management-types';

function renderLink(value?: string | null): ReactElement | string {
  const trimmed = value?.trim();
  if (!trimmed) return '-';
  const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="text-[var(--crm-brand-text)] underline-offset-2 hover:underline"
    >
      {trimmed}
    </a>
  );
}

export function SalesDeskCompaniesPage(): ReactElement {
  const listPage = useSalesDeskListPage();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<SalesDeskCompanyDto | null>(null);
  const [deleting, setDeleting] = useState<SalesDeskCompanyDto | null>(null);

  const listParams = useMemo(
    () => ({ ...listPage.listParams, sortBy: 'Name', sortDirection: 'asc' as const }),
    [listPage.listParams]
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useSalesDeskCompanyList(listParams);
  const { data: statsData } = useSalesDeskCompanyStats();
  const createCompany = useCreateSalesDeskCompany();
  const updateCompany = useUpdateSalesDeskCompany();
  const deleteCompany = useDeleteSalesDeskCompany();

  const rows = data?.data ?? [];
  const statsRows = statsData?.data ?? [];
  const withVpnCount = statsRows.filter((item) => item.vpnName.trim() || item.vpnIpAddress.trim()).length;
  const withDbCount = statsRows.filter((item) => item.databaseUsername.trim()).length;

  const handleSubmit = async (values: SalesDeskCompanyFormValues): Promise<void> => {
    if (editing) {
      await updateCompany.mutateAsync({ id: editing.id, values });
      return;
    }
    await createCompany.mutateAsync(values);
  };

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-companies"
      title="Sirket Yonetimi"
      subtitle="Musteri sirketlerinin IP, VPN, veritabani ve erisim bilgileri"
      tableTitle="Sirket Listesi"
      actionLabel="Yeni Sirket Ekle"
      icon={<Building2 size={22} />}
      exportFileName="sirket-yonetimi"
      metrics={[
        { label: 'Toplam Sirket', value: statsData?.totalCount ?? 0, tone: 'blue' },
        { label: 'VPN Tanimli', value: withVpnCount, tone: 'violet' },
        { label: 'DB Erisimi', value: withDbCount, tone: 'green' },
      ]}
      columns={[
        { key: 'name', header: 'SIRKET ADI', render: (row) => <span className="font-semibold">{row.name}</span> },
        { key: 'ipAddress', header: 'IP BILGISI', render: (row) => row.ipAddress || '-' },
        { key: 'ipUsername', header: 'IP KULLANICI ADI', render: (row) => row.ipUsername || '-' },
        { key: 'ipPassword', header: 'IP KULLANICI SIFRESI', render: (row) => maskSecret(row.ipPassword) },
        { key: 'vpnName', header: 'VPN ISMI', render: (row) => row.vpnName || '-' },
        { key: 'vpnUsername', header: 'VPN KULLANICI ADI', render: (row) => row.vpnUsername || '-' },
        { key: 'vpnPassword', header: 'VPN KULLANICI SIFRESI', render: (row) => maskSecret(row.vpnPassword) },
        { key: 'vpnIpAddress', header: 'VPN IP ADRESI', render: (row) => row.vpnIpAddress || '-' },
        { key: 'vpnPort', header: 'VPN PORT', render: (row) => row.vpnPort || '-' },
        { key: 'databaseUsername', header: 'DB KULLANICI ADI', render: (row) => row.databaseUsername || '-' },
        { key: 'databasePassword', header: 'DB KULLANICI SIFRE', render: (row) => maskSecret(row.databasePassword) },
        { key: 'loginUrl', header: 'GIRIS LINKI', render: (row) => renderLink(row.loginUrl) },
        { key: 'description', header: 'ACIKLAMA', render: (row) => row.description || '-' },
        { key: 'description1', header: 'ACIKLAMA 1', render: (row) => row.description1 || '-' },
      ]}
      rows={rows}
      isLoading={isLoading && !isError}
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
        await deleteCompany.mutateAsync(deleting.id);
        setDeleting(null);
      }}
      onDeleteCancel={() => setDeleting(null)}
      isDeleting={deleteCompany.isPending}
      deleteTitle="Sirketi sil"
      deleteLabel={(row) => row.name}
      minTableWidthClassName="min-w-[2200px]"
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Sirketi Duzenle' : 'Yeni Sirket'}
          description="Musteri sirketine ait erisim ve baglanti bilgilerini girin."
          schema={salesDeskCompanyFormSchema}
          defaultValues={toCompanyFormValues()}
          entity={editing}
          mapEntityToForm={(entity) => toCompanyFormValues(entity as SalesDeskCompanyDto)}
          onSubmit={handleSubmit}
          isLoading={createCompany.isPending || updateCompany.isPending}
          icon={Building2}
          fields={[
            { name: 'name', label: 'Sirket Adi', required: true, colSpan: 2, icon: Building2 },
            { name: 'ipAddress', label: 'IP Bilgisi', icon: Network },
            { name: 'ipUsername', label: 'IP Kullanici Adi', icon: Server },
            { name: 'ipPassword', label: 'IP Kullanici Sifresi', icon: KeyRound },
            { name: 'vpnName', label: 'VPN Ismi', icon: Network },
            { name: 'vpnUsername', label: 'VPN Kullanici Adi', icon: Server },
            { name: 'vpnPassword', label: 'VPN Kullanici Sifresi', icon: KeyRound },
            { name: 'vpnIpAddress', label: 'VPN IP Adresi', icon: Network },
            { name: 'vpnPort', label: 'VPN Port' },
            { name: 'databaseUsername', label: 'Database Kullanici Adi', icon: Server },
            { name: 'databasePassword', label: 'Database Kullanici Sifre', icon: KeyRound },
            { name: 'loginUrl', label: 'Giris Linki', colSpan: 2, icon: Globe },
            { name: 'description', label: 'Aciklama', type: 'textarea', colSpan: 2 },
            { name: 'description1', label: 'Aciklama 1', type: 'textarea', colSpan: 2 },
          ]}
        />
      }
    />
  );
}
