import { type ReactElement } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/stores/auth-store';
import { SalesDeskVisitFormEditor } from '../visit-forms/SalesDeskVisitFormEditor';
import {
  useCreateSalesDeskVisitForm,
  useSalesDeskCustomerOptions,
  useSalesDeskVisitForm,
  useUpdateSalesDeskVisitForm,
} from '../../hooks/useSalesDeskModules';
import type { VisitFormRecordValues } from '../../types/salesdesk-schemas';
import { salesDeskPageShellClass } from '../../lib/salesdesk-shared';

export function SalesDeskVisitFormCreatePage(): ReactElement {
  const navigate = useNavigate();
  const authUser = useAuthStore((state) => state.user);
  const createForm = useCreateSalesDeskVisitForm();
  const { data: customers, isPending: customersPending } = useSalesDeskCustomerOptions();

  const handleSubmit = async (values: VisitFormRecordValues): Promise<void> => {
    await createForm.mutateAsync(values);
    navigate('/salesdesk/visit-forms');
  };

  return (
    <div className={salesDeskPageShellClass}>
      <button
        type="button"
        onClick={() => navigate('/salesdesk/visit-forms')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--crm-brand-accent)] transition-colors hover:text-[var(--crm-brand-primary)]"
      >
        <ArrowLeft size={16} />
        Ziyaret formlarina don
      </button>

      <SalesDeskVisitFormEditor
        customers={customers ?? []}
        customersLoading={customersPending}
        visitorName={authUser?.name || authUser?.email || 'Sistem Yoneticisi'}
        isSaving={createForm.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/salesdesk/visit-forms')}
      />
    </div>
  );
}

export function SalesDeskVisitFormEditPage(): ReactElement {
  const navigate = useNavigate();
  const params = useParams();
  const formId = Number(params.id);
  const authUser = useAuthStore((state) => state.user);
  const updateForm = useUpdateSalesDeskVisitForm();
  const { data: customers, isPending: customersPending } = useSalesDeskCustomerOptions();
  const { data: entity, isPending, isError, error } = useSalesDeskVisitForm(Number.isFinite(formId) ? formId : null);

  const handleSubmit = async (values: VisitFormRecordValues): Promise<void> => {
    if (!entity) return;
    await updateForm.mutateAsync({ id: entity.id, values });
    navigate('/salesdesk/visit-forms');
  };

  if (!Number.isFinite(formId) || formId <= 0) {
    return (
      <div className={salesDeskPageShellClass}>
        <p className="text-sm text-rose-500">Gecersiz form kaydi.</p>
      </div>
    );
  }

  if (isPending) {
    return (
      <div className={`${salesDeskPageShellClass} flex min-h-[320px] items-center justify-center gap-2 text-sm text-[var(--crm-app-text-muted)]`}>
        <Loader2 size={18} className="animate-spin" />
        Form yukleniyor...
      </div>
    );
  }

  if (isError || !entity) {
    return (
      <div className={salesDeskPageShellClass}>
        <p className="text-sm text-rose-500">{(error as Error)?.message || 'Form bulunamadi.'}</p>
        <button
          type="button"
          onClick={() => navigate('/salesdesk/visit-forms')}
          className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--crm-brand-accent)]"
        >
          <ArrowLeft size={16} />
          Listeye don
        </button>
      </div>
    );
  }

  return (
    <div className={salesDeskPageShellClass}>
      <button
        type="button"
        onClick={() => navigate('/salesdesk/visit-forms')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-[var(--crm-brand-accent)] transition-colors hover:text-[var(--crm-brand-primary)]"
      >
        <ArrowLeft size={16} />
        Ziyaret formlarina don
      </button>

      <SalesDeskVisitFormEditor
        customers={customers ?? []}
        customersLoading={customersPending}
        entity={entity}
        visitorName={authUser?.name || authUser?.email || 'Sistem Yoneticisi'}
        isSaving={updateForm.isPending}
        onSubmit={handleSubmit}
        onCancel={() => navigate('/salesdesk/visit-forms')}
      />
    </div>
  );
}
