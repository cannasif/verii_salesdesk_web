import { type ReactElement, useMemo, useState } from 'react';
import { Building2, Globe, KeyRound, Network, Server } from 'lucide-react';
import type { SalesDeskCompanyDto } from '../../types/company-management-types';
import { SalesDeskEntityForm } from '../SalesDeskEntityForm';
import { SalesDeskListLayout, type SalesDeskColumn } from '../SalesDeskListLayout';
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

const COMPANY_TABLE_COLUMN_KEYS = ['name', 'ipAddress', 'vpnPassword', 'loginUrl', 'description'] as const;

const COMPANY_DETAIL_COLUMN_KEYS = [
  'name',
  'ipAddress',
  'ipUsername',
  'ipPassword',
  'vpnName',
  'vpnUsername',
  'vpnPassword',
  'vpnIpAddress',
  'vpnPort',
  'databaseUsername',
  'databasePassword',
  'loginUrl',
  'description',
  'description1',
] as const;

function buildCompanyColumns(): SalesDeskColumn<SalesDeskCompanyDto>[] {
  const allColumns: SalesDeskColumn<SalesDeskCompanyDto>[] = [
    { key: 'name', header: 'ŞİRKET ADI', render: (row) => <span className="font-semibold">{row.name}</span> },
    { key: 'ipAddress', header: 'IP BİLGİSİ', render: (row) => row.ipAddress || '-' },
    { key: 'ipUsername', header: 'IP KULLANICI ADI', render: (row) => row.ipUsername || '-' },
    { key: 'ipPassword', header: 'IP KULLANICI ŞİFRESİ', render: (row) => maskSecret(row.ipPassword) },
    { key: 'vpnName', header: 'VPN İSMİ', render: (row) => row.vpnName || '-' },
    { key: 'vpnUsername', header: 'VPN KULLANICI ADI', render: (row) => row.vpnUsername || '-' },
    { key: 'vpnPassword', header: 'VPN ŞİFRE', render: (row) => maskSecret(row.vpnPassword) },
    { key: 'vpnIpAddress', header: 'VPN IP ADRESİ', render: (row) => row.vpnIpAddress || '-' },
    { key: 'vpnPort', header: 'VPN PORT', render: (row) => row.vpnPort || '-' },
    { key: 'databaseUsername', header: 'DATABASE KULLANICI ADI', render: (row) => row.databaseUsername || '-' },
    { key: 'databasePassword', header: 'DATABASE KULLANICI ŞİFRE', render: (row) => maskSecret(row.databasePassword) },
    { key: 'loginUrl', header: 'GİRİŞ LİNKİ', render: (row) => renderLink(row.loginUrl) },
    { key: 'description', header: 'AÇIKLAMA', render: (row) => row.description || '-' },
    { key: 'description1', header: 'AÇIKLAMA 1', render: (row) => row.description1 || '-' },
  ];

  return allColumns;
}

function pickCompanyColumns(
  keys: readonly string[],
  allColumns: SalesDeskColumn<SalesDeskCompanyDto>[]
): SalesDeskColumn<SalesDeskCompanyDto>[] {
  return keys
    .map((key) => allColumns.find((column) => column.key === key))
    .filter((column): column is SalesDeskColumn<SalesDeskCompanyDto> => column != null);
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

  const companyColumns = useMemo(() => buildCompanyColumns(), []);
  const tableColumns = useMemo(
    () => pickCompanyColumns(COMPANY_TABLE_COLUMN_KEYS, companyColumns),
    [companyColumns]
  );
  const detailColumns = useMemo(() => companyColumns, [companyColumns]);

  return (
    <SalesDeskListLayout
      pageKey="salesdesk-companies"
      title="Sirket Yonetimi"
      subtitle="Musteri sirketlerinin IP, VPN, veritabani ve erisim bilgileri"
      tableTitle="Sirket Listesi"
      enableCellCopyButton
      actionLabel="Yeni Sirket Ekle"
      icon={<Building2 size={22} />}
      exportFileName="sirket-yonetimi"
      metrics={[
        { label: 'Toplam Sirket', value: statsData?.totalCount ?? 0, tone: 'blue' },
        { label: 'VPN Tanimli', value: withVpnCount, tone: 'violet' },
        { label: 'DB Erisimi', value: withDbCount, tone: 'green' },
      ]}
      columns={tableColumns}
      detailColumns={detailColumns}
      detailColumnKeys={[...COMPANY_DETAIL_COLUMN_KEYS]}
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
      minTableWidthClassName="min-w-[960px]"
      mobilePrimaryKey="name"
      mobileDetailKeys={['ipAddress', 'vpnPassword', 'loginUrl', 'description']}
      formDialog={
        <SalesDeskEntityForm
          open={formOpen}
          onOpenChange={setFormOpen}
          title={editing ? 'Sirketi Duzenle' : 'Yeni Sirket'}
          description="Musteri sirketine ait erisim ve baglanti bilgilerini girin."
          maxWidthClass="!max-w-[960px]"
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
